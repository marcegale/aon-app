"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const userNavItems = [
  {
    name: "Procesador de facturas",
    href: "/agents/accounting/invoice-processor",
    short: "F",
  },
];

const adminNavItems = [
  {
    name: "X Agent",
    href: "/admin/x-agent",
    short: "X",
  },
];

const bottomItems = [
  {
    name: "Cerrar sesión",
    href: "/logout",
    short: "→",
  },
];

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(user?.app_metadata?.role === "admin");
    });
  }, []);

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } hidden md:block shrink-0 overflow-hidden border-r border-white/10 bg-[#183A37] px-5 py-6 transition-all duration-300`}
    >
      <div className="mb-10">
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center">
            <img src="/brand/logo-icon.png" alt="ai.gency" className="h-8 w-8 object-contain" />
          </div>
        ) : (
          <>
            <img src="/brand/logo-white.png" alt="ai.gency" className="h-7 w-auto" />
            <h1 className="mt-2 text-sm font-medium text-white/50">
              Operations Center
            </h1>
          </>
        )}
      </div>

      <nav className="space-y-2 text-sm">
        {[...userNavItems, ...(isAdmin ? adminNavItems : [])].map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`block rounded-xl px-4 py-3 transition ${
                collapsed ? "text-center" : ""
              } ${
                isActive
                  ? "border border-white/10 bg-[#0F2422] text-white shadow-md shadow-black/20"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              {collapsed ? item.short : item.name}
            </Link>
          );
        })}

        {isAdmin && !collapsed && (
          <p className="mt-4 px-4 text-[10px] uppercase tracking-[0.22em] text-white/25">
            Admin
          </p>
        )}

        <div className="mt-2">
          {bottomItems.map((item) => {
            return (
              <Link
                key={item.name}
                href={item.href}
                prefetch={false}
                className={`block rounded-xl px-4 py-3 text-white/50 transition hover:bg-white/5 hover:text-white ${
                  collapsed ? "text-center" : ""
                }`}
              >
                {collapsed ? item.short : item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mt-10 rounded-2xl border border-[#C96F3B]/20 bg-[#0F2422] p-4">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="h-2.5 w-2.5 rounded-full bg-[#C96F3B]" />
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.22em] text-[#C96F3B]">
              System Status
            </p>
            <p className="mt-2 text-sm text-white/70">
              Invoice agent operational
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#C96F3B]" />
              <span className="text-sm text-white">Active</span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
