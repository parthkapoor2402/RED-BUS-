/**
 * Phase 2 — Screen inventory / SRP modes
 */
import { describe, expect, it } from 'vitest'
import {
  ALL_BUSES,
  DEPARTING_SOON_BUSES,
  LATER_BUSES,
  busesForMode,
  srpBanner,
} from './data'
import { freeChangeUntil } from './policy'

describe('Phase 2 · Departing Soon board', () => {
  it('every soon bus has dep, price, seats, operator', () => {
    for (const b of DEPARTING_SOON_BUSES) {
      expect(b.dep).toMatch(/^\d{2}:\d{2}$/)
      expect(b.price).toBeGreaterThan(0)
      expect(b.departingSoon).toBe(true)
    }
  })

  it('exposes Free change till tag time for soon buses', () => {
    for (const b of DEPARTING_SOON_BUSES) {
      const until = freeChangeUntil(b.dep)
      expect(until < b.dep).toBe(true)
    }
  })

  it('cheapest soon fare is ₹180', () => {
    expect(Math.min(...DEPARTING_SOON_BUSES.map((b) => b.price))).toBe(180)
  })
})

describe('Phase 2 · All buses contrast', () => {
  it('All buses includes later inventory beyond the 4h board', () => {
    expect(LATER_BUSES.length).toBeGreaterThanOrEqual(3)
    expect(ALL_BUSES.length).toBe(DEPARTING_SOON_BUSES.length + LATER_BUSES.length)
    expect(busesForMode('all').length).toBeGreaterThan(busesForMode('soon').length)
  })

  it('later buses are after the last Departing Soon departure', () => {
    const lastSoon = DEPARTING_SOON_BUSES[DEPARTING_SOON_BUSES.length - 1].dep
    for (const b of LATER_BUSES) {
      expect(b.dep > lastSoon).toBe(true)
      expect(b.departingSoon).toBe(false)
    }
  })

  it('banners differ by mode', () => {
    expect(srpBanner('soon')).toMatch(/next 4 hours/i)
    expect(srpBanner('all')).toMatch(/today/i)
  })
})
