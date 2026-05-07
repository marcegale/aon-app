"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { theme } from "@/app/styles/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  href: string;
  short?: string;
};

type NavSubGroup = {
  subtitle: string;
  items: NavItem[];
};

type NavGroup = {
  title: string;
  adminOnly?: boolean;
  subGroups: NavSubGroup[];
};

// ─── Navigation tree ──────────────────────────────────────────────────────────

const NAV: NavGroup[] = [
  {
    title: "Workspace",
    subGroups: [
      {
        subtitle: "",
        items: [
          { label: "Dashboard",               href: "/dashboard",  short: "D" },
          { label: "Diagnóstico empresarial",  href: "/assessment", short: "A" },
        ],
      },
    ],
  },
  {
    title: "Agentes",
    subGroups: [
      {
        subtitle: "Accounting",
        items: [
          { label: "Procesador de facturas", href: "/agents/accounting/invoice-processor",           short: "F" },
          { label: "Histórico",              href: "/agents/accounting/invoice-processor/historico", short: "H" },
        ],
      },
      {
        subtitle: "HR",
        items: [
          { label: "Recruiting", href: "/agents/hr/recruiting",      short: "R" },
        ],
      },
      {
        subtitle: "Operations",
        items: [
          { label: "Charlie", href: "/agents/operations/charlie", short: "C" },
        ],
      },
    ],
  },
  {
    title: "SuperAdmin",
    adminOnly: true,
    subGroups: [
      {
        subtitle: "",
        items: [
          { label: "Agent Runs",     href: "/admin/agent-runs", short: "AR" },
          { label: "Usage / Costos", href: "/admin/usage",      short: "U"  },
          { label: "Leads",          href: "/admin/leads",       short: "L"  },
          { label: "X Agent",        href: "/admin/x-agent",    short: "X"  },
          { label: "Charlie",        href: "/admin/charlie",    short: "Ch" },
        ],
      },
    ],
  },
  {
    title: "Cuenta",
    subGroups: [
      {
        subtitle: "",
        items: [
          { label: "Settings",      href: "/settings", short: "S"  },
          { label: "Cerrar sesión", href: "/logout",   short: "→"  },
        ],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(user?.app_metadata?.role === "admin");
    });
  }, []);

  // All color values come from theme — injected as CSS custom properties so
  // Tailwind's hover:/active: variants can reference them via [var(--x)].
  const cssVars = {
    "--s-bg":           theme.bg,
    "--s-surface":      theme.surface,
    "--s-surface-m":    theme.surfaceMuted,
    "--s-text":         theme.text,
    "--s-text-m":       theme.textMuted,
    "--s-accent":       theme.accent,
    "--s-border":       theme.border,
  } as React.CSSProperties;

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } hidden md:block shrink-0 overflow-y-auto overflow-x-hidden py-6 transition-all duration-300`}
      style={{
        background:  theme.bg,
        borderRight: `1px solid ${theme.border}`,
        paddingLeft:  collapsed ? undefined : "1.25rem",
        paddingRight: collapsed ? undefined : "1.25rem",
        ...cssVars,
      }}
    >
      {/* Logo */}
      <div className={`mb-10 ${collapsed ? "px-5" : ""}`}>
        {collapsed ? (
          <div className="flex h-10 w-10 items-center justify-center">
            <img src="/brand/logo-icon.png" alt="ai.gency" className="h-8 w-8 object-contain" />
          </div>
        ) : (
          <>
            <img src="/brand/logo-white.png" alt="ai.gency" className="h-7 w-auto" />
            <p className="mt-2 text-sm font-medium text-[var(--s-text-m)]">
              Operations Center
            </p>
          </>
        )}
      </div>

      {/* ── Single rendering loop: NAV → subGroups → items ── */}
      <nav className="flex flex-col gap-5 text-sm">
        {NAV.map((group) => {
          if (group.adminOnly && !isAdmin) return null;

          return (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--s-text-m)]">
                  {group.title}
                </p>
              )}

              <div className="flex flex-col gap-3">
                {group.subGroups.map((sg) => (
                  <div key={sg.subtitle || `${group.title}-items`}>
                    {!collapsed && sg.subtitle && (
                      <p className="mb-1 px-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--s-text-m)] opacity-60">
                        {sg.subtitle}
                      </p>
                    )}

                    <div className="space-y-1">
                      {sg.items.map((item) => {
                        const active   = isActive(pathname, item.href);
                        const indented = !collapsed && !!sg.subtitle;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            className={`flex items-center rounded-xl py-2.5 transition-colors ${
                              collapsed
                                ? "justify-center px-4"
                                : indented
                                  ? "gap-3 pl-6 pr-4"
                                  : "gap-3 px-4"
                            } ${
                              active
                                ? "border border-[var(--s-border)] bg-[var(--s-surface)] text-[var(--s-text)]"
                                : "text-[var(--s-text-m)] hover:bg-[var(--s-surface-m)] hover:text-[var(--s-text)]"
                            }`}
                          >
                            {collapsed ? (
                              <span className="text-xs font-semibold">{item.short}</span>
                            ) : (
                              <span>{item.label}</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Status widget */}
      <div
        className="mt-10 rounded-2xl p-4"
        style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
      >
        {collapsed ? (
          <div className="flex justify-center">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: theme.accent }} />
          </div>
        ) : (
          <>
            <p
              className="text-xs uppercase tracking-[0.22em]"
              style={{ color: theme.accent }}
            >
              System Status
            </p>
            <p className="mt-2 text-sm text-[var(--s-text-m)]">
              Invoice agent operational
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ background: theme.accent }} />
              <span className="text-sm text-[var(--s-text)]">Active</span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
