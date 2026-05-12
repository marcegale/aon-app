import { Suspense } from "react";
import ApproveClient from "./ApproveClient";

export const metadata = { title: "Approve Atlas device — ai.gency" };

export default function AtlasRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0d1117]">
          <p className="text-sm text-white/40">Loading…</p>
        </div>
      }
    >
      <ApproveClient />
    </Suspense>
  );
}
