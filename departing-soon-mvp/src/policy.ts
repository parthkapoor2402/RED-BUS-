/**
 * Pure policy helpers — unit-tested per phase.
 * Shift = fare difference only. Cancel = refund ladder.
 */

export type RefundTier =
  | 'look_in'
  | 'free'
  | 'mid_75'
  | 'mid_50'
  | 'closed'

/** Minutes before departure for cancel/shift cutoffs. */
export const CUTOFF = {
  lookInMinutesAfterBook: 15,
  freeUntilMinutesBeforeDep: 60,
  mid75UntilMinutesBeforeDep: 30,
  mid50UntilMinutesBeforeDep: 15,
  freeShiftsPerPnr: 1,
  maxShiftsPerPnr: 2,
  freeCancelsPer7Days: 3,
} as const

export type FareDelta = {
  label: string
  amount: number
  kind: 'refund' | 'pay' | 'same'
}

export function fareDelta(fromPrice: number, toPrice: number): FareDelta {
  const d = toPrice - fromPrice
  if (d > 0) return { label: `Pay ₹${d} more`, amount: d, kind: 'pay' }
  if (d < 0) return { label: `₹${Math.abs(d)} back to you`, amount: Math.abs(d), kind: 'refund' }
  return { label: 'Same fare', amount: 0, kind: 'same' }
}

/** Free change cutoff clock = departure − 60 minutes (HH:MM). */
export function freeChangeUntil(dep: string, minutesBefore = CUTOFF.freeUntilMinutesBeforeDep): string {
  const [h, m] = dep.split(':').map(Number)
  let mins = h * 60 + m - minutesBefore
  if (mins < 0) mins += 24 * 60
  const hh = String(Math.floor(mins / 60)).padStart(2, '0')
  const mm = String(mins % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

export function minutesUntilDeparture(now: string, dep: string): number {
  const [nh, nm] = now.split(':').map(Number)
  const [dh, dm] = dep.split(':').map(Number)
  return dh * 60 + dm - (nh * 60 + nm)
}

export function cancelRefundPercent(minutesBeforeDep: number): { percent: number; tier: RefundTier } {
  // Free while still at/before the T−60 cutoff (minutes remaining ≥ 60)
  if (minutesBeforeDep >= CUTOFF.freeUntilMinutesBeforeDep) {
    return { percent: 100, tier: 'free' }
  }
  if (minutesBeforeDep >= CUTOFF.mid75UntilMinutesBeforeDep) {
    return { percent: 75, tier: 'mid_75' }
  }
  if (minutesBeforeDep >= CUTOFF.mid50UntilMinutesBeforeDep) {
    return { percent: 50, tier: 'mid_50' }
  }
  return { percent: 0, tier: 'closed' }
}

export function cancelFareRefund(
  fare: number,
  minutesBeforeDep: number,
  opts?: { lookIn?: boolean },
): { refundFare: number; feeKept: boolean; tier: RefundTier } {
  if (opts?.lookIn) {
    return { refundFare: fare, feeKept: false, tier: 'look_in' }
  }
  const { percent, tier } = cancelRefundPercent(minutesBeforeDep)
  return {
    refundFare: Math.round((fare * percent) / 100),
    feeKept: true,
    tier,
  }
}

/** Shift settlement: old fare stays as credit; only delta moves. */
export function shiftSettlement(oldFare: number, newFare: number): {
  bankRefundOfOldFare: number
  userPaysNow: number
  userGetsBack: number
  netTripFare: number
} {
  const d = fareDelta(oldFare, newFare)
  return {
    bankRefundOfOldFare: 0, // never full refund on shift
    userPaysNow: d.kind === 'pay' ? d.amount : 0,
    userGetsBack: d.kind === 'refund' ? d.amount : 0,
    netTripFare: newFare,
  }
}

export function canFreeShift(shiftsUsed: number): boolean {
  return shiftsUsed < CUTOFF.freeShiftsPerPnr
}

export function canShiftAtAll(shiftsUsed: number): boolean {
  return shiftsUsed < CUTOFF.maxShiftsPerPnr
}

export function canFreeCancel(cancelsIn7Days: number): boolean {
  return cancelsIn7Days < CUTOFF.freeCancelsPer7Days
}

export function laterBuses<T extends { id: string; dep: string }>(
  buses: T[],
  currentId: string,
  currentDep: string,
): T[] {
  return buses.filter((b) => b.id !== currentId && b.dep > currentDep)
}
