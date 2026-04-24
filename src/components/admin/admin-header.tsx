"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, User, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NymbusLogo } from "@/components/brand/nymbus-logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { signoutAction } from "@/modules/auth/actions";
import { StoreSwitcher } from "@/modules/stores/components/store-switcher";
import type { StoreRow } from "@/modules/stores/queries";
import { cn } from "@/lib/utils";

type AdminHeaderProps = {
  userEmail: string | null;
  stores: StoreRow[];
  activeStoreId: string | null;
};

function initialsFromEmail(email: string | null): string {
  if (!email) return "U";
  const local = email.split("@")[0] ?? "";
  if (!local) return "U";
  const parts = local.split(/[._-]/).filter(Boolean);
  const first = parts[0]?.[0] ?? local[0] ?? "U";
  const second = parts[1]?.[0] ?? local[1] ?? "";
  return (first + second).toUpperCase();
}

export function AdminHeader({ userEmail, stores, activeStoreId }: AdminHeaderProps) {
  const [open, setOpen] = useState(false);
  const initials = initialsFromEmail(userEmail);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur px-4 lg:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="text-left">
              <NymbusLogo />
            </SheetTitle>
          </SheetHeader>
          <AdminNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <Link
        href="/admin"
        aria-label="Nymbus Store"
        className="flex items-center"
      >
        <NymbusLogo variant="icon" className="lg:hidden" />
        <NymbusLogo className="hidden lg:flex" />
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {activeStoreId ? (
          <StoreSwitcher stores={stores} activeId={activeStoreId} />
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Menu do usuário"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "rounded-full overflow-hidden",
            )}
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {userEmail ? (
              <>
                <div className="flex flex-col gap-0.5 px-2 py-1.5">
                  <span className="text-xs text-muted-foreground">
                    Conectado como
                  </span>
                  <span className="text-sm font-medium truncate">{userEmail}</span>
                </div>
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuItem render={<Link href="/admin/configuracoes" />}>
              <User className="size-4" aria-hidden />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                void signoutAction();
              }}
            >
              <LogOut className="size-4" aria-hidden />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
