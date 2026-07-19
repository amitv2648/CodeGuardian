"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
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
import {
  DEMO_WORKFLOW_REPO_NAME,
  demoWorkflowChat,
  demoWorkflowCommands,
  demoWorkflowDiffs,
  demoWorkflowFileContents,
  demoWorkflowFileTree,
  demoWorkflowIssues,
  demoWorkflowRepairPlans,
  demoWorkflowTerminalAfter,
  demoWorkflowTerminalBefore,
} from "@/lib/demoData";
import { getSavedSession, upsertSavedSession } from "@/lib/sessions";

export type ActivityView = "explorer" | "diagnostics" | "repairs" | "reports" | "settings";
export type BottomTab = "terminal" | "diagnostics" | "verification";
export type RepairPhase = "idle" | "diagnosing" | "diagnosed" | "planning" | "preview" | "applying" | "verifying" | "verified";
export type VerificationStatus = "pending" | "failed" | "passed";
export type RepoSource = "none" | "demo" | "github";

interface CommitRecord {
  id: string;
  message: string;
  issueIds: string[];
  files: string[];
  createdAt: string;
}

interface WorkspaceDataset {
  repoName: string;
  fileTree: FileNode[];
  fileContents: Record<string, string>;
  issues: DetectedIssue[];
  repairPlans: Record<string, RepairPlan>;
  diffs: Record<string, DiffHunk>;
  terminalBefore: string;
  terminalAfter: string;
  initialChat: ChatMessage[];
  commands: string[];
}

