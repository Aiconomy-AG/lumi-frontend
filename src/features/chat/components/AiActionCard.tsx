import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import type { AiActionMeta } from '@/types/chat'
import { useApproveAiActionMutation, useRejectAiActionMutation } from '../hooks'

interface AiActionCardProps {
  conversationId: number
  meta: AiActionMeta
  currentUserId?: number
}

function formatArgumentLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatArgumentValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (value === null || value === undefined) {
    return '—'
  }

  return String(value)
}

function statusBadgeClass(status: AiActionMeta['status']): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/15 text-amber-300'
    case 'approved':
      return 'bg-blue-500/15 text-blue-300'
    case 'executed':
      return 'bg-emerald-500/15 text-emerald-300'
    case 'failed':
      return 'bg-red-500/15 text-red-300'
    case 'rejected':
      return 'bg-zinc-500/15 text-zinc-400'
    case 'expired':
      return 'bg-zinc-500/15 text-zinc-500'
    default:
      return 'bg-zinc-500/15 text-zinc-400'
  }
}

export function AiActionCard({ conversationId, meta, currentUserId }: AiActionCardProps) {
  const { t } = useTranslation()
  const approveMutation = useApproveAiActionMutation(conversationId)
  const rejectMutation = useRejectAiActionMutation(conversationId)

  const isExpired =
    meta.status === 'expired' ||
    (meta.status === 'pending' && new Date(meta.expires_at).getTime() < Date.now())

  const effectiveStatus = isExpired && meta.status === 'pending' ? 'expired' : meta.status
  const isRequester = currentUserId === meta.requested_by_user_id
  const canRespond =
    isRequester && effectiveStatus === 'pending' && !isExpired && !approveMutation.isPending && !rejectMutation.isPending

  const argumentEntries = Object.entries(meta.arguments ?? {}).filter(([key]) => {
    if (meta.tool_name === 'update_conversation_participants' && key === 'conversation_id') {
      return false
    }

    return true
  })

  const stockResult =
    meta.tool_name === 'update_stock' && meta.result
      ? {
          sku: meta.result.sku as string | undefined,
          oldQty: meta.result.old_stock_quantity as number | undefined,
          newQty: meta.result.new_stock_quantity as number | undefined,
        }
      : null

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-zinc-100">{meta.summary}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusBadgeClass(effectiveStatus)}`}
        >
          {t(`chat.aiAction.status.${effectiveStatus}`)}
        </span>
      </div>

      {argumentEntries.length > 0 && (
        <dl className="space-y-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/50 px-3 py-2 text-xs">
          {argumentEntries.map(([key, value]) => (
            <div key={key} className="flex justify-between gap-3">
              <dt className="text-zinc-500">
                {meta.tool_name === 'update_conversation_participants' && key === 'add_participants_employee_ids'
                  ? t('chat.aiAction.addMembers')
                  : meta.tool_name === 'update_conversation_participants' && key === 'remove_participants_employee_ids'
                    ? t('chat.aiAction.removeMembers')
                    : formatArgumentLabel(key)}
              </dt>
              <dd className="text-right text-zinc-200">{formatArgumentValue(value)}</dd>
            </div>
          ))}
          {meta.tool_name === 'update_stock' && meta.arguments.sku != null && (
            <div className="flex justify-between gap-3 border-t border-zinc-700/60 pt-1.5">
              <dt className="text-zinc-500">{t('chat.aiAction.stockChange')}</dt>
              <dd className="text-right text-zinc-200">
                {stockResult?.oldQty != null
                  ? `${stockResult.oldQty} → ${stockResult.newQty ?? meta.arguments.stock_quantity}`
                  : `→ ${formatArgumentValue(meta.arguments.stock_quantity)}`}
              </dd>
            </div>
          )}
        </dl>
      )}

      {meta.error && (
        <p className="text-xs text-red-400">{meta.error}</p>
      )}

      {canRespond ? (
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500"
            disabled={approveMutation.isPending || rejectMutation.isPending}
            onClick={() => approveMutation.mutate(meta.action_id)}
          >
            {t('chat.aiAction.approve')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={approveMutation.isPending || rejectMutation.isPending}
            onClick={() => rejectMutation.mutate(meta.action_id)}
          >
            {t('chat.aiAction.reject')}
          </Button>
        </div>
      ) : effectiveStatus === 'pending' && !isRequester ? (
        <p className="text-xs text-zinc-500">
          {t('chat.aiAction.waitingForConfirmation', {
            name: meta.requested_by_name ?? t('chat.aiAction.someone'),
          })}
        </p>
      ) : null}
    </div>
  )
}
