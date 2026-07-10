import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface PaginationFooterProps {
    page: number
    setPage: React.Dispatch<React.SetStateAction<number>>
    perPage: number
    setPerPage: (size: number) => void
    lastPage: number
    total: number
}

export function PaginationFooter({ page, setPage, perPage, setPerPage, lastPage, total }: PaginationFooterProps) {
    const { t } = useTranslation()

    return (
        <div className="mt-4 flex items-center gap-2 shrink-0">
            <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                {t('orders.prev')}
            </Button>
            <Button
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
            >
                {t('orders.next')}
            </Button>
            <span className="ml-2 text-xs text-zinc-500">
                {t('auditLogs.pageInfo', { page, pages: lastPage, total })}
            </span>
            <select
                value={perPage}
                onChange={(e) => {
                    setPerPage(Number(e.target.value))
                    setPage(1)
                }}
                className="ml-auto h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-200 outline-none focus:border-purple-500 cursor-pointer"
                aria-label={t('auditLogs.perPage')}
            >
                {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                        {t('auditLogs.perPageOption', { count: size })}
                    </option>
                ))}
            </select>
        </div>
    )
}
