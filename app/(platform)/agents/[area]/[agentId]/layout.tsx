import type { ReactNode } from "react";
import AgentOperatingLayout from "@/components/agents/agent-operating-layout";
import AgentRightPanel from "@/components/agents/agent-right-panel";

export default function AgentRouteLayout({ children }: { children: ReactNode }) {
  return (
    <AgentOperatingLayout
      title="Agente de facturas"
      description="Workspace operativo para carga, revisión y exportación."
      rightPanel={<AgentRightPanel />}
    >
      {children}
    </AgentOperatingLayout>
  );
}
