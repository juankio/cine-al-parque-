import type { CartLine } from './showtime'

export type ReservationSummary = {
  id: string
  status: 'pending' | 'paid' | 'canceled' | 'expired'
  total: number
  seats: string[]
  seatsTotal: number
  cartTotal: number
  cart: CartLine[]
  createdAt: string
  expiresAt: string | null
  canConfirm: boolean
  checkedInAt: string | null
  qrToken: string | null
  showtime: {
    id: string
    fechaHora: string | null
    sala?: string
    movieTitle?: string
    moviePoster?: string
  } | null
}

export type ReservationScanResult = {
  id: string
  status: 'pending' | 'paid' | 'canceled' | 'expired'
  total: number
  seats: string[]
  checkedInAt: string
  alreadyChecked: boolean
  canAdmit: boolean
  showtime: {
    fechaHora: string | null
    sala?: string
    movieTitle?: string
  } | null
}
