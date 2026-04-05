"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay then redirect
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
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

        <h1>HomeStar Properties</h1>
        <p className="login-subtitle">Agent Portal Login</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-user" className="form-label">
              Username or Email
            </label>
            <input
              id="login-user"
              type="text"
              className="form-input"
              placeholder="Enter your username or email"
              autoComplete="username"
              required
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
      </div>
    </div>
  );
}
