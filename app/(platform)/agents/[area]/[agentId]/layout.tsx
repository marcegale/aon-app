import type { ReactNode } from "react";
import AgentOperatingLayout from "@/components/agents/agent-operating-layout";

export default function AgentRouteLayout({ children }: { children: ReactNode }) {
  return (
    <AgentOperatingLayout
      title="Agente de facturas"
      description="Workspace operativo para carga, revisión y exportación."
    >
      {children}
    </AgentOperatingLayout>
  );
}
