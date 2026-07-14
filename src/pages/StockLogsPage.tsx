import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Fragment } from 'react/jsx-runtime'
import { getAuditLogs } from '@/api/auditLogs'
import type { AuditLog } from '@/types/auditLog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { PaginationFooter } from '@/components/ui/pagination-footer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

export default function StockLogsPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [page, perPage])

  const [allLogs, setAllLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchAll() {
      setIsLoading(true)
      let current = 1
      let last = 1
      const fetched: AuditLog[] = []
      
      try {
        do {
          const res = await getAuditLogs({
            page: current,
            per_page: 100,
            action: action || undefined,
            from: from || undefined,
            to: to || undefined,
          })
          
          if (!isMounted) return
          fetched.push(...res.data)
          last = res.meta.last_page
          current++
        } while (current <= last)
        
        if (isMounted) {
          setAllLogs(fetched)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchAll()

    return () => {
      isMounted = false
    }
  }, [action, from, to])

  const validActions = ['create', 'update', 'delete', 'stock_update', 'variant_create', 'variant_update', 'variant_delete']
  const filteredLogs = allLogs.filter(log => {
    if (!validActions.includes(log.action)) return false;
    
    if (['create', 'update', 'delete'].includes(log.action)) {
      const mod = log.module?.toLowerCase() || '';
      const entity = log.entity_type?.toLowerCase() || '';
      return mod.includes('product') || mod.includes('variant') || mod.includes('stock') ||
             entity.includes('product') || entity.includes('variant');
    }
    
    return true;
  })
  
  const startIndex = (page - 1) * perPage
  const logs = filteredLogs.slice(startIndex, startIndex + perPage)
  
  const meta = {
    current_page: page,
    per_page: perPage,
    total: filteredLogs.length,
    last_page: Math.ceil(filteredLogs.length / perPage) || 1
  }

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value)
      setPage(1)
    }
  }

  function formatActionLabel(actionKey: string): string {
    const key = `auditLogs.actions.${actionKey}`
    const translated = t(key)
    return translated === key ? actionKey : translated
  }

  const actionOptions = [
    {
      value: 'all',
      label: t('auditLogs.allActions'),
    },
    ...validActions.map((actionKey) => ({
      value: actionKey,
      label: formatActionLabel(actionKey),
    })),
  ]

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-white">{t('stock.logsTitle') || 'Stock Logs'}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
              items={actionOptions}
              value={action || null}
              onValueChange={(value) => {
                setAction(value === 'all' || value === null ? '' : value)
                setPage(1)
              }}
          >
            <SelectTrigger
                className="w-44"
                aria-label={t('auditLogs.filterAction')}
            >
              <SelectValue placeholder={t('auditLogs.filterAction')} />
            </SelectTrigger>

            <SelectContent>
              {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <Table ref={scrollRef} containerClassName="flex-1 min-h-0 pr-2 border rounded-md">
          <TableHeader>
            <TableRow>
              <TableHead>{t('auditLogs.date')}</TableHead>
              <TableHead>{t('auditLogs.actor')}</TableHead>
              <TableHead>{t('auditLogs.action')}</TableHead>
              <TableHead>{t('auditLogs.entity')}</TableHead>
              <TableHead>{t('auditLogs.description')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-500">
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
                  <TableCell>{formatActionLabel(log.action)}</TableCell>
                  <TableCell>{log.entity_label ?? `${log.entity_type} #${log.entity_id}`}</TableCell>
                  <TableCell>{log.description ?? '-'}</TableCell>
                </TableRow>
                {expandedId === log.id && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-zinc-900/50">
                      <ChangesDiff log={log} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
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
