import { connectDB } from '@/server/utils/mongoose'
import { Showtime } from '@/server/models/Showtime'
import { SeatLayout } from '@/server/models/SeatLayout'
import { ReservationSeat } from '@/server/models/ReservationSeat'
import { Reservation } from '@/server/models/Reservation'
import pkg from 'mongoose'
const { Types } = pkg

export default defineEventHandler(async (event) => {
    await connectDB()

    const rawId = getRouterParam(event, 'id')
    if (!rawId || !Types.ObjectId.isValid(rawId)) {
        throw createError({ statusCode: 400, statusMessage: 'Showtime inválido' })
    }

    const showtime = await Showtime.findById(rawId).lean()
    if (!showtime || !showtime.active) throw createError({ statusCode: 404, statusMessage: 'Showtime no encontrado' })

    // Validar holds expirados
    const now = new Date()
    const expiredReservations = await Reservation.find({ status: 'pending', expiresAt: { $lt: now } }).select('_id').lean()
    const expiredIds = expiredReservations.map((r: any) => r._id)

    if (expiredIds.length > 0) {
        await Reservation.updateMany({ _id: { $in: expiredIds } }, { $set: { status: 'expired' } })
        await ReservationSeat.deleteMany({ reservationId: { $in: expiredIds } })
    }

    const layout = await SeatLayout.findOne({ showtimeId: rawId }).lean()
    if (!layout) {
        return { ok: true, layout: null, taken: [] }
    }

    const takenSeats = await ReservationSeat.find({ showtimeId: rawId }).lean()

    const transformedLayout = {
        _id: layout._id.toString(),
        showtimeId: layout.showtimeId.toString(),
        seats: layout.seats.map((s: any) => ({
            seatKey: s.seatKey,
            label: s.label,
            type: s.type,
            x: s.x,
            y: s.y,
            status: s.status,
            metadata: s.metadata || {}
        }))
    }

    return {
        ok: true,
        layout: transformedLayout,
        taken: takenSeats.map((t: any) => t.seatKey)
    }
})
