import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Showtime } from '@/server/models/Showtime'
import { Table } from '@/server/models/Table'
import { Seat } from '@/server/models/Seat'
import { ReservationSeat } from '@/server/models/ReservationSeat'

type PatternCell = '2' | '4'
interface Body {
    // formato 1 (grilla):
    rows?: number
    cols?: number
    pattern?: PatternCell[][]
    // formato 2 (simple):
    tables2?: number
    tables4?: number
    // comunes
    prefix?: string
    replace?: boolean
}

export default defineEventHandler(async (event) => {
    await connectDB()
    await requireAdmin(event)

    const showtimeId = getRouterParam(event, 'id')
    if (!showtimeId) throw createError({ statusCode: 400, statusMessage: 'Falta showtimeId' })

    const b = await readBody<Body>(event)
    let t2 = Math.max(0, Math.floor(b?.tables2 ?? 0))
    let t4 = Math.max(0, Math.floor(b?.tables4 ?? 0))
    const prefix = (b?.prefix || 'M').toUpperCase().trim()
    const replace = !!b?.replace

    // Si viene pattern, lo convertimos a #mesas 2/4
    if (Array.isArray(b?.pattern) && b.pattern.length > 0) {
        let c2 = 0, c4 = 0
        for (const row of b.pattern) {
            if (!Array.isArray(row)) continue
            for (const cell of row) {
                if (cell === '2') c2++
                else if (cell === '4') c4++
            }
        }
        // si el pattern define algo, usamos eso (sobre-escribe tables2/4)
        if (c2 + c4 > 0) { t2 = c2; t4 = c4 }
    } else if ((b.rows && b.cols) && (!b.tables2 && !b.tables4)) {
        // Si mandan rows/cols sin pattern ni tables2/4 → alternamos por defecto
        const rows = Math.max(1, Math.min(20, Number(b.rows)))
        const cols = Math.max(1, Math.min(20, Number(b.cols)))
        let c2 = 0, c4 = 0
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                ((r + c) % 2 === 0) ? c4++ : c2++
            }
        }
        t2 = c2; t4 = c4
    }

    // valida showtime
    const st = await Showtime.findById(showtimeId).select('_id').lean()
    if (!st) throw createError({ statusCode: 404, statusMessage: 'Showtime no existe' })

    // bloquea replace si hay reservas activas
    if (replace) {
        const taken = await ReservationSeat.countDocuments({
            showtimeId,
            status: { $in: ['pending', 'paid'] }
        })
        if (taken > 0) {
            throw createError({ statusCode: 409, statusMessage: `No se puede regenerar: ${taken} asiento(s) reservados` })
        }
    }

    // si replace, borra layout previo
    let deletedTables = 0, deletedSeats = 0
    if (replace) {
        const [delT, delS] = await Promise.all([
            Table.deleteMany({ showtimeId }),
            Seat.deleteMany({ showtimeId })
        ])
        deletedTables = delT?.deletedCount || 0
        deletedSeats = delS?.deletedCount || 0
    }

    // averigua el siguiente número de mesa
    const existing = await Table.find({ showtimeId }).select('code').lean()
    const usedNums = new Set(
        existing.map(x => parseInt(String(x.code).replace(prefix, ''), 10)).filter(Number.isFinite)
    )
    let next = 1
    while (usedNums.has(next)) next++

    const opsTables: any[] = []
    const opsSeats: any[] = []

    const makeTable = (cap: 2 | 4) => {
        const code = `${prefix}${next++}`
        opsTables.push({ showtimeId, code, capacity: cap })
        const seatCodes = cap === 2 ? ['A', 'B'] : ['A', 'B', 'C', 'D']
        for (const s of seatCodes) {
            opsSeats.push({ showtimeId, tableCode: code, seatCode: s, seatKey: `${code}-${s}` })
        }
    }

    for (let i = 0; i < t2; i++) makeTable(2)
    for (let i = 0; i < t4; i++) makeTable(4)

    if (opsTables.length === 0) {
        return {
            ok: true,
            showtimeId,
            createdTables: 0,
            createdSeats: 0,
            tables: 0,
            seats: 0,
            totalTables: await Table.countDocuments({ showtimeId }),
            totalSeats: await Seat.countDocuments({ showtimeId }),
            deletedTables,
            deletedSeats,
            prefix,
            replace
        }
    }

    const [insT, insS] = await Promise.all([
        Table.insertMany(opsTables),
        Seat.insertMany(opsSeats)
    ])

    const createdTables = insT.length
    const createdSeats = insS.length
    const [totalTables, totalSeats] = await Promise.all([
        Table.countDocuments({ showtimeId }),
        Seat.countDocuments({ showtimeId })
    ])

    return {
        ok: true,
        showtimeId,
        createdTables,
        createdSeats,
        // alias que espera el front
        tables: createdTables,
        seats: createdSeats,
        totalTables,
        totalSeats,
        deletedTables,
        deletedSeats,
        prefix,
        replace
    }
})
