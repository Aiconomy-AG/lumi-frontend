export const CALL_HANDLE_PATTERN = /^\+[1-9]\d{7,14}$/

export function hasValidCallHandle(phoneNumber?: string | null): boolean {
  if (!phoneNumber) return false

  const normalized = phoneNumber.trim().replace(/[\s().-]+/g, '')
  return CALL_HANDLE_PATTERN.test(normalized)
}
