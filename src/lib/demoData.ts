import type { ChatMessage, DetectedIssue, DiffHunk, FileNode, RepairPlan } from "./mockData";

export const DEMO_WORKFLOW_REPO_NAME = "demo-buggy-todo";

export const demoWorkflowFileTree: FileNode[] = [
  { name: "package.json", path: "package.json", type: "file" },
  {
    name: "src",
    path: "src",
    type: "folder",
    children: [
      { name: "App.tsx", path: "src/App.tsx", type: "file" },
      { name: "TodoItem.tsx", path: "src/TodoItem.tsx", type: "file" },
      { name: "validate.ts", path: "src/validate.ts", type: "file" },
    ],
  },
  {
    name: "tests",
    path: "tests",
    type: "folder",
    children: [{ name: "validate.test.ts", path: "tests/validate.test.ts", type: "file" }],
  },
];

export const demoWorkflowFileContents: Record<string, string> = {
  "package.json": `{
  "name": "demo-buggy-todo",
  "version": "1.0.0",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "build": "vite build"
  }
}`,
  "src/App.tsx": `import TodoItem from "./TodoItems";

export default function App() {
  return <TodoItem text="Ship demo" />;
}`,
  "src/TodoItem.tsx": `type Props = { text: string; done: boolean };

export default function TodoItem({ text, done }: Props) {
  return <div>{done ? "✅" : "⬜"} {text}</div>;
}`,
  "src/validate.ts": `export function isValidTask(text: string): boolean {
  return text.length >= 0;
}`,
  "tests/validate.test.ts": `import { isValidTask } from "../src/validate";

describe("isValidTask", () => {
  it("rejects empty tasks", () => {
    expect(isValidTask("")).toBe(false);
  });
});`,
};

export const demoWorkflowIssues: DetectedIssue[] = [
  {
    id: "d-1",
    title: "Broken import path in App.tsx",
    severity: "high",
    command: "npm run build",
    file: "src/App.tsx",
    rootCause: "App.tsx imports TodoItem from './TodoItems' but file is TodoItem.tsx.",
    repairBoundary: "Change only the import path.",
    verificationCommand: "npm run build",
    status: "detected",
  },
  {
    id: "d-2",
    title: "Prop mismatch in TodoItem",
    severity: "medium",
    command: "npm run typecheck",
    file: "src/TodoItem.tsx",
    rootCause: "TodoItem expects done prop, but App only passes text.",
    repairBoundary: "Make done optional; do not redesign component API.",
    verificationCommand: "npm run typecheck",
    status: "detected",
  },
  {
    id: "d-3",
    title: "Validation test fails for empty text",
    severity: "medium",
    command: "npm test",
    file: "src/validate.ts",
    rootCause: "Validation currently accepts empty strings due to >= 0 condition.",
    repairBoundary: "Change validation condition only.",
    verificationCommand: "npm test",
    status: "detected",
  },
];

export const demoWorkflowRepairPlans: Record<string, RepairPlan> = {
  "d-1": {
    issueId: "d-1",
    rootCause: "App.tsx imports from the wrong path './TodoItems'.",
    minimalPatch: "Change import path to './TodoItem'.",
    repairBoundary: "Import statement only.",
    filesChanged: ["src/App.tsx"],
    riskLevel: "low",
    verificationCommand: "npm run build",
    expectedImpact: "Build resolves TodoItem module.",
  },
  "d-2": {
    issueId: "d-2",
    rootCause: "Component requires done prop that caller does not provide.",
    minimalPatch: "Make done optional with default false.",
    repairBoundary: "Edit Props type and default value only.",
    filesChanged: ["src/TodoItem.tsx"],
    riskLevel: "low",
    verificationCommand: "npm run typecheck",
    expectedImpact: "TypeScript compile succeeds.",
  },
  "d-3": {
    issueId: "d-3",
    rootCause: "Empty string check uses text.length >= 0, always true.",
    minimalPatch: "Use text.trim().length > 0.",
    repairBoundary: "Validation expression only.",
    filesChanged: ["src/validate.ts"],
    riskLevel: "low",
    verificationCommand: "npm test",
    expectedImpact: "Validation test passes for empty input.",
  },
};

export const demoWorkflowDiffs: Record<string, DiffHunk> = {
  "d-1": {
    file: "src/App.tsx",
    removed: ['import TodoItem from "./TodoItems";'],
    added: ['import TodoItem from "./TodoItem";'],
  },
  "d-2": {
    file: "src/TodoItem.tsx",
    removed: ["type Props = { text: string; done: boolean };"],
    added: ["type Props = { text: string; done?: boolean };", "export default function TodoItem({ text, done = false }: Props) {"],
  },
  "d-3": {
    file: "src/validate.ts",
    removed: ["  return text.length >= 0;"],
    added: ["  return text.trim().length > 0;"],
  },
};

export const demoWorkflowTerminalBefore = `$ npm run typecheck
src/TodoItem.tsx: missing required prop done

$ npm test
FAIL tests/validate.test.ts

$ npm run build
Error: Cannot find module './TodoItems'`;

export const demoWorkflowTerminalAfter = `$ npm run typecheck
✓ passed

$ npm test
✓ passed

$ npm run build
✓ build succeeded`;

export const demoWorkflowChat: ChatMessage[] = [
  { id: "d-msg-1", role: "user", content: "Why is this demo app failing?" },
  {
    id: "d-msg-2",
    role: "guardian",
    content:
      "Three reproducible failures were detected. Start with the broken import in src/App.tsx, then verify with npm run build.",
  },
];

export const demoWorkflowCommands = ["npm run typecheck", "npm test", "npm run build"];
