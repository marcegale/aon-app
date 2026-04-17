"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard", short: "D" },
  { name: "Inbox", href: "/inbox", short: "I" },
  { name: "Agents", href: "/agents", short: "A" },
  { name: "Knowledge", href: "/knowledge", short: "K" },
  { name: "Assessment", href: "/assessment", short: "As" },
  { name: "Tools", href: "/tools", short: "T" },
  { name: "Channels", href: "/channels", short: "C" },
  { name: "Analytics", href: "/analytics", short: "An" },
  { name: "Settings", href: "/settings", short: "S" },
];

export default function Sidebar({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-72"} shrink-0 overflow-hidden border-r border-white/10 bg-[#0E1118] px-5 py-6 transition-all duration-300`}
    >
      <div className="mb-10">
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#C9A24D]/20 bg-[#1C2230] text-sm font-semibold text-[#C9A24D]">
            N
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.28em] text-[#C9A24D]">
              Nexa Core
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Control Center</h1>
          </>
        )}
      </div>

      <nav className="space-y-2 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block rounded-xl px-4 py-3 transition ${
                collapsed ? "text-center" : ""
              } ${
                isActive
                  ? "border border-white/10 bg-[#1C2230] text-white shadow-md shadow-black/20"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {collapsed ? item.short : item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-2xl border border-[#C9A24D]/20 bg-[#1C2230] p-4">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-[#C9A24D]" />
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.22em] text-[#C9A24D]">
              System Status
            </p>
            <p className="mt-2 text-sm text-white/70">All agents operational</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#C9A24D]" />
              <span className="text-sm text-white">Active</span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}