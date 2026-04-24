import { cn } from "@/lib/utils";

type Variant = "full" | "icon";

type Props = {
  variant?: Variant;
  className?: string;
};

export function NymbusLogo({ variant = "full", className }: Props) {
  if (variant === "icon") {
    return <NymbusMark className={className} />;
  }
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <NymbusMark />
      <span className="text-base font-semibold tracking-tight">
        Nymbus <span className="text-muted-foreground font-medium">Store</span>
      </span>
    </div>
  );
}

function NymbusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("size-7 shrink-0", className)}
    >
      <defs>
        <linearGradient id="nymbus-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary, #6344BC)" />
          <stop offset="100%" stopColor="var(--secondary, #73D2E6)" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="26"
        height="26"
        rx="7"
        fill="url(#nymbus-grad)"
      />
      <path
        d="M8 20 V8 L20 20 V8"
        stroke="white"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
