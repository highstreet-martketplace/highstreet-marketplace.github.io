"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type SubmitStatus = "idle" | "submitting" | "success" | "error";
type LocalSignup = { email: string; createdAt: string };

const signupStorageKey = "highstreet-update-mail-list";
const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

const isValidEmail = (value: string) => {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [message, setMessage] = useState("");
  const [showSuccessPulse, setShowSuccessPulse] = useState(false);

  const canSubmit = useMemo(() => isValidEmail(email) && status !== "submitting", [email, status]);

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    setShowSuccessPulse(true);
    const timeoutId = window.setTimeout(() => setShowSuccessPulse(false), 2200);

    return () => window.clearTimeout(timeoutId);
  }, [status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (formspreeEndpoint) {
        const response = await fetch(formspreeEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            source: "highstreet pre-launch landing page",
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to submit at this time. Please try again.");
        }

        setStatus("success");
        setEmail("");
        setMessage("You’re on the list. Expect launch updates and early access news.");
        return;
      }

      const savedSignups = localStorage.getItem(signupStorageKey);
      const signups = savedSignups ? (JSON.parse(savedSignups) as LocalSignup[]) : [];
      const alreadyExists = signups.some((record) => record.email === normalizedEmail);

      if (alreadyExists) {
        setStatus("success");
        setMessage("This email is already on the update mail list.");
        return;
      }

      const updatedSignups: LocalSignup[] = [
        ...signups,
        {
          email: normalizedEmail,
          createdAt: new Date().toISOString(),
        },
      ];

      localStorage.setItem(signupStorageKey, JSON.stringify(updatedSignups));
      setStatus("success");
      setEmail("");
      setMessage("You’re on the list. Launch news and first access will land here.");
    } catch {
      setStatus("error");
      setMessage("Unable to submit at this time. Please try again.");
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-neutral-100 px-4 py-5 sm:px-6 sm:py-8 md:px-12 md:py-12">
      <div className="ambient-glow pointer-events-none" aria-hidden="true" />
      <div className={`success-veil ${showSuccessPulse ? "success-veil-visible" : ""}`} aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-between rounded-2xl border border-neutral-300/80 bg-white/90 p-5 shadow-[0_35px_80px_-40px_rgba(0,0,0,0.55)] backdrop-blur sm:p-6 md:min-h-[calc(100vh-4rem)] md:rounded-3xl md:p-10">
        <header className="flex items-center justify-between">
          <p className="logo-wordmark text-[1.75rem] text-neutral-950 sm:text-3xl">highstreet.</p>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-neutral-300 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-neutral-600 sm:text-xs">
              pre-launch
            </span>
          </div>
        </header>

        <div className="grid items-center gap-8 py-7 md:py-8 lg:grid-cols-[1fr_1.1fr] lg:py-0">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
              <span className="font-semibold text-neutral-950">HIGH</span>-end +
              <span className="font-semibold text-neutral-950"> Street</span>wear resale
            </p>
            <h1 className="text-[2rem] font-semibold leading-[1.08] text-neutral-950 sm:text-[2.3rem] md:text-6xl">
              Premium fashion.
              <br />
              Trusted sellers.
              <br />
              Sustainable luxury.
            </h1>
            <p className="max-w-xl text-[0.95rem] leading-relaxed text-neutral-600 md:text-base">
              The next destination for verified high-end and streetwear resale is almost live. Join the update mail
              list for first access, launch news, and early drops.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 placeholder:text-neutral-500 placeholder:opacity-100 outline-none transition focus:border-neutral-900"
                  aria-invalid={status === "error"}
                />
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`h-12 rounded-xl px-6 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-neutral-400 ${
                    status === "success"
                      ? "bg-neutral-800 shadow-[0_0_0_8px_rgba(0,0,0,0.04)]"
                      : "bg-neutral-950 hover:bg-neutral-800"
                  }`}
                >
                  {status === "submitting" ? "Joining..." : status === "success" ? "You’re in" : "Join list"}
                </button>
              </div>
              <p
                className={`text-sm ${
                  status === "error" ? "text-red-600" : status === "success" ? "text-neutral-900" : "text-neutral-500"
                }`}
                aria-live="polite"
              >
                {message || "Join for launch updates, first access, and key product news."}
              </p>
            </form>

            {!formspreeEndpoint ? (
              <p className="text-xs leading-relaxed text-neutral-400">
                Free email collection is ready for Formspree. Add a <span className="font-medium text-neutral-600">NEXT_PUBLIC_FORMSPREE_ENDPOINT</span>
                {" "}value to send signups to a central inbox. Until then, submissions are stored locally in the browser.
              </p>
            ) : null}
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white p-3 shadow-[0_16px_40px_-28px_rgba(0,0,0,0.35)] sm:p-4 md:rounded-[2rem] md:p-6">
              <Image
                src="/images/mockup.png"
                alt="Highstreet marketplace mobile and desktop pre-launch preview"
                width={1460}
                height={1065}
                priority
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>

        <footer className="flex flex-col items-center gap-4 border-t border-neutral-200 pt-5 text-center text-xs uppercase tracking-[0.18em] text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="order-1 flex items-center justify-center gap-2 sm:order-3">
            <Link
              href="https://www.linkedin.com/company/highstreet-marketplace"
              target="_blank"
              rel="noreferrer"
              aria-label="Highstreet on LinkedIn"
              className="social-chip"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
                <line x1="8" y1="10" x2="8" y2="16" />
                <circle cx="8" cy="7.8" r="0.7" fill="currentColor" stroke="none" />
                <path d="M12 16v-3.3c0-1.2.8-2 2-2s2 .8 2 2V16" />
              </svg>
            </Link>
            <Link
              href="https://www.instagram.com/highstreet.marketplace"
              target="_blank"
              rel="noreferrer"
              aria-label="Highstreet on Instagram"
              className="social-chip"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current" width="16" height="16">
                <path d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5ZM17.5 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
              </svg>
            </Link>
          </div>
          <span className="order-2 sm:order-1">Enjoy the world.</span>
          <span className="order-3 sm:order-2">Launching soon</span>
        </footer>
      </div>
    </section>
  );
}