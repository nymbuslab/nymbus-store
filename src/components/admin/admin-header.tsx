"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AdminNav } from "@/components/admin/admin-nav";
import { signoutAction } from "@/modules/auth/actions";

type AdminHeaderProps = {
  userEmail: string | null;
};

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4 lg:px-6">
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
            <SheetTitle className="text-left">Nymbus Store</SheetTitle>
          </SheetHeader>
          <AdminNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 font-semibold tracking-tight">Nymbus Store</div>

      <div className="flex items-center gap-3">
        {userEmail ? (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {userEmail}
          </span>
        ) : null}
        <Separator orientation="vertical" className="hidden h-6 sm:block" />
        <form action={signoutAction}>
          <Button type="submit" variant="ghost" size="sm">
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
