export type IssueSeverity = "high" | "medium" | "low";
export type IssueStatus = "detected" | "repairing" | "fixed" | "verified";

export interface DetectedIssue {
  id: string;
  title: string;
  severity: IssueSeverity;
  command: string;
  file: string;
  rootCause: string;
  repairBoundary: string;
  verificationCommand: string;
  status: IssueStatus;
}

export interface RepairPlan {
  issueId: string;
  rootCause: string;
  minimalPatch: string;
  repairBoundary: string;
  filesChanged: string[];
  riskLevel: "low" | "medium" | "high";
  verificationCommand: string;
  expectedImpact: string;
}

export interface DiffHunk {
  file: string;
  removed: string[];
  added: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "guardian";
  content: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
}

export const DEMO_REPO_NAME = "codeguardian-demo-broken-portfolio";

export const mockFileTree: FileNode[] = [
  { name: "package.json", path: "package.json", type: "file" },
  { name: "vite.config.ts", path: "vite.config.ts", type: "file" },
  { name: "tsconfig.json", path: "tsconfig.json", type: "file" },
  {
    name: "src",
    path: "src",
    type: "folder",
    children: [
      { name: "App.tsx", path: "src/App.tsx", type: "file" },
      { name: "main.tsx", path: "src/main.tsx", type: "file" },
      {
        name: "components",
        path: "src/components",
        type: "folder",
        children: [
          { name: "Navbar.tsx", path: "src/components/Navbar.tsx", type: "file" },
          { name: "Hero.tsx", path: "src/components/Hero.tsx", type: "file" },
          { name: "ProjectCard.tsx", path: "src/components/ProjectCard.tsx", type: "file" },
          { name: "ContactForm.tsx", path: "src/components/ContactForm.tsx", type: "file" },
          { name: "Footer.tsx", path: "src/components/Footer.tsx", type: "file" },
        ],
      },
      {
        name: "data",
        path: "src/data",
        type: "folder",
        children: [{ name: "projects.ts", path: "src/data/projects.ts", type: "file" }],
      },
      {
        name: "utils",
        path: "src/utils",
        type: "folder",
        children: [{ name: "formatDate.ts", path: "src/utils/formatDate.ts", type: "file" }],
      },
      { name: "styles.css", path: "src/styles.css", type: "file" },
    ],
  },
  {
    name: "tests",
    path: "tests",
    type: "folder",
    children: [
      { name: "contactForm.test.tsx", path: "tests/contactForm.test.tsx", type: "file" },
      { name: "formatDate.test.ts", path: "tests/formatDate.test.ts", type: "file" },
    ],
  },
];

export const mockFileContents: Record<string, string> = {
  "package.json": `{
  "name": "broken-portfolio",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}`,
  "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
  },
});`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src", "tests"]
}`,
  "src/App.tsx": `import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProjectCard from "./components/ProjectsCard";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import { projects } from "./data/projects";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <section className="projects">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </section>
      <ContactForm />
      <Footer />
    </div>
  );
}`,
  "src/main.tsx": `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  "src/components/Navbar.tsx": `export default function Navbar() {
  return (
    <nav className="navbar">
      <span className="logo">Portfolio</span>
      <ul>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  );
}`,
  "src/components/Hero.tsx": `export default function Hero() {
  return (
    <header className="hero">
      <h1>Developer Portfolio</h1>
      <p>Building minimal, verified software.</p>
    </header>
  );
}`,
  "src/components/ProjectCard.tsx": `interface Project {
  id: string;
  title: string;
  summary: string;
  tags: string[];
}

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  return (
    <article className="project-card">
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <ul>
        {project.tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </article>
  );
}`,
  "src/components/ContactForm.tsx": `import { useState } from "react";

