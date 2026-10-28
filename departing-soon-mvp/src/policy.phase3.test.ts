/**
 * Phase 3 — Shift / Cancel money logic
 * Run: npm run test:phase3
 */
import { describe, expect, it } from 'vitest'
import {
  canFreeCancel,
  canFreeShift,
  canShiftAtAll,
  cancelFareRefund,
  fareDelta,
  laterBuses,
  shiftSettlement,
} from './policy'
import { BUSES } from './data'

describe('Phase 3 · fare delta (₹250 → scenarios)', () => {
  it('A · next bus ₹300 → pay ₹50 more; no full bank refund of 250', () => {
    const d = fareDelta(250, 300)
    expect(d).toEqual({ label: 'Pay ₹50 more', amount: 50, kind: 'pay' })
    const s = shiftSettlement(250, 300)
    expect(s.bankRefundOfOldFare).toBe(0)
    expect(s.userPaysNow).toBe(50)
    expect(s.userGetsBack).toBe(0)
    expect(s.netTripFare).toBe(300)
  })

  it('B · next bus ₹200 → ₹50 back; not full 250', () => {
    const d = fareDelta(250, 200)
    expect(d.kind).toBe('refund')
    expect(d.amount).toBe(50)
    const s = shiftSettlement(250, 200)
    expect(s.bankRefundOfOldFare).toBe(0)
    expect(s.userGetsBack).toBe(50)
    expect(s.userPaysNow).toBe(0)
  })

  it('C · next bus ₹250 → same fare, zero cash movement', () => {
    expect(fareDelta(250, 250)).toEqual({ label: 'Same fare', amount: 0, kind: 'same' })
    const s = shiftSettlement(250, 250)
    expect(s.userPaysNow + s.userGetsBack).toBe(0)
  })

  it('D · cancel inside free window refunds full fare; fee kept', () => {
    // 72 min before dep → still in free tier (>60? wait 72 > 60 means free)
    const r = cancelFareRefund(250, 72)
    expect(r.refundFare).toBe(250)
    expect(r.feeKept).toBe(true)
    expect(r.tier).toBe('free')
  })

  it('E · cancel after T−15 → 0% refund', () => {
    const r = cancelFareRefund(250, 10)
    expect(r.refundFare).toBe(0)
    expect(r.tier).toBe('closed')
  })

  it('cancel ladder mid slabs 75% and 50%', () => {
    expect(cancelFareRefund(200, 45).refundFare).toBe(150) // 75%
    expect(cancelFareRefund(200, 20).refundFare).toBe(100) // 50%
  })
})

describe('Phase 3 · caps & later buses', () => {
  it('allows 1 free shift then blocks free; max 2 shifts', () => {
    expect(canFreeShift(0)).toBe(true)
    expect(canFreeShift(1)).toBe(false)
    expect(canShiftAtAll(1)).toBe(true)
    expect(canShiftAtAll(2)).toBe(false)
  })

  it('caps free cancels at 3 per rolling 7 days', () => {
    expect(canFreeCancel(2)).toBe(true)
    expect(canFreeCancel(3)).toBe(false)
  })

  it('laterBuses only returns later departures excluding current', () => {
    const later = laterBuses(BUSES, 'srs-1020', '10:20')
    expect(later.every((b) => b.dep > '10:20')).toBe(true)
    expect(later.find((b) => b.id === 'srs-1020')).toBeUndefined()
  })
})
