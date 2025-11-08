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
  showtime: {
    id: string
    fechaHora: string | null
    sala?: string
    movieTitle?: string
    moviePoster?: string
  } | null
}
