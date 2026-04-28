"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    name: "Procesador de facturas",
    href: "/agents/accounting/invoice-processor",
    short: "F",
  },
  // {
  //   name: "Uso / Créditos",
  //   href: "/admin/usage",
  //   short: "U",
  // },
  {
    name: "Cerrar sesión",
    href: "/logout",
    short: "X",
  },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } shrink-0 overflow-hidden border-r border-white/10 bg-[#0E1118] px-5 py-6 transition-all duration-300`}
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
            <h1 className="mt-1 text-2xl font-semibold text-white">
              Control Center
            </h1>
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
              prefetch={item.href === "/logout" ? false : undefined}
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
            <p className="mt-2 text-sm text-white/70">
              Invoice agent operational
            </p>
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