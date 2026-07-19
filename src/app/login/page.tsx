"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signIn, signUp, signInWithGoogle } from "@/lib/auth";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/workspace");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      router.replace("/workspace");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace("/workspace");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cg-bg)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--cg-accent)" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--cg-bg)" }}
    >
      <div
        className="w-full max-w-md rounded-lg border p-8"
        style={{ background: "var(--cg-bg-secondary)", borderColor: "var(--cg-border)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <Shield className="w-7 h-7" style={{ color: "var(--cg-accent)" }} />
          <span className="text-xl font-semibold">CodeGuardian</span>
        </div>

        <h1 className="text-lg font-medium text-center mb-1">
          {isSignUp ? "Create your account" : "Sign in to CodeGuardian"}
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: "var(--cg-text-muted)" }}>
          {isSignUp ? "Start debugging broken repositories" : "Access your debugging workspace"}
        </p>

        {error && (
          <div
            className="mb-4 p-3 rounded-md text-sm"
            style={{
              background: "color-mix(in srgb, var(--cg-error) 15%, transparent)",
              color: "var(--cg-error)",
              border: "1px solid color-mix(in srgb, var(--cg-error) 30%, transparent)",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--cg-text-muted)" }}>
              Email
            </label>
            <input
              type="email"
              className="cg-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--cg-text-muted)" }}>
              Password
            </label>
            <input
              type="password"
              className="cg-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              disabled={loading}
            />
          </div>
          <button type="submit" className="cg-btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "var(--cg-border)" }} />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2" style={{ background: "var(--cg-bg-secondary)", color: "var(--cg-text-muted)" }}>
              or
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="cg-btn-secondary w-full flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Continue with Google
        </button>

        <p className="text-sm text-center mt-6" style={{ color: "var(--cg-text-muted)" }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="font-medium bg-transparent border-none cursor-pointer"
            style={{ color: "var(--cg-accent)" }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>

        <p className="text-xs text-center mt-4">
          <Link href="/" style={{ color: "var(--cg-text-muted)" }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
