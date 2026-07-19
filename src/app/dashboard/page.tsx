"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Monitor, Search, Wrench, FileText, Loader2, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserMenu } from "@/components/layout/UserMenu";
import { listSavedSessions, type SavedSession } from "@/lib/sessions";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SavedSession[]>([]);

  useEffect(() => {
    setSessions(listSavedSessions());
    router.prefetch("/workspace");
  }, [router]);

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
          <button
            type="button"
            onClick={() => router.push("/workspace")}
            className="flex items-center gap-3 p-4 rounded-lg border text-left cursor-pointer transition-colors"
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

        <section className="mt-10">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4" style={{ color: "var(--cg-accent)" }} />
            <h2 className="text-sm font-semibold m-0">Saved Debug Sessions</h2>
          </div>
          {sessions.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--cg-text-muted)" }}>
              No saved sessions yet. Open the IDE and start debugging.
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => router.push(`/workspace?session=${session.id}`)}
                  className="w-full text-left p-3 rounded-lg border cursor-pointer"
                  style={{
                    background: "var(--cg-bg-secondary)",
                    borderColor: "var(--cg-border)",
                    color: "var(--cg-text)",
                  }}
                >
                  <div className="text-sm font-medium">{session.label}</div>
                  <div className="text-[11px]" style={{ color: "var(--cg-text-muted)" }}>
                    Last updated: {new Date(session.updatedAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
