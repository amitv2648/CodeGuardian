import type {
  ActivityView,
  BottomTab,
  RepairPhase,
  RepoSource,
  VerificationStatus,
} from "@/components/workspace/WorkspaceContext";
import type { ChatMessage, DetectedIssue, FileNode } from "./mockData";

export interface SavedSession {
  id: string;
  label: string;
  updatedAt: string;
  state: {
    repoName: string | null;
    repoSource: RepoSource;
    fileTree: FileNode[];
    fileContents: Record<string, string>;
    openTabs: string[];
    activeFile: string | null;
    activityView: ActivityView;
    bottomTab: BottomTab;
    issues: DetectedIssue[];
    selectedIssueId: string | null;
    repairPhase: RepairPhase;
    verificationStatus: VerificationStatus;
    fixedIssueIds: string[];
    chatMessages: ChatMessage[];
    terminalOutput: string;
  };
}

const STORAGE_KEY = "codeguardian-sessions-v1";

export function listSavedSessions(): SavedSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getSavedSession(id: string): SavedSession | null {
  return listSavedSessions().find((s) => s.id === id) ?? null;
}

export function upsertSavedSession(session: SavedSession): void {
  const existing = listSavedSessions();
  const merged = [session, ...existing.filter((s) => s.id !== session.id)]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}
