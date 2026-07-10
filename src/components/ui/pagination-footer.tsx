import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationFooterProps {
    page: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    perPage: number
    setPerPage: (size: number) => void
    lastPage: number
    total: number
}

export function PaginationFooter({ page, setPage, perPage, setPerPage, lastPage }: PaginationFooterProps) {
    const { t } = useTranslation()

    return (
        <div className="mt-4 flex items-center justify-end gap-4 text-sm shrink-0">
            <select
                value={perPage}
                onChange={(e) => {
                    setPerPage(Number(e.target.value))
                    setPage(1)
                }}
                className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-200 outline-none focus:border-purple-500 cursor-pointer"
                aria-label={t('auditLogs.perPage')}
            >
                {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                        {size}/page
                    </option>
                ))}
            </select>
            
            <span className="text-zinc-500 text-xs">
                Page {page} of {lastPage}
            </span>
            
            <div className="flex items-center gap-1">
                <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                    <ChevronLeft className="h-4 w-4 text-zinc-400" />
                </Button>
                <Button
                    size="icon-sm"
                    variant="ghost"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => p + 1)}
                >
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                </Button>
            </div>
        </div>
    )
}
