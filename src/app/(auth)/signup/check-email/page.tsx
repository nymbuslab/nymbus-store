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
  title: "Confirme seu e-mail | Nymbus Store",
};

export default function CheckEmailPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirme seu e-mail</CardTitle>
        <CardDescription>
          Enviamos um link de confirmação para o e-mail cadastrado. Abra a caixa de
          entrada para concluir a criação da conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Não recebeu? Verifique a pasta de spam ou tente cadastrar novamente mais
          tarde.
        </p>
      </CardContent>
      <CardFooter>
        <Link
          href="/login"
          className="text-sm text-foreground underline underline-offset-4"
        >
          Voltar para o login
        </Link>
      </CardFooter>
    </Card>
  );
}
