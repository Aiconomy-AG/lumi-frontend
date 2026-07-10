import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import type { TaskStatus } from "@/types/task"

export interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
    taskId: number
    title: string
    projectName?: string
    assignees: { id: number, name: string }[]
    status: TaskStatus
    dueDate: string
    statusLabel: string
}

export const statusBadgeClass: Record<TaskStatus, string> = {
    to_do: "bg-zinc-800/60 text-zinc-300 ring-1 ring-inset ring-zinc-700/60",
    in_progress: "bg-zinc-800/60 text-zinc-200 ring-1 ring-inset ring-zinc-700/60",
    blocked: "bg-zinc-800/60 text-zinc-200 ring-1 ring-inset ring-zinc-700/60",
    complete: "bg-zinc-800/60 text-zinc-400 ring-1 ring-inset ring-zinc-700/60",
}

export const statusDotClass: Record<TaskStatus, string> = {
    to_do: "bg-zinc-500",
    in_progress: "bg-amber-400",
    blocked: "bg-rose-400",
    complete: "bg-emerald-400",
}

const avatarColors = [
    "bg-sky-600/80",
    "bg-violet-600/80",
    "bg-emerald-600/80",
    "bg-orange-600/80",
    "bg-pink-600/80",
    "bg-teal-600/80",
]

export function avatarColorFor(id: number) {
    return avatarColors[id % avatarColors.length]
}

export function initialsOf(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
}

import { TableRow, TableCell } from '@/components/ui/table'

export function TaskCard({
    taskId,
    title,
    projectName = '—',
    assignees,
    status,
    dueDate,
    statusLabel,
    className,
    onClick
}: TaskCardProps) {
    const navigate = useNavigate()

    const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
        if (onClick) onClick(e as any)
        if (taskId) navigate(`/tasks/${taskId}`)
    }

    return (
        <TableRow
            onClick={handleClick}
            className={cn("cursor-pointer text-sm", className)}
        >
            <TableCell>
                <div className="flex items-center gap-3 text-zinc-200 font-medium">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDotClass[status])}></span>
                    <span className={cn("truncate", status === "complete" && "line-through text-zinc-500")} title={title}>{title}</span>
                </div>
            </TableCell>

            <TableCell className="text-zinc-300 text-center">
                {projectName}
            </TableCell>

            <TableCell>
                <div className="flex items-center justify-center">
                    {assignees.map((user) => (
                        <span
                            key={user.id}
                            title={user.name}
                            className={cn(
                                "flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold text-white ring-2 ring-zinc-950 -ml-2 first:ml-0",
                                avatarColorFor(user.id)
                            )}
                        >
                            {initialsOf(user.name)}
                        </span>
                    ))}
                </div>
            </TableCell>

            <TableCell className="text-center">
                <span className={cn("inline-flex items-center justify-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium", statusBadgeClass[status])}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", statusDotClass[status])}></span>
                    {statusLabel}
                </span>
            </TableCell>

            <TableCell className="text-zinc-400 text-center">
                {dueDate?.slice(0, 10)}
            </TableCell>
        </TableRow>
    )
}
