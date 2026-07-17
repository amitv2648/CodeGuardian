import { NextRequest, NextResponse } from "next/server";
import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { FileNode } from "@/lib/mockData";

export const runtime = "nodejs";

const execFileAsync = promisify(execFile);
const SANDBOX_DIR = path.join(process.cwd(), ".codeguardian-sandboxes");
const MAX_FILES = 160;
const MAX_FILE_SIZE_BYTES = 180_000;

function parseRepoName(url: string): string | null {
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(normalized);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return parts[1].replace(/\.git$/i, "");
  } catch {
    return null;
  }
}

function buildTree(paths: string[]): FileNode[] {
  const root: FileNode[] = [];

  for (const filePath of paths) {
    const segments = filePath.split("/");
    let cursor = root;
    let currentPath = "";

    segments.forEach((segment, index) => {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isLast = index === segments.length - 1;
      const existing = cursor.find((node) => node.name === segment);

      if (existing) {
        if (!isLast && existing.type === "folder" && existing.children) {
          cursor = existing.children;
        }
        return;
      }

      const node: FileNode = {
        name: segment,
        path: currentPath,
        type: isLast ? "file" : "folder",
        ...(isLast ? {} : { children: [] }),
      };
      cursor.push(node);

      if (!isLast) {
        cursor = node.children ?? [];
      }
    });
  }

  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    nodes.forEach((n) => {
      if (n.children) sortNodes(n.children);
    });
  };

  sortNodes(root);
  return root;
}

async function collectFiles(dir: string, base = dir, acc: string[] = []): Promise<string[]> {
  if (acc.length >= MAX_FILES) return acc;
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (acc.length >= MAX_FILES) break;
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".next") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectFiles(fullPath, base, acc);
      continue;
    }

    const relative = path.relative(base, fullPath).replace(/\\/g, "/");
    if (!relative) continue;
    acc.push(relative);
  }

  return acc;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    const repoUrl = body.url?.trim();
    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required." }, { status: 400 });
    }

    const repoName = parseRepoName(repoUrl);
    if (!repoName) {
      return NextResponse.json({ error: "Invalid GitHub repository URL." }, { status: 400 });
    }

    await mkdir(SANDBOX_DIR, { recursive: true });
    const target = path.join(SANDBOX_DIR, `${repoName}-${Date.now()}`);

    await execFileAsync("git", ["clone", "--depth", "1", repoUrl, target], { timeout: 120000 });

    const filePaths = await collectFiles(target);
    const fileContents: Record<string, string> = {};

    for (const relativePath of filePaths) {
      const absolutePath = path.join(target, relativePath);
      const fileStat = await stat(absolutePath);
      if (fileStat.size > MAX_FILE_SIZE_BYTES) continue;
      try {
        const content = await readFile(absolutePath, "utf8");
        fileContents[relativePath] = content;
      } catch {
        // Skip binary or unreadable files.
      }
    }

    const includedPaths = Object.keys(fileContents);
    const fileTree = buildTree(includedPaths);

    return NextResponse.json({
      repoName,
      fileTree,
      fileContents,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to clone repository. Ensure it is public and reachable." },
      { status: 500 }
    );
  }
}
