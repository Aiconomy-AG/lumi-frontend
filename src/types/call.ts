export type CallStatus =
  | 'ringing'
  | 'active'
  | 'declined'
  | 'cancelled'
  | 'missed'
  | 'ended'
  | 'failed'

export interface CallIdentity {
  id: number
  name: string
  phone_number: string
}

export interface CallParticipant {
  user_id: number
  name: string
  role: 'caller' | 'callee' | string
  status: string
}

export interface CallConnection {
  url: string
  token: string
}

export interface WorkspaceCall {
  id: string
  conversation_id: number
  initiated_by_user_id: number
  caller: CallIdentity
  participants: CallParticipant[]
  media_type: 'audio'
  status: CallStatus
  answered_client_instance_id?: string | null
  end_reason?: string | null
  answered_at?: string | null
  ended_at?: string | null
  created_at: string
  updated_at: string
  connection?: CallConnection
}

