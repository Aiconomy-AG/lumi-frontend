import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrdersQuery } from '@/features/orders'
import type { OrderStatus } from '@/types/order'
import { formatPrice } from '@/lib/currency'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { PaginationFooter } from '@/components/ui/pagination-footer'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ORDER_STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

function orderStatusVariant(status: OrderStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'delivered':
      return 'default'
    case 'shipped':
    case 'processing':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

export default function OrdersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [page, perPage])

  const filters = {
    page,
    per_page: perPage,
    status: status || undefined,
    search: search || undefined,
    from: from || undefined,
    to: to || undefined,
  }

  const { data, isLoading } = useOrdersQuery(filters)

  const orders = data?.data ?? []
  const meta = data?.meta

  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setPage(1)
    }
  }

  return (
    <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">{t('orders.title')}</h2>
        <p className="text-sm text-zinc-500">{t('orders.subtitle')}</p>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => resetPage(setSearch)(e.target.value)}
          placeholder={t('orders.searchPlaceholder')}
          className="w-56"
        />
        <Select
          value={status || 'all'}
          onValueChange={(value) => resetPage(setStatus)(value === 'all' ? '' : (value as OrderStatus))}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t('orders.filterStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('orders.allStatuses')}</SelectItem>
            {ORDER_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`orders.statuses.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={from}
          onChange={(e) => resetPage(setFrom)(e.target.value)}
          aria-label={t('orders.from')}
          className="w-40"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => resetPage(setTo)(e.target.value)}
          aria-label={t('orders.to')}
          className="w-40"
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-zinc-500">{t('admin.loading')}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-500">
          {t('orders.empty')}
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0 pr-2 border rounded-md">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('orders.orderRef')}</TableHead>
              <TableHead>{t('orders.customer')}</TableHead>
              <TableHead>{t('orders.status')}</TableHead>
              <TableHead>{t('orders.items')}</TableHead>
              <TableHead>{t('orders.total')}</TableHead>
              <TableHead>{t('orders.date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <TableCell className="font-medium">
                  {order.shopify_order_name ?? `#${order.id}`}
                </TableCell>
                <TableCell>{order.customer?.email ?? '-'}</TableCell>
                <TableCell>
                  <Badge variant={orderStatusVariant(order.status)}>
                    {t(`orders.statuses.${order.status}`)}
                  </Badge>
                </TableCell>
                <TableCell>{order.items.length}</TableCell>
                <TableCell>{formatPrice(order.total_amount)}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}

      {meta && (
        <PaginationFooter 
            page={page} 
            setPage={setPage} 
            perPage={perPage} 
            setPerPage={setPerPage} 
            lastPage={meta.last_page} 
            total={meta.total ?? 0} 
        />
      )}
    </div>
  )
}
