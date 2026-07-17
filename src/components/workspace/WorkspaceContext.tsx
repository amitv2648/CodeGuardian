"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  DEMO_REPO_NAME,
  DetectedIssue,
  RepairPlan,
  DiffHunk,
  ChatMessage,
  FileNode,
  cloneMockFileTree,
  cloneMockFileContents,
  extractRepoNameFromUrl,
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
export type RepoSource = "none" | "demo" | "github";

interface WorkspaceContextValue {
  repoName: string | null;
  repoSource: RepoSource;
  isCloningRepo: boolean;
  fileTree: FileNode[];
  fileContents: Record<string, string>;
  openTabs: string[];
  activeFile: string | null;
  setActiveFile: (path: string | null) => void;
  openFile: (path: string) => void;
  closeTab: (path: string) => void;
  updateFileContent: (path: string, content: string | undefined) => void;
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
  loadDemoRepo: () => void;
  cloneGithubRepo: (url: string) => Promise<boolean>;
  resetWorkspace: () => void;
  diagnose: () => void;
  fixSelectedIssue: () => void;
  fixAllIssues: () => void;
  applyPatch: () => void;
  cancelRepair: () => void;
  sendChatMessage: (text: string) => void;
  handleQuickAction: (action: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const terminalOutputIdle = `$ Ready for diagnostics.

Load a repository to start:
- Load Demo Repo
- Clone GitHub Repo

Then run:
npm run typecheck
npm test
npm run build`;

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [repoName, setRepoName] = useState<string | null>(null);
  const [repoSource, setRepoSource] = useState<RepoSource>("none");
  const [isCloningRepo, setIsCloningRepo] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeFile, setActiveFileState] = useState<string | null>(null);
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
  const [terminalOutput, setTerminalOutput] = useState(terminalOutputIdle);
  const [showRepairReport, setShowRepairReport] = useState(false);
  const [pendingFixAll, setPendingFixAll] = useState(false);
  const [fixAllQueue, setFixAllQueue] = useState<string[]>([]);

  const setActiveFile = useCallback((path: string | null) => {
    setActiveFileState(path);
  }, []);

  const resetIssueState = useCallback(() => {
    setIssues([]);
    setSelectedIssueId(null);
    setRepairPhase("idle");
    setVerificationStatus("pending");
    setFixedIssueIds([]);
    setCurrentRepairPlan(null);
    setCurrentDiff(null);
    setPendingFixAll(false);
    setFixAllQueue([]);
    setBottomTab("terminal");
    setTerminalOutput(terminalOutputIdle);
  }, []);

  const resetWorkspace = useCallback(() => {
    setRepoName(null);
    setRepoSource("none");
    setFileTree([]);
    setFileContents({});
    setOpenTabs([]);
    setActiveFileState(null);
    resetIssueState();
  }, [resetIssueState]);

  const loadDemoRepo = useCallback(() => {
    setRepoName(DEMO_REPO_NAME);
    setRepoSource("demo");
    setFileTree(cloneMockFileTree());
    setFileContents(cloneMockFileContents());
    setOpenTabs(["src/App.tsx"]);
    setActiveFileState("src/App.tsx");
    setTerminalOutput(terminalOutputBefore);
    setBottomTab("terminal");
    setIssues([]);
    setSelectedIssueId(null);
    setRepairPhase("idle");
    setVerificationStatus("pending");
    setFixedIssueIds([]);
    setCurrentRepairPlan(null);
    setCurrentDiff(null);
  }, []);

  const cloneGithubRepo = useCallback(async (url: string) => {
    const parsedName = extractRepoNameFromUrl(url.trim());
    if (!parsedName) {
      return false;
    }

    setIsCloningRepo(true);
    try {
      const response = await fetch("/api/repo/clone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to clone repository");
      }

      const result = (await response.json()) as {
        repoName: string;
        fileTree: FileNode[];
        fileContents: Record<string, string>;
      };

      const firstFile =
        Object.keys(result.fileContents).find((p) => p.endsWith(".ts") || p.endsWith(".tsx")) ??
        Object.keys(result.fileContents)[0] ??
        null;

      setRepoName(result.repoName);
      setRepoSource("github");
      setFileTree(result.fileTree);
      setFileContents(result.fileContents);
      setOpenTabs(firstFile ? [firstFile] : []);
      setActiveFileState(firstFile);
      setTerminalOutput(
        `$ Repository loaded: ${result.repoName}\n$ Source: GitHub clone\n\nRun Diagnose to detect reproducible failures.`
      );
      setBottomTab("terminal");
      setIssues([]);
      setSelectedIssueId(null);
      setRepairPhase("idle");
      setVerificationStatus("pending");
      setFixedIssueIds([]);
      setCurrentRepairPlan(null);
      setCurrentDiff(null);
      return true;
    } catch {
      setRepoName(parsedName);
      setRepoSource("github");
      setFileTree(cloneMockFileTree());
      setFileContents(cloneMockFileContents());
      setOpenTabs(["src/App.tsx"]);
      setActiveFileState("src/App.tsx");
      setTerminalOutput(
        `$ Repository loaded: ${parsedName}\n$ Source: GitHub clone (fallback mock)\n\nRun Diagnose to detect reproducible failures.`
      );
      setBottomTab("terminal");
      setIssues([]);
      setSelectedIssueId(null);
      setRepairPhase("idle");
      setVerificationStatus("pending");
      setFixedIssueIds([]);
      setCurrentRepairPlan(null);
      setCurrentDiff(null);
      return true;
    } finally {
      setIsCloningRepo(false);
    }
  }, []);

  const openFile = useCallback((path: string) => {
    if (!Object.prototype.hasOwnProperty.call(fileContents, path)) return;
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setActiveFileState(path);
  }, [fileContents]);

  const closeTab = useCallback((path: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((p) => p !== path);
      if (path === activeFile) {
        setActiveFileState(next.length > 0 ? next[next.length - 1] : null);
      }
      return next;
    });
  }, [activeFile]);

  const updateFileContent = useCallback((path: string, content: string | undefined) => {
    if (typeof content !== "string") return;
    setFileContents((prev) => ({ ...prev, [path]: content }));
  }, []);

  const diagnose = useCallback(() => {
    if (!repoName) return;
    setRepairPhase("diagnosing");
    setBottomTab("diagnostics");
    setTimeout(() => {
      setIssues(mockIssues.map((i) => ({ ...i, status: "detected" as const })));
      setRepairPhase("diagnosed");
      setActivityView("diagnostics");
      setSelectedIssueId("issue-1");
    }, 1500);
  }, [repoName]);

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
    const ids = issues.map((i) => i.id);
    if (ids.length === 0) return;
    setPendingFixAll(true);
    setFixAllQueue(ids.slice(1));
    startRepairForIssue(ids[0]);
  }, [issues, startRepairForIssue]);

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
        repoName,
        repoSource,
        isCloningRepo,
        fileTree,
        fileContents,
        openTabs,
        activeFile,
        setActiveFile,
        openFile,
        closeTab,
        updateFileContent,
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
        loadDemoRepo,
        cloneGithubRepo,
        resetWorkspace,
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
