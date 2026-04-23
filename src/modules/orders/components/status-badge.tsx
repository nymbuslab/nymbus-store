import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  type OrderStatus,
} from "@/constants/orders";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        ORDER_STATUS_TONE[status],
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
