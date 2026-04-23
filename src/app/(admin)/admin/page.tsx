import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StoreStatusBadge } from "@/components/admin/store-status-badge";
import { CreateStoreForm } from "@/modules/stores/components/create-store-form";
import {
  getActiveStore,
  getStoreMemberCount,
  listUserStores,
} from "@/modules/stores/queries";

export const metadata: Metadata = {
  title: "Dashboard | Nymbus Store",
};

export default async function AdminDashboardPage() {
  const stores = await listUserStores();

  if (stores.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bem-vindo à Nymbus Store"
          description="Você ainda não tem uma loja. Crie a primeira para começar."
        />
        <CreateStoreForm />
      </div>
    );
  }

  const active = await getActiveStore();
  if (!active) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" />
        <p className="text-sm text-muted-foreground">Nenhuma loja ativa.</p>
      </div>
    );
  }

  const memberCount = await getStoreMemberCount(active.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={active.name}
        description={`Loja /${active.slug}`}
        actions={<StoreStatusBadge status={active.status} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Membros da equipe" value={String(memberCount)} />
        <MetricCard
          label="Pedidos"
          value="—"
          description="Disponível na Fase 4"
          muted
        />
        <MetricCard
          label="Faturamento"
          value="—"
          description="Disponível na Fase 6"
          muted
        />
        <MetricCard
          label="Produtos"
          value="—"
          description="Disponível na Fase 3"
          muted
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos passos</CardTitle>
          <CardDescription>
            Complete o onboarding para ativar a loja (Fase 2).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Enquanto o wizard de onboarding não está pronto, você pode ir direto para
          as áreas do menu lateral (ainda sem conteúdo) ou aguardar a próxima fase.
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  muted = false,
}: {
  label: string;
  value: string;
  description?: string;
  muted?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className={muted ? "text-muted-foreground" : undefined}>
          {value}
        </CardTitle>
      </CardHeader>
      {description ? (
        <CardContent className="text-xs text-muted-foreground">
          {description}
        </CardContent>
      ) : null}
    </Card>
  );
}
