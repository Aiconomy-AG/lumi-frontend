import {useState, useRef, useEffect, useMemo} from 'react'
import { useTranslation } from 'react-i18next'
import { Fragment } from 'react/jsx-runtime'
import { useAuditLogsQuery } from '@/features/auditLogs'
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

  const { data: modulesData } = useAuditLogsQuery({
    page: 1,
    per_page: 100,
  })

  const { data: actionsData } = useAuditLogsQuery({
    page: 1,
    per_page: 100,
    module: module || undefined,
  })

  function formatActionLabel(actionKey: string): string {
    const key = `auditLogs.actions.${actionKey}`
    const translated = t(key)

    if (translated !== key) {
      return translated
    }

    return actionKey
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase())
  }

  const logs = data?.data ?? []
  const meta = data?.meta

  const moduleLogs = modulesData?.data ?? []
  const actionLogs = actionsData?.data ?? []

  const availableModules = useMemo(
      () =>
          [...new Set(moduleLogs.map((log) => log.module).filter(Boolean))].sort(),
      [moduleLogs]
  )

  const availableActions = useMemo(
      () =>
          [...new Set(actionLogs.map((log) => log.action).filter(Boolean))].sort(),
      [actionLogs]
  )

  const moduleOptions = [
    {
      value: 'all',
      label: t('auditLogs.allModules'),
    },
    ...availableModules.map((moduleKey) => ({
      value: moduleKey,
      label: formatModuleLabel(moduleKey),
    })),
  ]

  const actionOptions = [
    {
      value: 'all',
      label: t('auditLogs.allActions'),
    },
    ...availableActions.map((actionKey) => ({
      value: actionKey,
      label: formatActionLabel(actionKey),
    })),
  ]

  function formatModuleLabel(moduleKey: string): string {
    const key = `auditLogs.modules.${moduleKey}`
    const translated = t(key)

    if (translated !== key) {
      return translated
    }

    return moduleKey
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase())
  }

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value)
      setPage(1)
    }
  }

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Select
              items={moduleOptions}
              value={module || null}
              onValueChange={(value) => {
                const selectedModule = value === 'all' || value === null ? '' : value

                setModule(selectedModule)
                setAction('')
                setPage(1)
              }}
          >
            <SelectTrigger
                className="w-44"
                aria-label={t('auditLogs.filterModule')}
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>

            <SelectContent>
              {moduleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <SelectValue placeholder="Select an option" />
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
