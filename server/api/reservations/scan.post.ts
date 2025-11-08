import { connectDB } from '@/server/utils/mongoose'
import { readSession } from '@/server/utils/session'
import { decodeReservationToken } from '@/server/utils/reservationToken'
import { Reservation } from '@/server/models/Reservation'
import { Showtime } from '@/server/models/Showtime'
import { Movie } from '@/server/models/Movie'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Solo administradores' })
  }

  const body = await readBody<{ token: string }>(event)
  if (!body?.token) {
    throw createError({ statusCode: 400, statusMessage: 'token requerido' })
  }

  const { authSecret } = useRuntimeConfig()
  const qrSecret = authSecret || 'nuxt-secret'

  let payload
  try {
    payload = decodeReservationToken(body.token, qrSecret)
  } catch (err: any) {
    throw createError({ statusCode: 400, statusMessage: err?.message || 'Token inv��lido' })
  }

  const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30 // 30 d��as
  if (Date.now() - payload.ts > TOKEN_TTL_MS) {
    throw createError({ statusCode: 410, statusMessage: 'Token expirado' })
  }

  const reservation = await Reservation.findById(payload.rid)
  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Reserva no encontrada' })
  }

  const showtime = reservation.showtimeId
    ? await Showtime.findById(reservation.showtimeId).select('fechaHora sala movieId').lean()
    : null
  const movie =
    showtime?.movieId ?
      await Movie.findById(showtime.movieId).select('titulo poster').lean()
    : null

  const alreadyChecked = Boolean(reservation.checkedInAt)
  const now = new Date()
  const isPaid = reservation.status === 'paid'

  if (isPaid && !alreadyChecked) {
    reservation.checkedInAt = now
    reservation.checkedInBy = session.id as any
    await reservation.save()
  }

  const response = {
    id: reservation._id.toString(),
    status: reservation.status,
    total: reservation.total,
    seats: reservation.seats,
    checkedInAt: (reservation.checkedInAt || now).toISOString(),
    showtime: showtime
      ? {
          fechaHora: showtime.fechaHora ? showtime.fechaHora.toISOString() : null,
          sala: showtime.sala || '',
          movieTitle: movie?.titulo
        }
      : null,
    alreadyChecked,
    canAdmit: isPaid
  }

  if (!isPaid) {
    throw createError({
      statusCode: 409,
      statusMessage: 'La reserva no est�� pagada',
      data: response
    })
  }

  return {
    ok: true,
    reservation: response
  }
})