interface WorkspaceContextValue {
  demoMode: boolean;
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
  isChatLoading: boolean;
  chatError: string | null;
  terminalOutput: string;
  showRepairReport: boolean;
  setShowRepairReport: (show: boolean) => void;
  showCommitModal: boolean;
  setShowCommitModal: (show: boolean) => void;
  commitHistory: CommitRecord[];
  showDemoOutcome: boolean;
  setShowDemoOutcome: (show: boolean) => void;
  diagnosticCommands: string[];
  currentSessionId: string | null;
  loadDemoRepo: () => void;
  cloneGithubRepo: (url: string) => Promise<boolean>;
  resetWorkspace: () => void;
  saveSessionNow: () => void;
  commitChanges: (issueIds: string[], message: string) => boolean;
  diagnose: () => void;
  fixSelectedIssue: () => void;
  fixAllIssues: () => void;
  applyPatch: () => void;
  cancelRepair: () => void;
  sendChatMessage: (text: string) => Promise<void>;
  handleQuickAction: (action: string) => Promise<void>;
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

const appDataset: WorkspaceDataset = {
  repoName: DEMO_REPO_NAME,
  fileTree: cloneMockFileTree(),
  fileContents: cloneMockFileContents(),
  issues: mockIssues,
  repairPlans: mockRepairPlans,
  diffs: mockDiffs,
  terminalBefore: terminalOutputBefore,
  terminalAfter: terminalOutputAfter,
  initialChat: initialChatMessages,
  commands: ["npm run typecheck", "npm test", "npm run build"],
};

const demoDataset: WorkspaceDataset = {
  repoName: DEMO_WORKFLOW_REPO_NAME,
  fileTree: demoWorkflowFileTree,
  fileContents: demoWorkflowFileContents,
  issues: demoWorkflowIssues,
  repairPlans: demoWorkflowRepairPlans,
  diffs: demoWorkflowDiffs,
  terminalBefore: demoWorkflowTerminalBefore,
  terminalAfter: demoWorkflowTerminalAfter,
  initialChat: demoWorkflowChat,
  commands: demoWorkflowCommands,
};

export function WorkspaceProvider({
  children,
  demoMode = false,
  initialSessionId,
}: {
  children: ReactNode;
  demoMode?: boolean;
  initialSessionId?: string | null;
}) {
  const dataset = demoMode ? demoDataset : appDataset;
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(dataset.initialChat);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [terminalOutput, setTerminalOutput] = useState(terminalOutputIdle);
  const [showRepairReport, setShowRepairReport] = useState(false);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitHistory, setCommitHistory] = useState<CommitRecord[]>([]);
  const [showDemoOutcome, setShowDemoOutcome] = useState(false);
  const [pendingFixAll, setPendingFixAll] = useState(false);
  const [fixAllQueue, setFixAllQueue] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const restoringSessionRef = useRef(false);

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
    setShowCommitModal(false);
    setShowDemoOutcome(false);
    setChatMessages(dataset.initialChat);
    setChatError(null);
  }, [dataset]);

  const resetWorkspace = useCallback(() => {
    setRepoName(null);
    setRepoSource("none");
    setFileTree([]);
    setFileContents({});
    setOpenTabs([]);
    setActiveFileState(null);
    setCommitHistory([]);
    setCurrentSessionId(null);
    resetIssueState();
  }, [resetIssueState]);

  const loadDemoRepo = useCallback(() => {
    setRepoName(dataset.repoName);
    setRepoSource("demo");
    setFileTree(JSON.parse(JSON.stringify(dataset.fileTree)) as FileNode[]);
    setFileContents({ ...dataset.fileContents });
    const firstFile = Object.keys(dataset.fileContents)[0] ?? null;
    setOpenTabs(firstFile ? [firstFile] : []);
    setActiveFileState(firstFile);
    setTerminalOutput(dataset.terminalBefore);
    setBottomTab("terminal");
    setIssues([]);
    setSelectedIssueId(null);
    setRepairPhase("idle");
    setVerificationStatus("pending");
    setFixedIssueIds([]);
    setCurrentRepairPlan(null);
    setCurrentDiff(null);
    setCommitHistory([]);
    setShowDemoOutcome(false);
    setChatMessages(dataset.initialChat);
  }, [dataset]);

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
      setCommitHistory([]);
      return true;
    } catch {
      return false;
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

  const saveSessionNow = useCallback(() => {
    if (demoMode) return;
    const id = currentSessionId ?? crypto.randomUUID();
    const label = repoName ?? "Untitled Debug Session";
    upsertSavedSession({
      id,
      label,
      updatedAt: new Date().toISOString(),
      state: {
        repoName,
        repoSource,
        fileTree,
        fileContents,
        openTabs,
        activeFile,
        activityView,
        bottomTab,
        issues,
        selectedIssueId,
        repairPhase,
        verificationStatus,
        fixedIssueIds,
        chatMessages,
        terminalOutput,
      },
    });
    if (!currentSessionId) {
      setCurrentSessionId(id);
    }
  }, [
    demoMode,
    currentSessionId,
    repoName,
    repoSource,
    fileTree,
    fileContents,
    openTabs,
    activeFile,
    activityView,
    bottomTab,
    issues,
    selectedIssueId,
    repairPhase,
    verificationStatus,
    fixedIssueIds,
    chatMessages,
    terminalOutput,
  ]);

  const commitChanges = useCallback(
    (issueIds: string[], message: string) => {
      const trimmed = message.trim();
      if (!repoName || issueIds.length === 0 || !trimmed) {
        return false;
      }

      const allowedIds = new Set(fixedIssueIds);
      const selectedIssues = issues.filter(
        (issue) => issueIds.includes(issue.id) && allowedIds.has(issue.id)
      );
      if (selectedIssues.length === 0) {
        return false;
      }

      const files = [...new Set(selectedIssues.map((issue) => issue.file))];
      const commitId = Date.now().toString(16).slice(-7);
      const record: CommitRecord = {
        id: commitId,
        message: trimmed,
        issueIds: selectedIssues.map((issue) => issue.id),
        files,
        createdAt: new Date().toISOString(),
      };

      setCommitHistory((prev) => [record, ...prev]);
      setShowCommitModal(false);
      if (demoMode) {
        setShowDemoOutcome(true);
      }
      setBottomTab("terminal");
      setTerminalOutput(
        (prev) =>
          `${prev}\n\n$ git add ${files.join(" ")}\n$ git commit -m "${trimmed}"\n[${repoName} ${commitId}] ${trimmed}\n ${files.length} file(s) changed`
      );
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-commit`,
          role: "guardian",
          content: `Commit recorded with message "${trimmed}". ${selectedIssues.length} issue repair(s) included.`,
        },
      ]);
      return true;
    },
    [repoName, issues, fixedIssueIds, demoMode]
  );

  const diagnose = useCallback(() => {
    if (!repoName) return;
    setRepairPhase("diagnosing");
    setBottomTab("diagnostics");
    setTimeout(() => {
      setIssues(dataset.issues.map((i) => ({ ...i, status: "detected" as const })));
      setRepairPhase("diagnosed");
      setActivityView("diagnostics");
      setSelectedIssueId(dataset.issues[0]?.id ?? null);
    }, 1500);
  }, [repoName, dataset]);

  const startRepairForIssue = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
    setRepairPhase("planning");
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: "repairing" } : i))
    );
    setTimeout(() => {
      setCurrentRepairPlan(dataset.repairPlans[issueId] ?? null);
      setCurrentDiff(dataset.diffs[issueId] ?? null);
      setRepairPhase("preview");
      const plan = dataset.repairPlans[issueId];
      if (plan?.filesChanged[0]) {
        openFile(plan.filesChanged[0]);
      }
    }, 800);
  }, [openFile, dataset]);

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
        setTerminalOutput(dataset.terminalAfter);

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
  }, [selectedIssueId, pendingFixAll, fixAllQueue, startRepairForIssue, dataset]);

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

  const sendChatMessage = useCallback(async (text: string) => {
    setChatError(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    setIsChatLoading(true);
    try {
      const selectedIssue = selectedIssueId
        ? issues.find((issue) => issue.id === selectedIssueId) ?? null
        : null;
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoName,
          diagnosticCommands: dataset.commands,
          selectedIssue,
          messages: [...chatMessages, userMsg],
        }),
      });

      if (!response.ok) {
        throw new Error("Guardian AI request failed");
      }

      const result = (await response.json()) as { reply?: string };
      const reply =
        result.reply?.trim() ||
        "I can help diagnose reproducible failures and propose minimal verified repairs.";
      const guardianMsg: ChatMessage = {
        id: `msg-${Date.now()}-g`,
        role: "guardian",
        content: reply,
      };
      setChatMessages((prev) => [...prev, guardianMsg]);
    } catch {
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
          "I could not reach the AI backend right now. Root cause review: start with the selected failing file and verify the exact command output before patching.";
      } else if (lower.includes("fix") || lower.includes("patch")) {
        response =
          "I could not reach the AI backend right now. Fallback plan: apply the smallest patch in the selected file and rerun the failing command.";
      } else {
        response =
          "Guardian AI is temporarily unavailable. I can still assist using fallback debugging guidance until the API is reachable.";
      }
      setChatError("Guardian AI temporarily unavailable. Using fallback responses.");
      const guardianMsg: ChatMessage = {
        id: `msg-${Date.now()}-g`,
        role: "guardian",
        content: response,
      };
      setChatMessages((prev) => [...prev, guardianMsg]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatMessages, dataset.commands, issues, repoName, selectedIssueId]);

  const handleQuickAction = useCallback(
    async (action: string) => {
      const prompts: Record<string, string> = {
        "Explain root cause": "Why is the build failing? Explain the root cause.",
        "Propose minimal fix": "Propose a minimal fix for the selected issue.",
        "Show affected files": "Which files are affected by this issue?",
        "Verify fix": "How will you verify this fix?",
      };
      await sendChatMessage(prompts[action] ?? action);
    },
    [sendChatMessage]
  );

  useEffect(() => {
    if (demoMode || !initialSessionId || restoringSessionRef.current) return;
    const saved = getSavedSession(initialSessionId);
    if (!saved) return;
    restoringSessionRef.current = true;
    setCurrentSessionId(saved.id);
    setRepoName(saved.state.repoName);
    setRepoSource(saved.state.repoSource);
    setFileTree(saved.state.fileTree);
    setFileContents(saved.state.fileContents);
    setOpenTabs(saved.state.openTabs);
    setActiveFileState(saved.state.activeFile);
    setActivityView(saved.state.activityView);
    setBottomTab(saved.state.bottomTab);
    setIssues(saved.state.issues);
    setSelectedIssueId(saved.state.selectedIssueId);
    setRepairPhase(saved.state.repairPhase);
    setVerificationStatus(saved.state.verificationStatus);
    setFixedIssueIds(saved.state.fixedIssueIds);
    setChatMessages(saved.state.chatMessages);
    setTerminalOutput(saved.state.terminalOutput);
    restoringSessionRef.current = false;
  }, [demoMode, initialSessionId]);

  useEffect(() => {
    if (demoMode || restoringSessionRef.current) return;
    const timeout = window.setTimeout(() => {
      saveSessionNow();
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [
    demoMode,
    saveSessionNow,
    repoName,
    repoSource,
    fileTree,
    fileContents,
    openTabs,
    activeFile,
    activityView,
    bottomTab,
    issues,
    selectedIssueId,
    repairPhase,
    verificationStatus,
    fixedIssueIds,
    chatMessages,
    terminalOutput,
  ]);

  return (
    <WorkspaceContext.Provider
      value={{
        demoMode,
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
        isChatLoading,
        chatError,
        terminalOutput,
        showRepairReport,
        setShowRepairReport,
        showCommitModal,
        setShowCommitModal,
        commitHistory,
        showDemoOutcome,
        setShowDemoOutcome,
        diagnosticCommands: dataset.commands,
        currentSessionId,
        loadDemoRepo,
        cloneGithubRepo,
        resetWorkspace,
        saveSessionNow,
        commitChanges,
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
