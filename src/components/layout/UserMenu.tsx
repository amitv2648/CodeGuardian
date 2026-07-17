"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { signOut, getUserInitials } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1 rounded-md border-none cursor-pointer text-sm"
        style={{ background: "var(--cg-bg-tertiary)", color: "var(--cg-text)" }}
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
        ) : (
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ background: "var(--cg-accent)", color: "#fff" }}
          >
            {getUserInitials(user)}
          </span>
        )}
        <span className="hidden sm:inline max-w-[160px] truncate">{user.email}</span>
        <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--cg-text-muted)" }} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1 w-48 rounded-md border shadow-lg z-50 py-1"
          style={{ background: "var(--cg-bg-secondary)", borderColor: "var(--cg-border)" }}
        >
          <div className="px-3 py-2 text-xs border-b" style={{ borderColor: "var(--cg-border)", color: "var(--cg-text-muted)" }}>
            {user.email}
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm border-none cursor-pointer text-left"
            style={{ background: "transparent", color: "var(--cg-text)" }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
