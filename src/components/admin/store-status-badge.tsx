import { cn } from "@/lib/utils";
import { STORE_STATUS_LABEL, type StoreStatus } from "@/constants/stores";

const statusClasses: Record<StoreStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  configuring: "bg-warning/20 text-warning-foreground",
  active: "bg-success/20 text-success-foreground",
  blocked: "bg-destructive/20 text-destructive",
};

export function StoreStatusBadge({ status }: { status: StoreStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusClasses[status],
      )}
    >
      {STORE_STATUS_LABEL[status]}
    </span>
  );
}
