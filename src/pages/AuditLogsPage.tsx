import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Fragment } from 'react/jsx-runtime'
import { useAuditLogsQuery } from '@/features/auditLogs'
import type { AuditLog } from '@/types/auditLog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { PaginationFooter } from '@/components/ui/pagination-footer'

function ChangesDiff({ log }: { log: AuditLog }) {
  const { t } = useTranslation()
  const oldValues = log.changes?.old ?? {}
  const newValues = log.changes?.new ?? {}
  const fields = [...new Set([...Object.keys(oldValues), ...Object.keys(newValues)])]

  if (fields.length === 0) {
    return <span className="text-zinc-500">{t('auditLogs.noChanges')}</span>
  }

  return (
    <div className="flex flex-col gap-1">
      {fields.map((field) => (
        <div key={field} className="text-xs">
          <span className="font-mono text-zinc-400">{field}</span>
          <span className="mx-2 text-rose-400 line-through">{String(oldValues[field] ?? '—')}</span>
          <span className="text-green-400">{String(newValues[field] ?? '—')}</span>
        </div>
      ))}
    </div>
  )
}

export default function AuditLogsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [module, setModule] = useState('')
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [page, perPage])

  const { data, isLoading } = useAuditLogsQuery({
    page,
    per_page: perPage,
    module: module || undefined,
    action: action || undefined,
    from: from || undefined,
    to: to || undefined,
  })

  function formatActionLabel(actionKey: string): string {
    const key = `auditLogs.actions.${actionKey}`
    const translated = t(key)
    return translated === key ? actionKey : translated
  }

  const logs = data?.data ?? []
  const meta = data?.meta

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value)
      setPage(1)
    }
  }

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            value={module}
            onChange={(e) => updateFilter(setModule)(e.target.value)}
            placeholder={t('auditLogs.filterModule')}
            className="w-44"
          />
          <Input
            value={action}
            onChange={(e) => updateFilter(setAction)(e.target.value)}
            placeholder={t('auditLogs.filterAction')}
            className="w-44"
          />
          <Input
            type="date"
            value={from}
            onChange={(e) => updateFilter(setFrom)(e.target.value)}
            aria-label={t('auditLogs.from')}
            className="w-40"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => updateFilter(setTo)(e.target.value)}
            aria-label={t('auditLogs.to')}
            className="w-40"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-sm text-zinc-500">{t('admin.loading')}</div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 pr-2 border rounded-md bg-zinc-900">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('auditLogs.date')}</TableHead>
              <TableHead>{t('auditLogs.actor')}</TableHead>
              <TableHead>{t('auditLogs.module')}</TableHead>
              <TableHead>{t('auditLogs.action')}</TableHead>
              <TableHead>{t('auditLogs.entity')}</TableHead>
              <TableHead>{t('auditLogs.description')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-500">
                  {t('auditLogs.empty')}
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <Fragment key={log.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setExpandedId((id) => (id === log.id ? null : log.id))}
                >
                  <TableCell>{new Date(log.occurred_at).toLocaleString()}</TableCell>
                  <TableCell>{log.actor_name}</TableCell>
                  <TableCell>{log.module}</TableCell>
                  <TableCell>{formatActionLabel(log.action)}</TableCell>
                  <TableCell>{log.entity_label ?? `${log.entity_type} #${log.entity_id}`}</TableCell>
                  <TableCell>{log.description ?? '-'}</TableCell>
                </TableRow>
                {expandedId === log.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-zinc-900/50">
                      <ChangesDiff log={log} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
        </div>
      )}

      <PaginationFooter 
          page={page} 
          setPage={setPage} 
          perPage={perPage} 
          setPerPage={setPerPage} 
          lastPage={meta?.last_page ?? 1} 
          total={meta?.total ?? 0} 
      />
    </div>
  )
}
