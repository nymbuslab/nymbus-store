import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { StoreStatusBadge } from "@/components/admin/store-status-badge";
import { CreateStoreForm } from "@/modules/stores/components/create-store-form";
import {
  getActiveStore,
  getStoreMemberCount,
  listUserStores,
} from "@/modules/stores/queries";
import { loadOnboardingState } from "@/modules/onboarding/queries";
import { ONBOARDING_STEPS } from "@/constants/onboarding";

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

  const [memberCount, onboarding] = await Promise.all([
    getStoreMemberCount(active.id),
    loadOnboardingState(active.id),
  ]);

  const isActive = onboarding.storeStatus === "active";
  const pendingCount = ONBOARDING_STEPS.filter(
    (s) => s.key !== "revisao" && !onboarding.checklist[s.key],
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={active.name}
        description={`Loja /${active.slug}`}
        actions={<StoreStatusBadge status={active.status} />}
      />

      {!isActive ? (
        <Card>
          <CardHeader>
            <CardTitle>Complete o onboarding</CardTitle>
            <CardDescription>
              {pendingCount > 0
                ? `Faltam ${pendingCount} passo${pendingCount > 1 ? "s" : ""} para ativar a loja.`
                : "Todos os passos foram preenchidos — ative a loja para começar a operar."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={
                onboarding.nextPendingStep
                  ? ONBOARDING_STEPS.find(
                      (s) => s.key === onboarding.nextPendingStep,
                    )?.href ?? "/admin/onboarding"
                  : "/admin/onboarding/revisao"
              }
              className={buttonVariants()}
            >
              {pendingCount > 0 ? "Continuar onboarding" : "Revisar e ativar"}
            </Link>
          </CardContent>
        </Card>
      ) : null}

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
          description="CRUD completo na Fase 3"
          muted
        />
      </div>
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
