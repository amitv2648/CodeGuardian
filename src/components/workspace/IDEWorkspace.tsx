"use client";

import { useEffect } from "react";
import { TopBar } from "./TopBar";
import { ActivityBar } from "./ActivityBar";
import { EditorArea } from "./EditorArea";
import { BottomPanel } from "./BottomPanel";
import { StatusBar } from "./StatusBar";
import { IssuesPanel } from "./IssuesPanel";
import { ChatPanel } from "./ChatPanel";
import { RepairPlanModal } from "./RepairPlanModal";
import { RepairReportModal } from "./RepairReportModal";
import { CommitChangesModal } from "./CommitChangesModal";
import { DemoOutcomeModal } from "./DemoOutcomeModal";
import { WorkspaceProvider, useWorkspace } from "./WorkspaceContext";

function IDEWorkspaceContent({ autoloadDemo }: { autoloadDemo?: boolean }) {
  const { repoName, loadDemoRepo } = useWorkspace();

  useEffect(() => {
    if (autoloadDemo && !repoName) {
      loadDemoRepo();
    }
  }, [autoloadDemo, repoName, loadDemoRepo]);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--cg-bg)", color: "var(--cg-text)" }}
    >
      <TopBar />

      <div className="flex flex-1 min-h-0">
        <ActivityBar />
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-1 min-h-0">
            <div className="flex flex-col flex-1 min-w-0">
              <EditorArea />
            </div>
            <IssuesPanel />
            <ChatPanel />
          </div>
          <BottomPanel />
        </div>
      </div>

      <StatusBar />
      <RepairPlanModal />
      <RepairReportModal />
      <CommitChangesModal />
      <DemoOutcomeModal />
    </div>
  );
}

export function IDEWorkspace({
  autoloadDemo = false,
  demoMode = false,
  initialSessionId = null,
}: {
  autoloadDemo?: boolean;
  demoMode?: boolean;
  initialSessionId?: string | null;
}) {
  return (
    <WorkspaceProvider demoMode={demoMode} initialSessionId={initialSessionId}>
      <IDEWorkspaceContent autoloadDemo={autoloadDemo} />
    </WorkspaceProvider>
  );
}
