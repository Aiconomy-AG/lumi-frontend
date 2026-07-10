import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  useApproveReturnMutation,
  useMarkReturnReceivedMutation,
  useMarkReturnRefundedMutation,
  useRejectReturnMutation,
  useReturnQuery,
} from '@/features/returns'
import type { ReturnStatus } from '@/types/return'
import { formatPrice } from '@/lib/currency'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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

function getErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null
  const response = (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }).response
  if (response?.data?.message) return response.data.message
  const firstError = response?.data?.errors && Object.values(response.data.errors)[0]?.[0]
  return firstError ?? null
}

export default function ReturnDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const returnId = Number(id)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')

  const { data: returnRequest, isLoading } = useReturnQuery(returnId)
  const approveMutation = useApproveReturnMutation(returnId)
  const rejectMutation = useRejectReturnMutation(returnId)
  const receivedMutation = useMarkReturnReceivedMutation(returnId)
  const refundedMutation = useMarkReturnRefundedMutation(returnId)

  const activeMutation = [approveMutation, rejectMutation, receivedMutation, refundedMutation].find(
    (mutation) => mutation.isPending,
  )
  const errorMessage = getErrorMessage(
    approveMutation.error ?? rejectMutation.error ?? receivedMutation.error ?? refundedMutation.error,
  )

  if (isLoading) {
    return <div className="p-6 text-sm text-zinc-500">{t('admin.loading')}</div>
  }

  if (!returnRequest) {
    return <div className="p-6 text-sm text-zinc-500">{t('returns.notFound')}</div>
  }

  const items =
    returnRequest.return_items && returnRequest.return_items.length > 0
      ? returnRequest.return_items.map((item) => ({
          key: String(item.id),
          title: item.order_item?.variant?.name ?? t('returns.unknownProduct'),
          sku: item.order_item?.variant?.sku ?? '-',
          quantity: item.quantity,
          unitPrice: item.order_item?.unit_price ?? 0,
        }))
      : returnRequest.items.map((item, index) => ({
          key: String(index),
          title: item.title ?? t('returns.unknownProduct'),
          sku: item.sku ?? '-',
          quantity: item.quantity,
          unitPrice: item.unit_price ?? 0,
        }))

  async function handleReject() {
    await rejectMutation.mutateAsync(rejectNotes || undefined)
    setRejectOpen(false)
    setRejectNotes('')
  }

  return (
    <div className="p-6">
      <Button variant="ghost" size="sm" className="mb-6" onClick={() => navigate('/returns')}>
        ← {t('returns.title')}
      </Button>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            {t('returns.returnNumber', { id: returnRequest.id })}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {new Date(returnRequest.created_at).toLocaleString()}
          </p>
        </div>
        <Badge variant={returnStatusVariant(returnRequest.status)} className="text-sm">
          {t(`returns.statuses.${returnRequest.status}`)}
        </Badge>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">{t('returns.customer')}</h3>
          <p className="text-sm text-white">{returnRequest.email}</p>
          {returnRequest.customer?.username && (
            <p className="text-sm text-zinc-500">{returnRequest.customer.username}</p>
          )}
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">{t('returns.orderRef')}</h3>
          <p className="text-sm text-white">
            {returnRequest.shopify_order_name ?? returnRequest.order?.shopify_order_name ?? '-'}
          </p>
          {returnRequest.order_id && (
            <Button
              variant="link"
              className="mt-2 h-auto p-0 text-purple-400"
              onClick={() => navigate(`/orders/${returnRequest.order_id}`)}
            >
              {t('returns.viewOrder')}
            </Button>
          )}
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 md:col-span-2">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">{t('returns.reason')}</h3>
          <p className="text-sm text-white">{returnRequest.reason}</p>
          {returnRequest.notes && (
            <p className="mt-2 text-sm text-zinc-500">{returnRequest.notes}</p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-zinc-400">{t('returns.items')}</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('returns.product')}</TableHead>
              <TableHead>{t('returns.sku')}</TableHead>
              <TableHead>{t('returns.quantity')}</TableHead>
              <TableHead className="text-right">{t('returns.unitPrice')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.key}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex justify-between text-sm font-medium">
          <span>{t('returns.refundAmount')}</span>
          <span>{formatPrice(returnRequest.refund_amount)}</span>
        </div>
        {returnRequest.received_at && (
          <p className="mt-2 text-xs text-zinc-500">
            {t('returns.receivedAt')}: {new Date(returnRequest.received_at).toLocaleString()}
          </p>
        )}
        {returnRequest.refunded_at && (
          <p className="mt-1 text-xs text-zinc-500">
            {t('returns.refundedAt')}: {new Date(returnRequest.refunded_at).toLocaleString()}
          </p>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-rose-900/50 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {returnRequest.status === 'requested' && (
          <>
            <Button onClick={() => approveMutation.mutate()} disabled={!!activeMutation}>
              {t('returns.actions.approve')}
            </Button>
            <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={!!activeMutation}>
              {t('returns.actions.reject')}
            </Button>
          </>
        )}
        {returnRequest.status === 'approved' && (
          <Button onClick={() => receivedMutation.mutate()} disabled={!!activeMutation}>
            {t('returns.actions.markReceived')}
          </Button>
        )}
        {returnRequest.status === 'received' && (
          <Button onClick={() => refundedMutation.mutate()} disabled={!!activeMutation}>
            {t('returns.actions.markRefunded')}
          </Button>
        )}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('returns.rejectTitle')}</DialogTitle>
          </DialogHeader>
          <textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder={t('returns.rejectNotesPlaceholder')}
            className="min-h-24 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              {t('returns.cancel')}
            </Button>
            <Button variant="destructive" onClick={() => void handleReject()} disabled={rejectMutation.isPending}>
              {t('returns.actions.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
