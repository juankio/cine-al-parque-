import { connectDB } from '@/server/utils/mongoose'
import { readSession } from '@/server/utils/session'
import { Reservation, type IReservation } from '@/server/models/Reservation'
import { Showtime, type IShowtime } from '@/server/models/Showtime'
import { Movie, type IMovie } from '@/server/models/Movie'
import { encodeReservationToken } from '@/server/utils/reservationToken'
import type { Types } from 'mongoose'

type ReservationResponse = {
  id: string
  status: 'pending' | 'paid' | 'canceled' | 'expired'
  total: number
  seats: string[]
  seatsTotal: number
  cartTotal: number
  cart: Array<{
    menuItemId: string
    nombre: string
    unitPrice: number
    qty: number
  }>
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

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const query = getQuery(event)
  const { authSecret } = useRuntimeConfig()
  const qrSecret = authSecret || 'nuxt-secret'
  const limitParam = Number(query.limit || 50)
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50

  const reservations = await Reservation.find({ userId: session.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<IReservation[]>()

  if (!reservations.length) {
    return []
  }

  const showtimeIds = reservations
    .map((res: IReservation) => res.showtimeId?.toString())
    .filter((id: string | undefined): id is string => Boolean(id))

  const showtimes = showtimeIds.length
    ? await Showtime.find({ _id: { $in: showtimeIds } })
        .select('fechaHora sala movieId')
        .lean<IShowtime[]>()
    : []
  const showtimeMap = new Map<string, IShowtime>(showtimes.map((st: IShowtime) => [st._id.toString(), st]))

  const movieIds = showtimes
    .map((st: IShowtime) => st.movieId?.toString())
    .filter((id: string | undefined): id is string => Boolean(id))
  const movies = movieIds.length
    ? await Movie.find({ _id: { $in: movieIds } })
        .select('titulo poster')
        .lean<IMovie[]>()
    : []
  const movieMap = new Map<string, IMovie>(movies.map((mv: IMovie) => [mv._id.toString(), mv]))

  const now = Date.now()

  const response: ReservationResponse[] = reservations.map((res: IReservation) => {
    const cart = (res.cart || []).map((item: any) => ({
      menuItemId: String(item.menuItemId),
      nombre: item.nombre,
      unitPrice: Number(item.unitPrice || 0),
      qty: Number(item.qty || 0)
    }))

    const cartTotal = cart.reduce((sum: number, item: any) => sum + item.unitPrice * item.qty, 0)
    const seats = Array.isArray(res.seats) ? res.seats : []
    const seatsTotal = Math.max(0, Number(res.total || 0) - cartTotal)

    const st = res.showtimeId ? showtimeMap.get(res.showtimeId.toString()) : undefined
    const movie = st?.movieId ? movieMap.get(st.movieId.toString()) : undefined

    const expiresAt = res.expiresAt ? res.expiresAt.toISOString() : null
    const canConfirm =
      res.status === 'pending' && (!res.expiresAt || res.expiresAt.getTime() > now)

    let qrToken: string | null = null
    if (res.status === 'paid') {
      try {
        qrToken = encodeReservationToken(
          {
            rid: res._id.toString(),
            sid: res.showtimeId ? res.showtimeId.toString() : null,
            ts: Date.now()
          },
          qrSecret
        )
      } catch {
        qrToken = null
      }
    }

    return {
      id: res._id.toString(),
      status: res.status,
      total: Number(res.total || 0),
      seats,
      seatsTotal,
      cartTotal,
      cart,
      createdAt: res.createdAt ? res.createdAt.toISOString() : new Date().toISOString(),
      expiresAt,
      canConfirm,
      checkedInAt: res.checkedInAt ? res.checkedInAt.toISOString() : null,
      qrToken,
      showtime: st
        ? {
            id: st._id.toString(),
            fechaHora: st.fechaHora ? st.fechaHora.toISOString() : null,
            sala: st.sala,
            movieTitle: movie?.titulo,
            moviePoster: movie?.poster
          }
        : null
    }
  })

  return response
})
