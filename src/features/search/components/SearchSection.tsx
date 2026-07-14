import type { LucideIcon } from 'lucide-react'
import { CommandItem } from '@/components/ui/command'
import { cn } from '@/lib/utils'

type SearchSectionItem = {
  id: string
  value: string
  title: string
  subtitle?: string | null
  icon?: LucideIcon
  onSelect: () => void
}

type SearchSectionProps = {
  title: string
  count: number
  colorClass: string
  icon: LucideIcon
  items: SearchSectionItem[]
  loading?: boolean
}

export function SearchSection({
  title,
  count,
  colorClass,
  icon: Icon,
  items,
  loading = false,
}: SearchSectionProps) {
  if (!loading && items.length === 0) {
    return null
  }

  return (
    <section className="flex min-h-[220px] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
      <header className={cn('flex items-center gap-2 border-b px-3 py-2.5', colorClass)}>
        <Icon className="size-4 shrink-0" />
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="ml-auto rounded-full border border-current/20 px-2 py-0.5 text-[11px] font-semibold">
          {loading ? '…' : count}
        </span>
      </header>

      <div className="flex-1 overflow-y-auto p-1">
        {loading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-md bg-zinc-800/80" />
            ))}
          </div>
        ) : (
          items.map((item) => (
            <CommandItem
              key={item.id}
              value={item.value}
              onSelect={item.onSelect}
              className="flex items-start gap-2 rounded-md px-2 py-2"
            >
              {item.icon ? <item.icon className="mt-0.5 size-4 shrink-0 text-zinc-500" /> : null}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{item.title}</div>
                {item.subtitle ? (
                  <div className="truncate text-xs text-zinc-500">{item.subtitle}</div>
                ) : null}
              </div>
            </CommandItem>
          ))
        )}
      </div>
    </section>
  )
}
