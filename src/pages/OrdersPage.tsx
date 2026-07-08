import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getOrders } from '@/api/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export default function OrdersPage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => getOrders(page),
  })

  if (isLoading) {
    return <div className="p-6 text-sm text-zinc-500">{t('admin.loading')}</div>
  }

  const orders = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>{t('orders.customer')}</TableHead>
            <TableHead>{t('orders.status')}</TableHead>
            <TableHead>{t('orders.items')}</TableHead>
            <TableHead>{t('orders.total')}</TableHead>
            <TableHead>{t('orders.date')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customer?.email ?? '-'}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.items.length}</TableCell>
              <TableCell>{order.total_amount}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 flex gap-2">
        <Button disabled={!meta || meta.current_page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          {t('orders.prev')}
        </Button>
        <Button
          disabled={!meta || meta.current_page >= meta.last_page}
          onClick={() => setPage((p) => p + 1)}
        >
          {t('orders.next')}
        </Button>
      </div>
    </div>
  )
}
