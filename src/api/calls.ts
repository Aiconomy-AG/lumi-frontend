import type { WorkspaceCall } from '@/types/call'
import { requestData } from './http'

export function startCall(conversationId: number, clientInstanceId: string, type?: 'audio' | 'video', calleeIds?: number[]): Promise<WorkspaceCall> {
  if (calleeIds) {
    return requestData(`/calls`, {
      method: 'POST',
      data: {
        conversation_id: conversationId,
        callee_ids: calleeIds,
        client_instance_id: clientInstanceId,
        type: type,
        media_type: type,
      },
    })
  }
  return requestData(`/workspace/conversations/${conversationId}/calls`, {
    method: 'POST',
    data: { client_instance_id: clientInstanceId, media_type: type, type: type },
  })
}

export function getActiveCall(clientInstanceId: string): Promise<WorkspaceCall | null> {
  return requestData('/workspace/calls/active', {
    params: { client_instance_id: clientInstanceId },
  })
}

export function acceptCall(callId: string, clientInstanceId: string): Promise<WorkspaceCall> {
  return requestData(`/workspace/calls/${callId}/accept`, {
    method: 'POST',
    data: { client_instance_id: clientInstanceId },
  })
}

export function leaveCall(callId: string): Promise<void> {
  return requestData(`/workspace/calls/${callId}/leave`, { method: 'POST' })
}

function updateCall(callId: string, action: 'decline' | 'cancel' | 'end'): Promise<WorkspaceCall> {
  return requestData(`/workspace/calls/${callId}/${action}`, { method: 'POST' })
}

export const declineCall = (callId: string) => updateCall(callId, 'decline')
export const cancelCall = (callId: string) => updateCall(callId, 'cancel')
export const endCall = (callId: string) => updateCall(callId, 'end')
