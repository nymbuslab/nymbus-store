import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
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
import { getDashboardMetrics } from "@/modules/dashboard/queries";
import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { formatCents } from "@/constants/orders";
import { cn } from "@/lib/utils";

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

  const [memberCount, onboarding, metrics] = await Promise.all([
    getStoreMemberCount(active.id),
    loadOnboardingState(active.id),
    getDashboardMetrics(active.id),
  ]);

  const isActive = onboarding.storeStatus === "active";
  const pendingCount = ONBOARDING_STEPS.filter(
    (s) => s.key !== "revisao" && !onboarding.checklist[s.key],
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={active.name}
        description={`/${active.slug}${memberCount > 1 ? ` · ${memberCount} membros` : ""}`}
        actions={<StoreStatusBadge status={active.status} />}
      />

      {!isActive ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span
                className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold"
                aria-hidden
              >
                !
              </span>
              Complete o onboarding
            </CardTitle>
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
              className={cn(buttonVariants(), "gap-1.5")}
            >
              {pendingCount > 0 ? "Continuar onboarding" : "Revisar e ativar"}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Faturamento (30 dias)"
          value={formatCents(metrics.revenueCentsLast30Days)}
          icon={TrendingUp}
          tone="success"
        />
        <MetricCard
          label="Pedidos (30 dias)"
          value={metrics.ordersLast30Days.toString()}
          icon={ShoppingBag}
          tone="primary"
        />
        <MetricCard
          label="Produtos publicados"
          value={metrics.activeProducts.toString()}
          icon={Package}
          tone="secondary"
        />
        <MetricCard
          label="Clientes"
          value={metrics.customersCount.toString()}
          icon={Users}
          tone="primary"
        />
      </div>
    </div>
  );
}

const TONES: Record<
  "primary" | "secondary" | "success",
  { bg: string; text: string }
> = {
  primary: { bg: "bg-primary/10", text: "text-primary" },
  secondary: { bg: "bg-secondary/30", text: "text-secondary-foreground" },
  success: { bg: "bg-success/10", text: "text-success" },
};

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
}) {
  const toneClasses = TONES[tone];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription className="text-xs uppercase tracking-wide">
          {label}
        </CardDescription>
        <span
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-md",
            toneClasses.bg,
            toneClasses.text,
          )}
          aria-hidden
        >
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
