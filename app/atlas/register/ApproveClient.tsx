"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitApprovalRequest, type ApproveState } from "./approveAtlasDevice";

export default function ApproveClient() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [state, setState] = useState<ApproveState>("idle");

  if (!code) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1117] px-4">
        <div className="max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[#C96F3B]">Atlas</p>
          <h1 className="mt-4 text-xl font-semibold text-white">Missing registration code</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">
            Open the registration link from your Atlas Desktop application.
          </p>
        </div>
      </div>
    );
  }

  async function handleApprove() {
    setState("loading");
    const result = await submitApprovalRequest(code!);
    setState(result);
  }

  const done = state !== "idle" && state !== "loading";

  const messages: Partial<Record<ApproveState, string>> = {
    approved:         "Device approved. You can close this window.",
    sign_in_required: "Please sign in, then return to this page.",
    not_found:        "Registration code not found or has expired.",
    expired:          "Registration has expired. Please restart Atlas and try again.",
    already_processed:"This device registration has already been processed.",
    denied:           "Registration was denied.",
    unavailable:      "Service temporarily unavailable. Please try again.",
    network_error:    "Network error. Please check your connection and try again.",
  };

  const message = messages[state];
  const isSuccess = state === "approved";
  const needsSignIn = state === "sign_in_required";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1117] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[#C96F3B]">Atlas</p>
        <h1 className="mt-4 text-xl font-semibold text-white">Approve Atlas device</h1>
        <p className="mt-2 text-sm text-white/55">
          A device is requesting access to your workspace.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-[#0F2422] px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-white/40">Device code</p>
          <p className="mt-1 font-mono text-sm text-white">{code}</p>
        </div>

        {!done && (
          <button
            onClick={handleApprove}
            disabled={state === "loading"}
            className="mt-6 w-full rounded-xl border border-[#C96F3B]/25 bg-[#C96F3B]/10 px-4 py-3 text-sm font-medium text-[#F4EBD0] transition hover:bg-[#C96F3B]/15 disabled:opacity-50"
          >
            {state === "loading" ? "Approving…" : "Approve device"}
          </button>
        )}

        {message && (
          <p
            className={`mt-5 text-sm leading-6 ${isSuccess ? "text-emerald-400" : "text-white/70"}`}
          >
            {message}
          </p>
        )}

        {needsSignIn && (
          <a
            href="/login"
            className="mt-4 block text-center text-sm text-[#C96F3B] underline underline-offset-4"
          >
            Sign in
          </a>
        )}
      </div>
    </div>
  );
}
