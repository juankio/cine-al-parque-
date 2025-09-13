import { connectDB } from '@/server/utils/mongoose'
import { Showtime } from '@/server/models/Showtime'
import { Table } from '@/server/models/Table'
import { Seat } from '@/server/models/Seat'
import { ReservationSeat } from '@/server/models/ReservationSeat'

export default defineEventHandler(async (event) => {
    await connectDB()

    const showtimeId = getRouterParam(event, 'id')
    if (!showtimeId) {
        throw createError({ statusCode: 400, statusMessage: 'Falta id de showtime' })
    }
    // valida showtime
    const st = await Showtime.findById(showtimeId).select('_id').lean()
    if (!st) {
        throw createError({ statusCode: 404, statusMessage: 'Showtime no encontrado' })
    }

    // Traer layout (mesas y asientos) y los asientos tomados
    const [tables, seats, takenDocs] = await Promise.all([
        Table.find({ showtimeId }).sort({ code: 1 }).lean(),
        Seat.find({ showtimeId }).sort({ tableCode: 1, seatCode: 1 }).lean(),
        ReservationSeat.find({
            showtimeId,
            status: { $in: ['pending', 'paid'] }
        })
            .select('seatKey')
            .lean()
    ])

    const takenSet = new Set(takenDocs.map(d => d.seatKey))

    // Agrupar asientos por mesa y marcar taken
    const seatsByTable = new Map<string, { code: string; taken: boolean }[]>()
    for (const s of seats) {
        const list = seatsByTable.get(s.tableCode) || []
        list.push({
            code: s.seatCode,
            taken: takenSet.has(`${s.tableCode}-${s.seatCode}`)
        })
        seatsByTable.set(s.tableCode, list)
    }

    const payload = tables.map(t => {
        const list = seatsByTable.get(t.code) || []
        list.sort((a, b) => a.code.localeCompare(b.code)) // A,B,(C,D)
        return {
            table: t.code,
            capacity: t.capacity,
            seats: list
        }
    })

    return { showtimeId, tables: payload }
})
