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
    <div className="min-h-screen bg-[#183A37] text-white flex">
      <Sidebar collapsed={collapsed} />

      <main className="flex-1 min-w-0 transition-all">
        <Header onToggle={() => setCollapsed((prev) => !prev)} />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}