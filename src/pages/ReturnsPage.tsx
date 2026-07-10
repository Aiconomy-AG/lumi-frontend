import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useReturnsQuery } from '@/features/returns'
import type { ReturnStatus } from '@/types/return'
import { formatPrice } from '@/lib/currency'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TablePagination } from '@/components/ui/table-pagination'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const RETURN_STATUSES: ReturnStatus[] = [
  'requested',
  'approved',
  'rejected',
  'received',
  'refunded',
]

function returnStatusVariant(status: ReturnStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'refunded':
      return 'default'
    case 'approved':
    case 'received':
      return 'secondary'
    case 'rejected':
      return 'destructive'
    default:
      return 'outline'
  }
}

export default function ReturnsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [status, setStatus] = useState<ReturnStatus | ''>('')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filters = {
    page,
    per_page: perPage,
    status: status || undefined,
    search: search || undefined,
    from: from || undefined,
    to: to || undefined,
  }

  const { data, isLoading } = useReturnsQuery(filters)

  const returns = data?.data ?? []
  const meta = data?.meta

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">{t('returns.title')}</h2>
        <p className="text-sm text-zinc-500">{t('returns.subtitle')}</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => resetPage(setSearch)(e.target.value)}
          placeholder={t('returns.searchPlaceholder')}
          className="w-56"
        />
        <Select
          value={status || 'all'}
          onValueChange={(value) => resetPage(setStatus)(value === 'all' ? '' : (value as ReturnStatus))}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('returns.filterStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('returns.allStatuses')}</SelectItem>
            {RETURN_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`returns.statuses.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={from}
          onChange={(e) => resetPage(setFrom)(e.target.value)}
          aria-label={t('returns.from')}
          className="w-40"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => resetPage(setTo)(e.target.value)}
          aria-label={t('returns.to')}
          className="w-40"
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-zinc-500">{t('admin.loading')}</div>
      ) : returns.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          {t('returns.empty')}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('returns.id')}</TableHead>
              <TableHead>{t('returns.orderRef')}</TableHead>
              <TableHead>{t('returns.customer')}</TableHead>
              <TableHead>{t('returns.status')}</TableHead>
              <TableHead>{t('returns.refundAmount')}</TableHead>
              <TableHead>{t('returns.date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.map((returnRequest) => (
              <TableRow
                key={returnRequest.id}
                className="cursor-pointer"
                onClick={() => navigate(`/returns/${returnRequest.id}`)}
              >
                <TableCell>#{returnRequest.id}</TableCell>
                <TableCell>
                  {returnRequest.shopify_order_name ?? returnRequest.order?.shopify_order_name ?? '-'}
                </TableCell>
                <TableCell>{returnRequest.email}</TableCell>
                <TableCell>
                  <Badge variant={returnStatusVariant(returnRequest.status)}>
                    {t(`returns.statuses.${returnRequest.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>{formatPrice(returnRequest.refund_amount)}</TableCell>
                <TableCell>{new Date(returnRequest.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {meta && (
        <TablePagination
          page={meta.current_page}
          lastPage={meta.last_page}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      )}
    </div>
  )
}
