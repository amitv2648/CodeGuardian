"use client";

import { useRouter } from "next/navigation";
import { Shield, Search, Loader2, GitBranch, RotateCcw } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";
import { ThemeSelector } from "./ThemeSelector";
import { UserMenu } from "@/components/layout/UserMenu";

export function TopBar() {
  const router = useRouter();
  const {
    demoMode,
    repoName,
    isCloningRepo,
    repairPhase,
    diagnose,
    cloneGithubRepo,
    resetWorkspace,
    saveSessionNow,
  } = useWorkspace();
  const isDiagnosing = repairPhase === "diagnosing";
  const canDiagnose = Boolean(repoName) && !isCloningRepo;

  async function handleCloneClick() {
    const url = window.prompt("Paste GitHub repository URL");
    if (!url) return;
    const ok = await cloneGithubRepo(url);
    if (!ok) {
      window.alert("Unable to clone repository. Check URL/public access and try again.");
    }
  }

  function goToDashboard() {
    saveSessionNow();
    router.push("/dashboard");
  }

  return (
    <header
      className="flex items-center justify-between h-10 px-3 border-b shrink-0 text-sm"
      style={{
        background: "var(--cg-panel-header)",
        borderColor: "var(--cg-border)",
      }}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={goToDashboard}
          className="flex items-center gap-2 border-none bg-transparent cursor-pointer p-0"
          style={{ color: "var(--cg-text)" }}
        >
          <Shield className="w-4 h-4" style={{ color: "var(--cg-accent)" }} />
          <span className="font-semibold text-xs tracking-wide">CodeGuardian</span>
        </button>
        <div className="h-4 w-px" style={{ background: "var(--cg-border)" }} />
        <span className="text-xs" style={{ color: "var(--cg-text-muted)" }}>
          {repoName ?? "No repository loaded"}
        </span>
        <span
          className="cg-badge text-[10px]"
          style={{
            background: "color-mix(in srgb, var(--cg-accent) 15%, transparent)",
            color: "var(--cg-accent)",
          }}
        >
          {demoMode ? "Demo Workflow" : "Debugger Mode"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {!repoName && !demoMode && (
          <>
            <button
              type="button"
              onClick={handleCloneClick}
              disabled={isCloningRepo}
              className="cg-btn-secondary flex items-center gap-1.5 text-xs py-1 px-3"
            >
              <GitBranch className="w-3 h-3" />
              {isCloningRepo ? "Cloning…" : "Clone GitHub Repo"}
            </button>
          </>
        )}

        {repoName && !demoMode && (
          <button
            type="button"
            onClick={resetWorkspace}
            className="cg-btn-secondary flex items-center gap-1.5 text-xs py-1 px-3"
          >
            <RotateCcw className="w-3 h-3" />
            New Empty IDE
          </button>
        )}

        <button
          type="button"
          onClick={diagnose}
          disabled={isDiagnosing || !canDiagnose}
          className="cg-btn-primary flex items-center gap-1.5 text-xs py-1 px-3"
        >
          {isDiagnosing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Search className="w-3 h-3" />
          )}
          {isDiagnosing ? "Diagnosing…" : "Diagnose"}
        </button>
        <ThemeSelector />
        {!demoMode && <UserMenu />}
      </div>
    </header>
  );
}