export default function ContactForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (message.length < 0) {
      setError("Message cannot be empty");
      return;
    }
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your message"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Send</button>
    </form>
  );
}`,
  "src/components/Footer.tsx": `export default function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2026 Portfolio Demo</p>
    </footer>
  );
}`,
  "src/data/projects.ts": `export const projects = [
  {
    id: "1",
    name: "CodeGuardian",
    description: "AI debugging IDE for broken repositories.",
    technologies: ["TypeScript", "React", "Next.js"],
  },
  {
    id: "2",
    name: "VerifyKit",
    description: "Minimal patch verification runner.",
    technologies: ["Node.js", "Vitest"],
  },
];`,
  "src/utils/formatDate.ts": `export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return \`\${year}-\${String(month).padStart(2, "0")}-\${String(day).padStart(2, "0")}\`;
}`,
  "src/styles.css": `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; }
.navbar { display: flex; justify-content: space-between; padding: 1rem; }
.hero { padding: 3rem 1rem; text-align: center; }
.projects { display: grid; gap: 1rem; padding: 1rem; }
.project-card { border: 1px solid #ccc; padding: 1rem; border-radius: 8px; }
.contact-form textarea { width: 100%; min-height: 100px; }
.footer { padding: 1rem; text-align: center; color: #666; }`,
  "tests/contactForm.test.tsx": `import { render, screen, fireEvent } from "@testing-library/react";
import ContactForm from "../src/components/ContactForm";

describe("ContactForm", () => {
  it("rejects empty messages", () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByText("Send"));
    expect(screen.getByText("Message cannot be empty")).toBeInTheDocument();
  });
});`,
  "tests/formatDate.test.ts": `import { formatDate } from "../src/utils/formatDate";

describe("formatDate", () => {
  it("formats dates as YYYY-MM-DD", () => {
    const result = formatDate(new Date("2026-03-15"));
    expect(result).toBe("2026-03-15");
  });
});`,
};

export const mockIssues: DetectedIssue[] = [
  {
    id: "issue-1",
    title: "Broken import path",
    severity: "high",
    command: "npm run build",
    file: "src/App.tsx",
    rootCause: "App.tsx imports ProjectCard from an incorrect path.",
    repairBoundary: "Only correct the import path. Do not refactor App.tsx.",
    verificationCommand: "npm run build",
    status: "detected",
  },
  {
    id: "issue-2",
    title: "TypeScript prop mismatch",
    severity: "high",
    command: "npm run typecheck",
    file: "src/components/ProjectCard.tsx",
    rootCause:
      "ProjectCard expects title, summary, and tags but projects.ts provides name, description, and technologies.",
    repairBoundary:
      "Align ProjectCard props with projects.ts data shape. Do not redesign the component.",
    verificationCommand: "npm run typecheck",
    status: "detected",
  },
  {
    id: "issue-3",
    title: "Failing contact form validation test",
    severity: "medium",
    command: "npm test",
    file: "src/components/ContactForm.tsx",
    rootCause:
      "Validation uses message.length < 0 which never triggers for empty strings.",
    repairBoundary:
      "Fix validation condition only. Do not add new form fields or UX changes.",
    verificationCommand: "npm test",
    status: "detected",
  },
  {
    id: "issue-4",
    title: "Incorrect date formatting utility",
    severity: "medium",
    command: "npm test",
    file: "src/utils/formatDate.ts",
    rootCause: "getMonth() returns 0-indexed month without adding 1.",
    repairBoundary: "Fix month calculation only in formatDate.ts.",
    verificationCommand: "npm test",
    status: "detected",
  },
  {
    id: "issue-5",
    title: "Build command failed before repair",
    severity: "high",
    command: "npm run build",
    file: "src/App.tsx",
    rootCause: "Unresolved module import prevents production build.",
    repairBoundary: "Resolve build-blocking import. No unrelated refactors.",
    verificationCommand: "npm run build",
    status: "detected",
  },
];

export const mockRepairPlans: Record<string, RepairPlan> = {
  "issue-1": {
    issueId: "issue-1",
    rootCause: "App.tsx imports ProjectCard from './components/ProjectsCard' but the file is ProjectCard.tsx.",
    minimalPatch: "Update import path from ProjectsCard to ProjectCard.",
    repairBoundary: "Only correct the import path. Do not refactor App.tsx.",
    filesChanged: ["src/App.tsx"],
    riskLevel: "low",
    verificationCommand: "npm run build",
    expectedImpact: "Build resolves ProjectCard module successfully.",
  },
  "issue-2": {
    issueId: "issue-2",
    rootCause: "ProjectCard interface uses title/summary/tags but data uses name/description/technologies.",
    minimalPatch: "Map project.name → title, project.description → summary, project.technologies → tags in ProjectCard.",
    repairBoundary: "Align prop mapping only. Do not redesign ProjectCard layout.",
    filesChanged: ["src/components/ProjectCard.tsx"],
    riskLevel: "low",
    verificationCommand: "npm run typecheck",
    expectedImpact: "TypeScript compilation passes without prop errors.",
  },
  "issue-3": {
    issueId: "issue-3",
    rootCause: "Empty message check uses message.length < 0 which is always false.",
    minimalPatch: "Replace with message.trim().length === 0.",
    repairBoundary: "Fix validation condition only.",
    filesChanged: ["src/components/ContactForm.tsx"],
    riskLevel: "low",
    verificationCommand: "npm test",
    expectedImpact: "contactForm.test.tsx passes empty message rejection.",
  },
  "issue-4": {
    issueId: "issue-4",
    rootCause: "getMonth() returns 0-indexed value; March displays as 02 instead of 03.",
    minimalPatch: "Use date.getMonth() + 1 for 1-indexed month.",
    repairBoundary: "Fix month calculation in formatDate only.",
    filesChanged: ["src/utils/formatDate.ts"],
    riskLevel: "low",
    verificationCommand: "npm test",
    expectedImpact: "formatDate.test.ts passes date formatting assertion.",
  },
  "issue-5": {
    issueId: "issue-5",
    rootCause: "Build fails due to unresolved ProjectsCard import in App.tsx.",
    minimalPatch: "Correct import path to ./components/ProjectCard.",
    repairBoundary: "Resolve build-blocking import only.",
    filesChanged: ["src/App.tsx"],
    riskLevel: "low",
    verificationCommand: "npm run build",
    expectedImpact: "Production build completes successfully.",
  },
};

