"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction, type AuthActionState } from "@/modules/auth/actions";

const initialState: AuthActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Criando conta..." : "Criar conta"}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar sua conta de lojista</CardTitle>
        <CardDescription>
          Depois do cadastro você recebe um e-mail para confirmar o acesso.
        </CardDescription>
      </CardHeader>
      <form action={formAction} noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              aria-invalid={!!state.fieldErrors?.email}
              aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
            />
            {state.fieldErrors?.email ? (
              <p id="email-error" className="text-sm text-destructive">
                {state.fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              aria-invalid={!!state.fieldErrors?.password}
              aria-describedby={
                state.fieldErrors?.password ? "password-error" : "password-hint"
              }
            />
            {state.fieldErrors?.password ? (
              <p id="password-error" className="text-sm text-destructive">
                {state.fieldErrors.password}
              </p>
            ) : (
              <p id="password-hint" className="text-sm text-muted-foreground">
                Mínimo 8 caracteres.
              </p>
            )}
          </div>
          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <SubmitButton />
          <p className="text-sm text-muted-foreground text-center">
            Já tem conta?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
