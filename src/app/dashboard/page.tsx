"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Monitor,
  FolderOpen,
  GitBranch,
  Search,
  Wrench,
  FileText,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "@/components/layout/UserMenu";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cg-bg)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--cg-accent)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--cg-bg)", color: "var(--cg-text)" }}>
      <header
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{ borderColor: "var(--cg-border)", background: "var(--cg-bg-secondary)" }}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: "var(--cg-accent)" }} />
          <span className="font-semibold">CodeGuardian</span>
        </div>
        <UserMenu />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
        <p className="mb-8" style={{ color: "var(--cg-text-muted)" }}>
          {user.email}
        </p>

        <div className="grid gap-3 mb-10">
          <Link
            href="/workspace"
            className="flex items-center gap-3 p-4 rounded-lg border no-underline transition-colors"
            style={{
              background: "var(--cg-bg-secondary)",
              borderColor: "var(--cg-border)",
              color: "var(--cg-text)",
            }}
          >
            <Monitor className="w-5 h-5" style={{ color: "var(--cg-accent)" }} />
            <div>
              <div className="font-medium">Open CodeGuardian IDE</div>
              <div className="text-sm" style={{ color: "var(--cg-text-muted)" }}>
                Launch the full debugging workspace
              </div>
            </div>
          </Link>
          <Link
            href="/workspace?demo=true"
            className="flex items-center gap-3 p-4 rounded-lg border no-underline"
            style={{
              background: "var(--cg-bg-secondary)",
              borderColor: "var(--cg-border)",
              color: "var(--cg-text)",
            }}
          >
            <FolderOpen className="w-5 h-5" style={{ color: "var(--cg-warning)" }} />
            <div>
              <div className="font-medium">Load Demo Repo</div>
              <div className="text-sm" style={{ color: "var(--cg-text-muted)" }}>
                codeguardian-demo-broken-portfolio
              </div>
            </div>
          </Link>
          <button
            type="button"
            className="flex items-center gap-3 p-4 rounded-lg border text-left cursor-not-allowed opacity-60"
            style={{
              background: "var(--cg-bg-secondary)",
              borderColor: "var(--cg-border)",
              color: "var(--cg-text)",
            }}
            disabled
          >
            <GitBranch className="w-5 h-5" style={{ color: "var(--cg-text-muted)" }} />
            <div>
              <div className="font-medium">Clone GitHub Repo</div>
              <div className="text-sm" style={{ color: "var(--cg-text-muted)" }}>
                Coming soon — connect a repository to diagnose
              </div>
            </div>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Search,
              title: "Diagnose reproducible failures",
              desc: "Run typecheck, tests, and build to surface root causes.",
            },
            {
              icon: Wrench,
              title: "Apply minimal verified repairs",
              desc: "Review patch diffs and apply only within repair boundaries.",
            },
            {
              icon: FileText,
              title: "View repair audit reports",
              desc: "See what changed, why, and how verification confirmed the fix.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-lg border p-4"
              style={{ background: "var(--cg-bg-secondary)", borderColor: "var(--cg-border)" }}
            >
              <card.icon className="w-4 h-4 mb-2" style={{ color: "var(--cg-accent)" }} />
              <h3 className="text-sm font-semibold mb-1">{card.title}</h3>
              <p className="text-xs" style={{ color: "var(--cg-text-muted)" }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
