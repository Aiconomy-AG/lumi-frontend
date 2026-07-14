import { describe, expect, it } from 'vitest'
import { hasValidCallHandle } from './phone'

describe('hasValidCallHandle', () => {
  it('accepts normalized E.164-style Lumi handles', () => {
    expect(hasValidCallHandle('+40722123456')).toBe(true)
  })

  it.each(['+40 722 123 456', '+40 (722) 123-456', '+40.722.123.456'])(
    'accepts a backend-normalizable international handle %s',
    (value) => expect(hasValidCallHandle(value)).toBe(true),
  )

  it.each([undefined, '', '0722123456', '+1234567', '+1234567890123456'])(
    'rejects missing or non-normalized handle %s',
    (value) => expect(hasValidCallHandle(value)).toBe(false),
  )
})
