"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { IDEWorkspace } from "@/components/workspace/IDEWorkspace";

export default function WorkspacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoloadDemo = searchParams.get("demo") === "true";

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "var(--cg-bg)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--cg-accent)" }} />
      </div>
    );
  }

  if (!user) return null;

  return <IDEWorkspace autoloadDemo={autoloadDemo} />;
}
