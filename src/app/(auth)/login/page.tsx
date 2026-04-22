import type { Metadata } from "next";
import { LoginForm } from "@/modules/auth/components/login-form";

export const metadata: Metadata = {
  title: "Entrar | Nymbus Store",
};

export default function LoginPage() {
  return <LoginForm />;
}
