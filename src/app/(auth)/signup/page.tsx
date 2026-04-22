import type { Metadata } from "next";
import { SignupForm } from "@/modules/auth/components/signup-form";

export const metadata: Metadata = {
  title: "Criar conta | Nymbus Store",
};

export default function SignupPage() {
  return <SignupForm />;
}
