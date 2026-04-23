import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { getActiveStore } from "@/modules/stores/queries";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const store = await getActiveStore();
  if (!store) redirect("/admin");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuração inicial"
        description={`Complete os passos abaixo para ativar a loja "${store.name}".`}
      />
      {children}
    </div>
  );
}
