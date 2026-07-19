"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useWorkspace } from "./WorkspaceContext";

const quickActions = [
  "Explain root cause",
  "Propose minimal fix",
  "Show affected files",
  "Verify fix",
];

export function ChatPanel() {
  const { chatMessages, sendChatMessage, handleQuickAction, isChatLoading, chatError } = useWorkspace();
  const [chatInput, setChatInput] = useState("");

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    await sendChatMessage(chatInput.trim());
    setChatInput("");
  }

  return (
    <aside
      className="flex flex-col w-80 shrink-0 border-l"
      style={{ background: "var(--cg-bg-secondary)", borderColor: "var(--cg-border)" }}
    >
      <div className="px-3 py-2 border-b" style={{ borderColor: "var(--cg-border)" }}>
        <div className="font-semibold text-xs">Guardian AI Chat</div>
        <div className="text-[11px]" style={{ color: "var(--cg-text-muted)" }}>
          Ask for diagnosis, minimal patch scope, and verification steps.
        </div>
        {chatError && (
          <div
            className="mt-1 text-[10px] px-2 py-1 rounded"
            style={{
              color: "var(--cg-warning)",
              background: "color-mix(in srgb, var(--cg-warning) 15%, transparent)",
            }}
          >
            {chatError}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto cg-scrollbar px-3 py-2 space-y-2">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className="rounded-md p-2 text-xs"
            style={{
              background:
                msg.role === "guardian"
                  ? "var(--cg-bg-tertiary)"
                  : "color-mix(in srgb, var(--cg-accent) 10%, transparent)",
            }}
          >
            <div
              className="text-[10px] font-semibold mb-0.5"
              style={{ color: msg.role === "guardian" ? "var(--cg-accent)" : "var(--cg-text-muted)" }}
            >
              {msg.role === "guardian" ? "Guardian" : "You"}
            </div>
            <p className="m-0 leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </div>

      <div className="px-3 py-1 flex flex-wrap gap-1 border-t" style={{ borderColor: "var(--cg-border)" }}>
        {quickActions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => {
              void handleQuickAction(action);
            }}
            disabled={isChatLoading}
            className="text-[10px] px-2 py-0.5 rounded border cursor-pointer"
            style={{
              background: "var(--cg-bg-tertiary)",
              borderColor: "var(--cg-border)",
              color: "var(--cg-text-muted)",
            }}
          >
            {action}
          </button>
        ))}
      </div>

      <form onSubmit={handleSend} className="px-3 py-2 flex gap-1.5 border-t" style={{ borderColor: "var(--cg-border)" }}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask Guardian about this failure..."
          className="cg-input text-xs py-1.5 flex-1"
          disabled={isChatLoading}
        />
        <button type="submit" className="cg-btn-primary px-2 py-1.5" disabled={isChatLoading}>
          {isChatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>
    </aside>
  );
}
