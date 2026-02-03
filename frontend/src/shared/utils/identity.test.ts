import { describe, expect, it } from 'vitest'

import { identity } from './identity'

describe('identity', () => {
  it('returns the same value', () => {
    expect(identity('fbisdevoptics')).toBe('fbisdevoptics')
  })
})
