import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-6",
      "bg-white border border-bios-line rounded-xl",
      className
    )}>
      {Icon && (
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
          <Icon className="w-7 h-7 text-bios-blue" />
        </div>
      )}
      <h3 className="font-outfit text-xl font-black text-bios-navy mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-xs leading-relaxed mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
