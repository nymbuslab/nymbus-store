export type OnboardingStepKey =
  | "loja"
  | "endereco"
  | "logo"
  | "identidade"
  | "categoria"
  | "produto"
  | "entrega"
  | "pagamento"
  | "revisao";

export type OnboardingStep = {
  key: OnboardingStepKey;
  href: string;
  label: string;
  shortLabel: string;
  optional?: boolean;
};

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    key: "loja",
    href: "/admin/onboarding/loja",
    label: "Dados da loja",
    shortLabel: "Loja",
  },
  {
    key: "endereco",
    href: "/admin/onboarding/endereco",
    label: "Endereço da loja",
    shortLabel: "Endereço",
  },
  {
    key: "logo",
    href: "/admin/onboarding/logo",
    label: "Logo da loja",
    shortLabel: "Logo",
  },
  {
    key: "identidade",
    href: "/admin/onboarding/identidade-visual",
    label: "Identidade visual",
    shortLabel: "Identidade",
    optional: true,
  },
  {
    key: "categoria",
    href: "/admin/onboarding/categoria",
    label: "Primeira categoria",
    shortLabel: "Categoria",
  },
  {
    key: "produto",
    href: "/admin/onboarding/produto",
    label: "Primeiro produto",
    shortLabel: "Produto",
  },
  {
    key: "entrega",
    href: "/admin/onboarding/entrega",
    label: "Retirada e entrega",
    shortLabel: "Entrega",
  },
  {
    key: "pagamento",
    href: "/admin/onboarding/pagamento",
    label: "Gateway de pagamento",
    shortLabel: "Pagamento",
  },
  {
    key: "revisao",
    href: "/admin/onboarding/revisao",
    label: "Revisão e ativação",
    shortLabel: "Revisão",
  },
] as const;

export type OnboardingChecklist = Record<OnboardingStepKey, boolean>;

export const EMPTY_CHECKLIST: OnboardingChecklist = {
  loja: false,
  endereco: false,
  logo: false,
  identidade: false,
  categoria: false,
  produto: false,
  entrega: false,
  pagamento: false,
  revisao: false,
};
