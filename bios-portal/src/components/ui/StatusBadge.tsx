import { cn } from "@/lib/utils";
import type { ResultStatus } from "@/types";
import { RESULT_STATUS_LABELS, RESULT_STATUS_COLORS } from "@/types";

interface StatusBadgeProps {
  status: ResultStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "bios-chip",
      RESULT_STATUS_COLORS[status],
      "border-transparent",
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {RESULT_STATUS_LABELS[status]}
    </span>
  );
}
