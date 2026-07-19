import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface IncomingIssue {
  title?: string;
  file?: string;
  command?: string;
  rootCause?: string;
  repairBoundary?: string;
  verificationCommand?: string;
}

interface IncomingMessage {
  role: "user" | "guardian";
  content: string;
}

const SYSTEM_PROMPT = `You are Guardian, an AI debugging assistant inside CodeGuardian.
Core rule: CodeGuardian is a debugger, not a software engineer.

Always:
- Focus on reproducible failures.
- Propose minimal safe patches only.
- Respect repair boundaries.
- Include verification commands.
- Be concise and practical.

Never:
- Propose unrelated feature work.
- Suggest broad rewrites.
- Ignore failing command evidence.
`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
    }

    const body = (await req.json()) as {
      repoName?: string | null;
      diagnosticCommands?: string[];
      selectedIssue?: IncomingIssue | null;
      messages?: IncomingMessage[];
    };

    const recentMessages = (body.messages ?? [])
      .slice(-12)
      .map((m) => ({
        role: m.role === "guardian" ? "assistant" : "user",
        content: m.content,
      }));

    const contextBlock = [
      `Repository: ${body.repoName ?? "not loaded"}`,
      `Diagnostic commands: ${(body.diagnosticCommands ?? []).join(", ") || "none"}`,
      body.selectedIssue
        ? `Selected issue: ${body.selectedIssue.title ?? "unknown"} | file: ${body.selectedIssue.file ?? "unknown"} | command: ${body.selectedIssue.command ?? "unknown"} | root cause: ${body.selectedIssue.rootCause ?? "n/a"} | boundary: ${body.selectedIssue.repairBoundary ?? "n/a"} | verify: ${body.selectedIssue.verificationCommand ?? "n/a"}`
        : "Selected issue: none",
    ].join("\n");

    const model = process.env.OPENAI_CHAT_MODEL || "gpt-5.6";
    const openAiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: contextBlock },
          ...recentMessages,
        ],
        temperature: 0.2,
      }),
    });

    if (!openAiRes.ok) {
      const text = await openAiRes.text();
      return NextResponse.json(
        { error: `OpenAI request failed: ${text}` },
        { status: 502 }
      );
    }

    const data = (await openAiRes.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ text?: string }> }>;
    };

    const fallback =
      data.output
        ?.flatMap((o) => o.content ?? [])
        .map((c) => c.text ?? "")
        .join("\n")
        .trim() ?? "";

    const reply = (data.output_text || fallback || "").trim();
    if (!reply) {
      return NextResponse.json(
        { error: "OpenAI returned no text response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Failed to process Guardian AI request." },
      { status: 500 }
    );
  }
}
