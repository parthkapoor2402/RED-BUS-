import { fareDelta, freeChangeUntil } from './policy'

export type Bus = {
  id: string
  operator: string
  dep: string
  arr: string
  duration: string
  price: number
  seats: number
  rating: number
  type: string
  leavesIn: string
  /** Departing Soon inventory: next ~4h, free-change eligible */
  departingSoon: boolean
}

export const DEMO_NOW = '09:08'
export const DEMO_DATE = 'Today, 27 Oct'
export const ROUTE = { from: 'Bengaluru', to: 'Mysuru', km: 145 }

/** Near departures — default Departing Soon board (time pressure + free change). */
export const DEPARTING_SOON_BUSES: Bus[] = [
  {
    id: 'srs-1020',
    operator: 'SRS Travels',
    dep: '10:20',
    arr: '13:30',
    duration: '3h 10m',
    price: 210,
    seats: 12,
    rating: 4.4,
    type: 'Bharat Benz A/C Seater',
    leavesIn: '1h 15m',
    departingSoon: true,
  },
  {
    id: 'vrl-1047',
    operator: 'VRL Travels',
    dep: '10:47',
    arr: '14:12',
    duration: '3h 25m',
    price: 180,
    seats: 23,
    rating: 4.1,
    type: 'Non-AC Seater',
    leavesIn: '1h 42m',
    departingSoon: true,
  },
  {
    id: 'ksrtc-1122',
    operator: 'KSRTC Airavat',
    dep: '11:22',
    arr: '14:27',
    duration: '3h 05m',
    price: 249,
    seats: 7,
    rating: 4.6,
    type: 'A/C Seater',
    leavesIn: '2h 17m',
    departingSoon: true,
  },
  {
    id: 'srs-1155',
    operator: 'SRS Travels',
    dep: '11:55',
    arr: '15:10',
    duration: '3h 15m',
    price: 210,
    seats: 18,
    rating: 4.4,
    type: 'A/C Seater',
    leavesIn: '2h 47m',
    departingSoon: true,
  },
]

/**
 * Later same-day inventory — only in All buses.
 * Spaced farther apart so the board feels like classic shopping (ratings/amenities),
 * nudging same-day urgent users back to Departing Soon.
 */
export const LATER_BUSES: Bus[] = [
  {
    id: 'orange-1400',
    operator: 'Orange Travels',
    dep: '14:00',
    arr: '17:20',
    duration: '3h 20m',
    price: 199,
    seats: 28,
    rating: 3.9,
    type: 'Non-AC Seater',
    leavesIn: '4h 52m',
    departingSoon: false,
  },
  {
    id: 'vrl-1630',
    operator: 'VRL Travels',
    dep: '16:30',
    arr: '19:45',
    duration: '3h 15m',
    price: 320,
    seats: 9,
    rating: 4.5,
    type: 'A/C Sleeper',
    leavesIn: '7h 22m',
    departingSoon: false,
  },
  {
    id: 'ksrtc-1830',
    operator: 'KSRTC Rajahamsa',
    dep: '18:30',
    arr: '21:40',
    duration: '3h 10m',
    price: 275,
    seats: 14,
    rating: 4.3,
    type: 'A/C Seater',
    leavesIn: '9h 22m',
    departingSoon: false,
  },
  {
    id: 'srs-2100',
    operator: 'SRS Travels',
    dep: '21:00',
    arr: '00:15',
    duration: '3h 15m',
    price: 399,
    seats: 6,
    rating: 4.7,
    type: 'A/C Sleeper',
    leavesIn: '11h 52m',
    departingSoon: false,
  },
]

/** Full same-day catalog for All buses + shift targets. */
export const ALL_BUSES: Bus[] = [...DEPARTING_SOON_BUSES, ...LATER_BUSES]

/** @deprecated use DEPARTING_SOON_BUSES — kept for older imports */
export const BUSES = DEPARTING_SOON_BUSES

export function busesForMode(mode: 'soon' | 'all'): Bus[] {
  return mode === 'soon' ? DEPARTING_SOON_BUSES : ALL_BUSES
}

export function srpBanner(mode: 'soon' | 'all'): string {
  if (mode === 'soon') {
    return `${DEPARTING_SOON_BUSES.length} buses in next 4 hours · from ₹180`
  }
  return `${ALL_BUSES.length} buses today · from ₹180`
}

export { fareDelta, freeChangeUntil }

export type Ticket = {
  pnr: string
  bus: Bus
  seat: number
  paid: number
  boarding: string
  freeUntil: string
}
