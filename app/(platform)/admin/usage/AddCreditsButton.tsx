"use client";

export function AddCreditsButton({ userId }: { userId: string }) {
  return (
    <button
      onClick={async () => {
        await fetch("/api/admin/add-credits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            amount: 100,
          }),
        });

        window.location.reload();
      }}
      className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20"
    >
      +100
    </button>
  );
}