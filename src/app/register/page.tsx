"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",
  HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",
  KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
  MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",
  MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",
  OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",
  VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

type AccountType = "agent" | "fsbo" | null;

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseState, setLicenseState] = useState("");
  const [brokerageName, setBrokerageName] = useState("");

  function validateForm(): boolean {
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address";
    if (!phone.trim()) errors.phone = "Phone number is required";
    if (!password) errors.password = "Password is required";
    else if (password.length < 8)
      errors.password = "Password must be at least 8 characters";
    if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    if (accountType === "agent") {
      if (!licenseNumber.trim())
        errors.licenseNumber = "License number is required";
      if (!licenseState) errors.licenseState = "License state is required";
      if (!brokerageName.trim())
        errors.brokerageName = "Brokerage name is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const role = accountType === "agent" ? "agent" : "fsbo";

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          role,
          ...(accountType === "agent" && {
            license_number: licenseNumber,
            license_state: licenseState,
            brokerage_name: brokerageName,
          }),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  function FieldError({ field }: { field: string }) {
    if (!fieldErrors[field]) return null;
    return (
      <span style={{ color: "#f87171", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>
        {fieldErrors[field]}
      </span>
    );
  }

  if (success) {
    return (
      <div className="login-bg">
        <div className="login-card animate-fade-in" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>&#9993;</div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Check Your Email</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
            We sent a verification link to <strong style={{ color: "var(--foreground)" }}>{email}</strong>.
            Click the link in the email to verify your account.
          </p>
          <Link
            href="/login"
            className="btn btn-accent btn-lg"
            style={{ display: "inline-block", marginTop: "1.5rem", textDecoration: "none" }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-bg">
      <div className="login-card animate-fade-in" style={{ maxWidth: step === 2 ? "480px" : "440px" }}>
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
            <path d="M24 10L8 22h4v14h8v-8h8v8h8V22h4L24 10z" fill="currentColor" />
          </svg>
        </div>

        <h1>Create Account</h1>
        <p className="login-subtitle">
          {step === 1 ? "Choose your account type" : "Fill in your details"}
        </p>

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

        {/* Step 1: Account Type Selection */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={() => { setAccountType("agent"); setStep(2); }}
              style={{
                background: accountType === "agent" ? "rgba(var(--accent-rgb, 212 175 55), 0.15)" : "var(--card-bg, rgba(255,255,255,0.05))",
                border: accountType === "agent" ? "2px solid var(--accent)" : "1px solid var(--border, rgba(255,255,255,0.1))",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                cursor: "pointer",
                textAlign: "left",
                color: "var(--foreground)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Agent / Broker
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)", lineHeight: 1.5 }}>
                Licensed real estate professionals. Access MLS listings, CMA tools, e-contracts, and more.
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setAccountType("fsbo"); setStep(2); }}
              style={{
                background: accountType === "fsbo" ? "rgba(var(--accent-rgb, 212 175 55), 0.15)" : "var(--card-bg, rgba(255,255,255,0.05))",
                border: accountType === "fsbo" ? "2px solid var(--accent)" : "1px solid var(--border, rgba(255,255,255,0.1))",
                borderRadius: "0.75rem",
                padding: "1.25rem",
                cursor: "pointer",
                textAlign: "left",
                color: "var(--foreground)",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                FSBO Seller
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)", lineHeight: 1.5 }}>
                For Sale By Owner. List your property and manage showings without an agent.
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Registration Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <button
              type="button"
              onClick={() => { setStep(1); setFieldErrors({}); setError(null); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "0.8125rem",
                padding: 0,
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              &larr; Back to account type
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group">
                <label htmlFor="reg-first" className="form-label">First Name</label>
                <input
                  id="reg-first"
                  type="text"
                  className="form-input"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <FieldError field="firstName" />
              </div>
              <div className="form-group">
                <label htmlFor="reg-last" className="form-label">Last Name</label>
                <input
                  id="reg-last"
                  type="text"
                  className="form-input"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <FieldError field="lastName" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="form-label">Email</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FieldError field="email" />
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone" className="form-label">Phone</label>
              <input
                id="reg-phone"
                type="tel"
                className="form-input"
                placeholder="(555) 123-4567"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <FieldError field="phone" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div className="form-group">
                <label htmlFor="reg-pass" className="form-label">Password</label>
                <input
                  id="reg-pass"
                  type="password"
                  className="form-input"
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FieldError field="password" />
              </div>
              <div className="form-group">
                <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  className="form-input"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <FieldError field="confirmPassword" />
              </div>
            </div>

            {accountType === "agent" && (
              <>
                <hr style={{ border: "none", borderTop: "1px solid var(--border, rgba(255,255,255,0.1))", margin: "1rem 0" }} />
                <p style={{ fontSize: "0.8125rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
                  License Information
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div className="form-group">
                    <label htmlFor="reg-license" className="form-label">License Number</label>
                    <input
                      id="reg-license"
                      type="text"
                      className="form-input"
                      placeholder="License #"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      required
                    />
                    <FieldError field="licenseNumber" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-state" className="form-label">License State</label>
                    <select
                      id="reg-state"
                      className="form-input"
                      value={licenseState}
                      onChange={(e) => setLicenseState(e.target.value)}
                      required
                    >
                      <option value="">Select state</option>
                      {US_STATES.map((st) => (
                        <option key={st} value={st}>
                          {STATE_NAMES[st]}
                        </option>
                      ))}
                    </select>
                    <FieldError field="licenseState" />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-brokerage" className="form-label">Brokerage Name</label>
                  <input
                    id="reg-brokerage"
                    type="text"
                    className="form-input"
                    placeholder="Your brokerage"
                    value={brokerageName}
                    onChange={(e) => setBrokerageName(e.target.value)}
                    required
                  />
                  <FieldError field="brokerageName" />
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-accent btn-lg"
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        <p
          style={{
            textAlign: "center",
            marginTop: "1.25rem",
            fontSize: "0.875rem",
            color: "var(--muted)",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
