import type { Metadata } from "next";
import { Store } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = {
  title: "Dashboard | Nymbus Store",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumo operacional da sua loja."
      />
      <EmptyState
        icon={Store}
        title="Nenhuma loja configurada ainda"
        description="Conclua o onboarding para começar a cadastrar produtos e receber pedidos. O wizard de configuração inicial chega na Fase 2."
      />
    </div>
  );
}
