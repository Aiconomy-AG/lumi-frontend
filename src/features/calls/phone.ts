export const CALL_HANDLE_PATTERN = /^\+[1-9]\d{7,14}$/

export function hasValidCallHandle(phoneNumber?: string | null): boolean {
  return !!phoneNumber && CALL_HANDLE_PATTERN.test(phoneNumber)
}

