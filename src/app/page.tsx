"use client";

import Link from "next/link";
import { Shield, ArrowRight, GitBranch, Search, Wrench, CheckCircle, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--cg-bg)", color: "var(--cg-text)" }}>
      <header
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--cg-border)" }}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" style={{ color: "var(--cg-accent)" }} />
          <span className="font-semibold text-lg tracking-tight">CodeGuardian</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="cg-btn-secondary text-sm">
            Sign In
          </Link>
          <Link href="/login" className="cg-btn-primary text-sm no-underline">
            Get Started
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
            style={{ background: "var(--cg-bg-secondary)", border: "1px solid var(--cg-border)" }}
          >
            <span className="cg-pulse w-2 h-2 rounded-full" style={{ background: "var(--cg-success)" }} />
            Developer Tools · OpenAI Build Week
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            AI Debugging IDE for{" "}
            <span style={{ color: "var(--cg-accent)" }}>Broken Repositories</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-2" style={{ color: "var(--cg-text-muted)" }}>
            Diagnose reproducible software failures. Apply minimal verified repairs.
            No feature building. No rewrites.
          </p>
          <p className="text-base font-medium mb-8" style={{ color: "var(--cg-accent)" }}>
            &ldquo;CodeGuardian is a debugger, not a software engineer.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login" className="cg-btn-primary inline-flex items-center gap-2 no-underline">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/workspace" className="cg-btn-secondary inline-flex items-center gap-2 no-underline">
              View Demo Workflow
            </Link>
          </div>
        </div>

        <div
          className="rounded-lg border p-6 mb-12"
          style={{ background: "var(--cg-bg-secondary)", borderColor: "var(--cg-border)" }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--cg-text-muted)" }}>
            Core Workflow
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            {[
              { icon: GitBranch, label: "Clone" },
              { icon: Search, label: "Diagnose" },
              { icon: Wrench, label: "Minimal Patch" },
              { icon: CheckCircle, label: "Verify" },
              { icon: FileText, label: "Report" },
            ].map((step, i, arr) => (
              <span key={step.label} className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md"
                  style={{ background: "var(--cg-bg-tertiary)" }}
                >
                  <step.icon className="w-3.5 h-3.5" style={{ color: "var(--cg-accent)" }} />
                  {step.label}
                </span>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--cg-text-muted)" }} />
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            {
              title: "Debug, do not build",
              desc: "Focuses on reproducible failures — not feature requests or redesigns.",
            },
            {
              title: "Repair, do not reinvent",
              desc: "Proposes the smallest safe patch within a clear repair boundary.",
            },
            {
              title: "Verify, do not guess",
              desc: "Reruns diagnostic commands and confirms every fix before reporting.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border p-4"
              style={{ background: "var(--cg-bg-secondary)", borderColor: "var(--cg-border)" }}
            >
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p style={{ color: "var(--cg-text-muted)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer
        className="text-center py-6 text-xs border-t"
        style={{ borderColor: "var(--cg-border)", color: "var(--cg-text-muted)" }}
      >
        CodeGuardian · Minimal fixes. Verified results.
      </footer>
    </div>
  );
}
