import * as React from "react"
import { cn } from "@/lib/utils"

export interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle: string
  statusLabel: string
  statusVariant?: "todo" | "in-progress" | "done"
  dotColorClass?: string
}

export function TaskCard({
  title,
  subtitle,
  statusLabel,
  statusVariant = "todo",
  dotColorClass = "bg-red-500",
  className,
  ...props
}: TaskCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-4 border-b border-zinc-900",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5", dotColorClass)} />
        <div>
          <p className="text-sm font-medium text-zinc-200">{title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <span
        className={cn(
          "text-xs px-2 py-1 rounded font-medium",
          {
            "bg-zinc-900 text-zinc-400": statusVariant === "todo",
            "bg-amber-500/10 text-amber-500": statusVariant === "in-progress",
            "bg-green-500/10 text-green-500": statusVariant === "done",
          }
        )}
      >
        {statusLabel}
      </span>
    </div>
  )
}
