import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

type SearchTriggerProps = {
  onClick: () => void
  className?: string
}

export function SearchTrigger({ onClick, className }: SearchTriggerProps) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('search.open')}
      className={cn(
        'flex h-8 min-w-[200px] max-w-xs flex-1 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-left text-xs text-zinc-500 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-400 cursor-pointer',
        className,
      )}
    >
      <Search className="size-3.5 shrink-0" />
      <span className="flex-1 truncate">{t('search.placeholder')}</span>
      <kbd className="hidden rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline">
        {t('search.shortcut')}
      </kbd>
    </button>
  )
}
