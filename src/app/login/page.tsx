"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="login-bg">
      <div className="login-card animate-fade-in">
        {/* Logo / Brand */}
        <div className="login-logo">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="48" height="48" rx="10" fill="currentColor" fillOpacity="0.15" />
            <path
              d="M24 10L8 22h4v14h8v-8h8v8h8V22h4L24 10z"
              fill="currentColor"
            />
          </svg>
        </div>

        <h1>OneMLS</h1>
        <p className="login-subtitle">Agent Portal Login</p>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              marginBottom: "1rem",
              color: "#f87171",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-user" className="form-label">
              Email
            </label>
            <input
              id="login-user"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-pass" className="form-label">
              Password
            </label>
            <input
              id="login-pass"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              id="remember-me"
              type="checkbox"
              style={{ accentColor: "var(--accent)", width: "1rem", height: "1rem" }}
            />
            <label
              htmlFor="remember-me"
              style={{ fontSize: "0.875rem", color: "var(--muted)", cursor: "pointer" }}
            >
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-accent btn-lg"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.25rem",
            fontSize: "0.8125rem",
            color: "var(--muted)",
          }}
        >
          Lost your password?{" "}
          <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Reset it here
          </a>
        </p>

        <p
          style={{
            textAlign: "center",
            marginTop: "0.75rem",
            fontSize: "0.875rem",
            color: "var(--muted)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