export const mockDiffs: Record<string, DiffHunk> = {
  "issue-1": {
    file: "src/App.tsx",
    removed: ['import ProjectCard from "./components/ProjectsCard";'],
    added: ['import ProjectCard from "./components/ProjectCard";'],
  },
  "issue-2": {
    file: "src/components/ProjectCard.tsx",
    removed: [
      "interface Project {",
      "  id: string;",
      "  title: string;",
      "  summary: string;",
      "  tags: string[];",
      "}",
    ],
    added: [
      "interface Project {",
      "  id: string;",
      "  name: string;",
      "  description: string;",
      "  technologies: string[];",
      "}",
      "",
      "// Map data fields to display props",
      "const title = project.name;",
      "const summary = project.description;",
      "const tags = project.technologies;",
    ],
  },
  "issue-3": {
    file: "src/components/ContactForm.tsx",
    removed: ["    if (message.length < 0) {"],
    added: ["    if (message.trim().length === 0) {"],
  },
  "issue-4": {
    file: "src/utils/formatDate.ts",
    removed: ["  const month = date.getMonth();"],
    added: ["  const month = date.getMonth() + 1;"],
  },
  "issue-5": {
    file: "src/App.tsx",
    removed: ['import ProjectCard from "./components/ProjectsCard";'],
    added: ['import ProjectCard from "./components/ProjectCard";'],
  },
};

export const terminalOutputBefore = `$ npm run typecheck
> broken-portfolio@1.0.0 typecheck
> tsc --noEmit

src/App.tsx(3,25): error TS2307: Cannot find module './components/ProjectsCard'.
src/components/ProjectCard.tsx(18,20): error TS2339: Property 'title' does not exist on type '{ id: string; name: string; description: string; technologies: string[]; }'.

$ npm test
> broken-portfolio@1.0.0 test
> vitest run

 FAIL  tests/contactForm.test.tsx
  ✕ rejects empty messages

 FAIL  tests/formatDate.test.ts
  ✕ formats dates as YYYY-MM-DD
    Expected: "2026-03-15"
    Received: "2026-02-15"

$ npm run build
> broken-portfolio@1.0.0 build
> tsc && vite build

src/App.tsx(3,25): error TS2307: Cannot find module './components/ProjectsCard'.
Build failed with 2 errors.`;

export const terminalOutputAfter = `$ npm run typecheck
> broken-portfolio@1.0.0 typecheck
> tsc --noEmit

✓ Type check passed — 0 errors

$ npm test
> broken-portfolio@1.0.0 test
> vitest run

 PASS  tests/contactForm.test.tsx
 PASS  tests/formatDate.test.ts

Tests: 2 passed, 2 total

$ npm run build
> broken-portfolio@1.0.0 build
> tsc && vite build

✓ built in 1.24s
Build completed successfully.`;

export const initialChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Why is the build failing?",
  },
  {
    id: "msg-2",
    role: "guardian",
    content:
      "The build is failing because src/App.tsx imports a component from a path that does not exist. I recommend a minimal patch that only updates the import path, then reruns npm run build.",
  },
];

export const featureRequestResponse =
  "CodeGuardian is a debugger, not a feature-building agent. I can help repair reproducible failures, but I will not add unrelated product functionality.";

export const diagnosticCommands = [
  "npm run typecheck",
  "npm test",
  "npm run build",
];
