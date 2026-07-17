"use client";

import { TopBar } from "./TopBar";
import { ActivityBar } from "./ActivityBar";
import { LeftSidebar } from "./LeftSidebar";
import { EditorArea } from "./EditorArea";
import { BottomPanel } from "./BottomPanel";
import { StatusBar } from "./StatusBar";
import { GuardianPanel } from "./GuardianPanel";
import { RepairPlanModal } from "./RepairPlanModal";
import { RepairReportModal } from "./RepairReportModal";
import { WorkspaceProvider } from "./WorkspaceContext";

export function IDEWorkspace() {
  return (
    <WorkspaceProvider>
      <div
        className="flex flex-col h-screen overflow-hidden"
        style={{ background: "var(--cg-bg)", color: "var(--cg-text)" }}
      >
        <TopBar />

        <div className="flex flex-1 min-h-0">
          <ActivityBar />
          <LeftSidebar />

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex flex-1 min-h-0">
              <div className="flex flex-col flex-1 min-w-0">
                <EditorArea />
              </div>
              <GuardianPanel />
            </div>
            <BottomPanel />
          </div>
        </div>

        <StatusBar />
        <RepairPlanModal />
        <RepairReportModal />
      </div>
    </WorkspaceProvider>
  );
}
