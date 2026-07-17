"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  DetectedIssue,
  RepairPlan,
  DiffHunk,
  ChatMessage,
  mockIssues,
  mockRepairPlans,
  mockDiffs,
  initialChatMessages,
  featureRequestResponse,
  terminalOutputBefore,
  terminalOutputAfter,
} from "@/lib/mockData";

export type ActivityView = "explorer" | "diagnostics" | "repairs" | "reports" | "settings";
export type BottomTab = "terminal" | "diagnostics" | "verification";
export type RepairPhase = "idle" | "diagnosing" | "diagnosed" | "planning" | "preview" | "applying" | "verifying" | "verified";
export type VerificationStatus = "pending" | "failed" | "passed";

interface WorkspaceContextValue {
  openTabs: string[];
  activeFile: string;
  setActiveFile: (path: string) => void;
  openFile: (path: string) => void;
  closeTab: (path: string) => void;
  activityView: ActivityView;
  setActivityView: (view: ActivityView) => void;
  bottomTab: BottomTab;
  setBottomTab: (tab: BottomTab) => void;
  issues: DetectedIssue[];
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  repairPhase: RepairPhase;
  verificationStatus: VerificationStatus;
  fixedIssueIds: string[];
  currentRepairPlan: RepairPlan | null;
  currentDiff: DiffHunk | null;
  chatMessages: ChatMessage[];
  terminalOutput: string;
  showRepairReport: boolean;
  setShowRepairReport: (show: boolean) => void;
  diagnose: () => void;
  fixSelectedIssue: () => void;
  fixAllIssues: () => void;
  applyPatch: () => void;
  cancelRepair: () => void;
  sendChatMessage: (text: string) => void;
  handleQuickAction: (action: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [openTabs, setOpenTabs] = useState<string[]>(["src/App.tsx"]);
  const [activeFile, setActiveFileState] = useState("src/App.tsx");
  const [activityView, setActivityView] = useState<ActivityView>("explorer");
  const [bottomTab, setBottomTab] = useState<BottomTab>("terminal");
  const [issues, setIssues] = useState<DetectedIssue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [repairPhase, setRepairPhase] = useState<RepairPhase>("idle");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("pending");
  const [fixedIssueIds, setFixedIssueIds] = useState<string[]>([]);
  const [currentRepairPlan, setCurrentRepairPlan] = useState<RepairPlan | null>(null);
  const [currentDiff, setCurrentDiff] = useState<DiffHunk | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [terminalOutput, setTerminalOutput] = useState(terminalOutputBefore);
  const [showRepairReport, setShowRepairReport] = useState(false);
  const [pendingFixAll, setPendingFixAll] = useState(false);
  const [fixAllQueue, setFixAllQueue] = useState<string[]>([]);

  const setActiveFile = useCallback((path: string) => {
    setActiveFileState(path);
  }, []);

  const openFile = useCallback((path: string) => {
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setActiveFileState(path);
  }, []);

  const closeTab = useCallback((path: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((p) => p !== path);
      if (path === activeFile && next.length > 0) {
        setActiveFileState(next[next.length - 1]);
      }
      return next.length > 0 ? next : prev;
    });
  }, [activeFile]);

  const diagnose = useCallback(() => {
    setRepairPhase("diagnosing");
    setBottomTab("diagnostics");
    setTimeout(() => {
      setIssues(mockIssues.map((i) => ({ ...i, status: "detected" as const })));
      setRepairPhase("diagnosed");
      setActivityView("diagnostics");
      setSelectedIssueId("issue-1");
    }, 1500);
  }, []);

  const startRepairForIssue = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setRepairPhase("planning");
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: "repairing" } : i))
    );
    setTimeout(() => {
      setCurrentRepairPlan(mockRepairPlans[issueId] ?? null);
      setCurrentDiff(mockDiffs[issueId] ?? null);
      setRepairPhase("preview");
      const plan = mockRepairPlans[issueId];
      if (plan?.filesChanged[0]) {
        openFile(plan.filesChanged[0]);
      }
    }, 800);
  }, [openFile]);

  const fixSelectedIssue = useCallback(() => {
    if (!selectedIssueId) return;
    startRepairForIssue(selectedIssueId);
  }, [selectedIssueId, startRepairForIssue]);

  const fixAllIssues = useCallback(() => {
    const ids = mockIssues.map((i) => i.id);
    setPendingFixAll(true);
    setFixAllQueue(ids.slice(1));
    startRepairForIssue(ids[0]);
  }, [startRepairForIssue]);

  const applyPatch = useCallback(() => {
    if (!selectedIssueId) return;
    setRepairPhase("applying");
    setTimeout(() => {
      setRepairPhase("verifying");
      setBottomTab("verification");
      setVerificationStatus("pending");
      setTimeout(() => {
        setVerificationStatus("passed");
        setRepairPhase("verified");
        setFixedIssueIds((prev) => [...new Set([...prev, selectedIssueId])]);
        setIssues((prev) =>
          prev.map((i) =>
            i.id === selectedIssueId ? { ...i, status: "verified" } : i
          )
        );
        setTerminalOutput(terminalOutputAfter);

        if (pendingFixAll && fixAllQueue.length > 0) {
          const [next, ...rest] = fixAllQueue;
          setFixAllQueue(rest);
          setRepairPhase("idle");
          setCurrentRepairPlan(null);
          setCurrentDiff(null);
          setTimeout(() => startRepairForIssue(next), 500);
        } else {
          setPendingFixAll(false);
          setFixAllQueue([]);
        }
      }, 2000);
    }, 1000);
  }, [selectedIssueId, pendingFixAll, fixAllQueue, startRepairForIssue]);

  const cancelRepair = useCallback(() => {
    setRepairPhase("diagnosed");
    setCurrentRepairPlan(null);
    setCurrentDiff(null);
    if (selectedIssueId) {
      setIssues((prev) =>
        prev.map((i) =>
          i.id === selectedIssueId && i.status === "repairing"
            ? { ...i, status: "detected" }
            : i
        )
      );
    }
  }, [selectedIssueId]);

  const sendChatMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let response: string;

      if (
        lower.includes("new feature") ||
        lower.includes("add a feature") ||
        lower.includes("build a feature") ||
        lower.includes("redesign") ||
        lower.includes("rewrite the app") ||
        lower.includes("create new product")
      ) {
        response = featureRequestResponse;
      } else if (lower.includes("why") || lower.includes("root cause")) {
        response =
          "The build is failing because src/App.tsx imports ProjectCard from './components/ProjectsCard', but the actual file is ProjectCard.tsx. This is a reproducible module resolution failure.";
      } else if (lower.includes("fix") || lower.includes("patch")) {
        response =
          "I recommend a minimal patch: change the import to './components/ProjectCard'. Repair boundary: import path only. Verification: npm run build.";
      } else {
        response =
          "I can help diagnose reproducible failures, propose minimal patches, and verify repairs. Select an issue from the panel or ask about a specific failure.";
      }

      const guardianMsg: ChatMessage = {
        id: `msg-${Date.now()}-g`,
        role: "guardian",
        content: response,
      };
      setChatMessages((prev) => [...prev, guardianMsg]);
    }, 600);
  }, []);

  const handleQuickAction = useCallback(
    (action: string) => {
      const prompts: Record<string, string> = {
        "Explain root cause": "Why is the build failing? Explain the root cause.",
        "Propose minimal fix": "Propose a minimal fix for the selected issue.",
        "Show affected files": "Which files are affected by this issue?",
        "Verify fix": "How will you verify this fix?",
      };
      sendChatMessage(prompts[action] ?? action);
    },
    [sendChatMessage]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        openTabs,
        activeFile,
        setActiveFile,
        openFile,
        closeTab,
        activityView,
        setActivityView,
        bottomTab,
        setBottomTab,
        issues,
        selectedIssueId,
        setSelectedIssueId,
        repairPhase,
        verificationStatus,
        fixedIssueIds,
        currentRepairPlan,
        currentDiff,
        chatMessages,
        terminalOutput,
        showRepairReport,
        setShowRepairReport,
        diagnose,
        fixSelectedIssue,
        fixAllIssues,
        applyPatch,
        cancelRepair,
        sendChatMessage,
        handleQuickAction,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
