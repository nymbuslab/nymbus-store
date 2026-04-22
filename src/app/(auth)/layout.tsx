import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-muted/30">
      <Link
        href="/"
        className="text-xl font-semibold tracking-tight mb-6 text-foreground"
      >
        Nymbus Store
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
