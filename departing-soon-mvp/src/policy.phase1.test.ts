/**
 * Phase 1 — Scaffold / policy foundation
 * Run: npm run test:phase1
 */
import { describe, expect, it } from 'vitest'
import { CUTOFF, freeChangeUntil, minutesUntilDeparture } from './policy'
import { BUSES, ROUTE } from './data'

describe('Phase 1 · scaffold & domain constants', () => {
  it('locks beachhead route Bengaluru → Mysuru under 250 km', () => {
    expect(ROUTE.from).toBe('Bengaluru')
    expect(ROUTE.to).toBe('Mysuru')
    expect(ROUTE.km).toBeLessThanOrEqual(250)
  })

  it('ships at least 3 Departing Soon inventory options', () => {
    expect(BUSES.length).toBeGreaterThanOrEqual(3)
  })

  it('defines T−60 free-change cutoff', () => {
    expect(CUTOFF.freeUntilMinutesBeforeDep).toBe(60)
  })

  it('computes free-change clock for 10:20 as 09:20', () => {
    expect(freeChangeUntil('10:20')).toBe('09:20')
  })

  it('measures minutes until departure from demo clock', () => {
    expect(minutesUntilDeparture('09:08', '10:20')).toBe(72)
  })
})
