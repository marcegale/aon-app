"use client";

import { useState } from "react";
import Sidebar from "../../components/layout/sidebar";
import Header from "../../components/layout/header";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex">
      <Sidebar collapsed={collapsed} />

      <main className={`flex-1 transition-all ${collapsed ? "ml-20" : "ml-0"}`}>
        <Header onToggle={() => setCollapsed((prev) => !prev)} />
        <div className="px-6 py-2 text-xs text-[#C9A24D]">
          collapsed: {collapsed ? "true" : "false"}
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}