import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrderQuery } from '@/features/orders'
import { formatPrice } from '@/lib/currency'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TablePagination } from '@/components/ui/table-pagination'
import type { OrderStatus } from '@/types/order'

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

export default function OrderDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const orderId = Number(id)

  const { data: order, isLoading } = useOrderQuery(orderId)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  if (isLoading) {
    return <div className="p-6 text-sm text-zinc-500">{t('admin.loading')}</div>
  }

  if (!order) {
    return <div className="p-6 text-sm text-zinc-500">{t('orders.notFound')}</div>
  }

  return (
    <div className="p-6">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate('/orders')}>
        ← {t('orders.title')}
      </Button>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {order.shopify_order_name ?? t('orders.orderNumber', { id: order.id })}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <Badge variant={orderStatusVariant(order.status)} className="text-sm">
          {t(`orders.statuses.${order.status}`)}
        </Badge>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">{t('orders.customerDetails')}</h3>
          <p className="text-sm text-white">{order.customer?.email ?? '-'}</p>
          <p className="text-sm text-zinc-500">{order.customer?.username}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">{t('orders.paymentDetails')}</h3>
          <p className="text-sm text-white">{order.payment_method}</p>
          <p className="text-sm text-zinc-500">
            {t(`orders.paymentStatuses.${order.payment_status}`)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 md:col-span-2">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">{t('orders.shippingAddress')}</h3>
          <p className="text-sm text-white whitespace-pre-wrap">{order.shipping_address || '-'}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">{t('orders.lineItems')}</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('orders.product')}</TableHead>
              <TableHead>{t('orders.sku')}</TableHead>
              <TableHead>{t('orders.quantity')}</TableHead>
              <TableHead className="text-right">{t('orders.unitPrice')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.slice((page - 1) * perPage, page * perPage).map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.variant?.name ?? t('orders.unknownProduct')}</TableCell>
                <TableCell>{item.variant?.sku ?? '-'}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-right">{formatPrice(item.unit_price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          page={page}
          lastPage={Math.max(1, Math.ceil(order.items.length / perPage))}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={setPerPage}
        />
      </div>

      <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">{t('orders.subtotal')}</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-zinc-500">{t('orders.shipping')}</span>
          <span>{formatPrice(order.shipping_cost)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-zinc-800 pt-3 text-sm font-medium">
          <span>{t('orders.total')}</span>
          <span>{formatPrice(order.total_amount)}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-zinc-400">{t('orders.relatedReturns')}</h3>
        {(order.return_requests?.length ?? 0) === 0 ? (
          <p className="text-sm text-zinc-500">{t('orders.noReturns')}</p>
        ) : (
          <div className="space-y-2">
            {order.return_requests?.map((returnRequest) => (
              <button
                key={returnRequest.id}
                type="button"
                onClick={() => navigate(`/returns/${returnRequest.id}`)}
                className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left transition-colors hover:bg-zinc-900"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {t('returns.returnNumber', { id: returnRequest.id })}
                  </p>
                  <p className="text-xs text-zinc-500">{returnRequest.reason}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{t(`returns.statuses.${returnRequest.status}`)}</Badge>
                  <p className="mt-1 text-xs text-zinc-500">{formatPrice(returnRequest.refund_amount)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
