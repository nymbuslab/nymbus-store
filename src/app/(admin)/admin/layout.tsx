import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminHeader } from "@/components/admin/admin-header";
import { StoreThemeStyle } from "@/components/providers/store-theme-style";
import { getActiveStore, listUserStores } from "@/modules/stores/queries";
import { getStoreTheme } from "@/modules/theme/queries";
import { buildStoreTheme } from "@/lib/theme/derive";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [stores, active] = await Promise.all([listUserStores(), getActiveStore()]);
  const theme = active
    ? await getStoreTheme(active.id)
    : buildStoreTheme({ primary: null, secondary: null });

  return (
    <div data-store-theme className="min-h-screen bg-background">
      <StoreThemeStyle theme={theme} />
      <AdminHeader
        userEmail={user.email ?? null}
        stores={stores}
        activeStoreId={active?.id ?? null}
      />
      <div className="flex">
        <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:block">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
            <AdminNav />
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
