import { connectDB } from '@/server/utils/mongoose'
import { readSession } from '@/server/utils/session'
import { Showtime } from '@/server/models/Showtime'
import { Table } from '@/server/models/Table'
import { Seat } from '@/server/models/Seat'
import { Reservation } from '@/server/models/Reservation'
import { ReservationSeat } from '@/server/models/ReservationSeat'

export default defineEventHandler(async (event) => {
    await connectDB()
    const sess = await readSession(event)
    if (!sess) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

    const b = await readBody<{ showtimeId: string, seats: string[], total?: number }>(event)
    if (!b?.showtimeId || !Array.isArray(b.seats) || b.seats.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'showtimeId y seats[] requeridos' })
    }

    // valida showtime
    const st = await Showtime.findById(b.showtimeId).select('_id fechaHora active').lean()
    if (!st || !st.active) throw createError({ statusCode: 400, statusMessage: 'Showtime inválido' })
    if (new Date(st.fechaHora).getTime() < Date.now()) {
        throw createError({ statusCode: 400, statusMessage: 'Función pasada' })
    }

    // valida que los seatKeys existan en el layout
    const seatDocs = await Seat.find({ showtimeId: b.showtimeId, seatCode: { $in: b.seats.map(s => s.split('-')[1]) } }).lean()
    // check exact keys "M1-A" etc.
    const seatsSet = new Set(seatDocs.map(d => `${d.tableCode}-${d.seatCode}`))
    for (const key of b.seats) {
        if (!seatsSet.has(key)) throw createError({ statusCode: 400, statusMessage: `Asiento inválido: ${key}` })
    }

    // Crea la reserva + bloqueos. En demo, sin transacción (Atlas/Replica te permite transaccionar si quieres).
    // Intento de insert ReservationSeat respetará el índice único (si ya tomado, falla).
    try {
        const res = await Reservation.create({
            userId: sess.id,
            showtimeId: b.showtimeId,
            seats: b.seats,
            total: Number(b.total || 0),
            status: 'paid' // demo: lo marcamos pagado
        })

        await ReservationSeat.insertMany(
            b.seats.map(seatKey => ({
                showtimeId: b.showtimeId,
                seatKey,
                reservationId: res._id,
                status: 'paid'
            }))
        )

        return { ok: true, reservation: { id: String(res._id) } }
    } catch (err: any) {
        // clave duplicada => alguien se llevó un asiento
        if (err?.code === 11000) {
            throw createError({ statusCode: 409, statusMessage: 'Algún asiento ya fue tomado. Actualiza disponibilidad.' })
        }
        throw err
    }
})
