import { connectDB } from '@/server/utils/mongoose'
import { readSession } from '@/server/utils/session'
import { Reservation } from '@/server/models/Reservation'
import { Showtime } from '@/server/models/Showtime'
import { Movie } from '@/server/models/Movie'

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
  const limitParam = Number(query.limit || 50)
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50

  const reservations = await Reservation.find({ userId: session.id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  if (!reservations.length) {
    return []
  }

  const showtimeIds = reservations
    .map((res) => res.showtimeId?.toString())
    .filter((id): id is string => Boolean(id))

  const showtimes = showtimeIds.length
    ? await Showtime.find({ _id: { $in: showtimeIds } })
        .select('fechaHora sala movieId')
        .lean()
    : []
  const showtimeMap = new Map(showtimes.map((st) => [st._id.toString(), st]))

  const movieIds = showtimes
    .map((st) => st.movieId?.toString())
    .filter((id): id is string => Boolean(id))
  const movies = movieIds.length
    ? await Movie.find({ _id: { $in: movieIds } })
        .select('titulo poster')
        .lean()
    : []
  const movieMap = new Map(movies.map((mv) => [mv._id.toString(), mv]))

  const now = Date.now()

  const response: ReservationResponse[] = reservations.map((res) => {
    const cart = (res.cart || []).map((item: any) => ({
      menuItemId: String(item.menuItemId),
      nombre: item.nombre,
      unitPrice: Number(item.unitPrice || 0),
      qty: Number(item.qty || 0)
    }))

    const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
    const seats = Array.isArray(res.seats) ? res.seats : []
    const seatsTotal = Math.max(0, Number(res.total || 0) - cartTotal)

    const st = res.showtimeId ? showtimeMap.get(res.showtimeId.toString()) : undefined
    const movie = st?.movieId ? movieMap.get(st.movieId.toString()) : undefined

    const expiresAt = res.expiresAt ? res.expiresAt.toISOString() : null
    const canConfirm =
      res.status === 'pending' && (!res.expiresAt || res.expiresAt.getTime() > now)

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
