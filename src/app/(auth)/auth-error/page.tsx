import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Erro de autenticação | Nymbus Store",
};

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Não foi possível autenticar</CardTitle>
        <CardDescription>
          O link expirou ou é inválido. Tente novamente a partir do e-mail de
          confirmação ou faça login com sua senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReasonMessage searchParams={searchParams} />
      </CardContent>
      <CardFooter className="flex gap-4">
        <Link
          href="/login"
          className="text-sm text-foreground underline underline-offset-4"
        >
          Ir para o login
        </Link>
        <Link
          href="/signup"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Criar nova conta
        </Link>
      </CardFooter>
    </Card>
  );
}

async function ReasonMessage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  if (!reason) return null;
  return <p className="text-sm text-muted-foreground">Motivo: {reason}</p>;
}
