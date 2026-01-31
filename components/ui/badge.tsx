import { cn } from "@/lib/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        {
          "bg-zinc-700 text-zinc-300": variant === "default",
          "bg-emerald-500/10 text-emerald-400": variant === "success",
          "bg-amber-500/10 text-amber-400": variant === "warning",
          "bg-red-500/10 text-red-400": variant === "error",
        },
        className
      )}
      {...props}
    />
  );
}

type Status = "pending" | "approved" | "rejected";

export function StatusBadge({ status }: { status: Status | string }) {
  const variants: Record<
    Status,
    { variant: "warning" | "success" | "error"; label: string }
  > = {
    pending: { variant: "warning", label: "In Review" },
    approved: { variant: "success", label: "Approved" },
    rejected: { variant: "error", label: "Rejected" },
  };

  const normalizedStatus = status as Status;
  const config = variants[normalizedStatus] ?? {
    variant: "default" as const,
    label: status,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
