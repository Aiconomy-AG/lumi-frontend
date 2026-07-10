import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveReturn,
  getReturn,
  getReturns,
  markReturnReceived,
  markReturnRefunded,
  rejectReturn,
  updateReturnNotes,
} from '@/api/client'
import type { ReturnFilters } from '@/types/return'
import { orderKeys } from '@/features/orders/queryKeys'
import { returnKeys } from './queryKeys'

export function useReturnsQuery(filters: ReturnFilters) {
  return useQuery({
    queryKey: returnKeys.list(filters),
    queryFn: () => getReturns(filters),
    placeholderData: (previous) => previous,
  })
}

export function useReturnQuery(returnId: number) {
  return useQuery({
    queryKey: returnKeys.detail(returnId),
    queryFn: () => getReturn(returnId),
    enabled: Number.isFinite(returnId) && returnId > 0,
  })
}

function useInvalidateReturn(returnId: number) {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: returnKeys.detail(returnId) })
    void queryClient.invalidateQueries({ queryKey: returnKeys.lists() })
    void queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
  }
}

export function useApproveReturnMutation(returnId: number) {
  const invalidate = useInvalidateReturn(returnId)

  return useMutation({
    mutationFn: () => approveReturn(returnId),
    onSuccess: invalidate,
  })
}

export function useRejectReturnMutation(returnId: number) {
  const invalidate = useInvalidateReturn(returnId)

  return useMutation({
    mutationFn: (notes?: string) => rejectReturn(returnId, notes),
    onSuccess: invalidate,
  })
}

export function useMarkReturnReceivedMutation(returnId: number) {
  const invalidate = useInvalidateReturn(returnId)

  return useMutation({
    mutationFn: () => markReturnReceived(returnId),
    onSuccess: invalidate,
  })
}

export function useMarkReturnRefundedMutation(returnId: number) {
  const invalidate = useInvalidateReturn(returnId)

  return useMutation({
    mutationFn: () => markReturnRefunded(returnId),
    onSuccess: invalidate,
  })
}

export function useUpdateReturnNotesMutation(returnId: number) {
  const invalidate = useInvalidateReturn(returnId)

  return useMutation({
    mutationFn: (notes: string | null) => updateReturnNotes(returnId, notes),
    onSuccess: invalidate,
  })
}
