import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Showtime } from '@/server/models/Showtime'
import { Table } from '@/server/models/Table'
import { Seat } from '@/server/models/Seat'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)
    const showtimeId = getRouterParam(event, 'id')
    const b = await readBody<{ tables2: number, tables4: number, prefix?: string, replace?: boolean }>(event)

    const t2 = Math.max(0, Math.floor(b?.tables2 ?? 0))
    const t4 = Math.max(0, Math.floor(b?.tables4 ?? 0))
    const prefix = (b?.prefix || 'M').toUpperCase()
    const replace = !!b?.replace

    // valida showtime
    const st = await Showtime.findById(showtimeId).select('_id').lean()
    if (!st) throw createError({ statusCode: 404, statusMessage: 'Showtime no existe' })

    // si replace, borra layout previo
    if (replace) {
        await Promise.all([
            Table.deleteMany({ showtimeId }),
            Seat.deleteMany({ showtimeId })
        ])
    }

    // averigua el siguiente número de mesa (si ya hay mesas)
    const existing = await Table.find({ showtimeId }).select('code').lean()
    const usedNums = new Set(
        existing.map(x => parseInt(String(x.code).replace(prefix, ''), 10)).filter(n => Number.isFinite(n))
    )
    let next = 1
    while (usedNums.has(next)) next++

    const opsTables: any[] = []
    const opsSeats: any[] = []

    const makeTable = (cap: 2 | 4) => {
        const code = `${prefix}${next++}`
        opsTables.push({ showtimeId, code, capacity: cap })
        const seatCodes = cap === 2 ? ['A', 'B'] : ['A', 'B', 'C', 'D']
        seatCodes.forEach(s => opsSeats.push({ showtimeId, tableCode: code, seatCode: s }))
    }

    for (let i = 0; i < t2; i++) makeTable(2)
    for (let i = 0; i < t4; i++) makeTable(4)

    if (!opsTables.length) return { ok: true, createdTables: 0, createdSeats: 0 }

    await Table.insertMany(opsTables)
    await Seat.insertMany(opsSeats)

    return { ok: true, createdTables: opsTables.length, createdSeats: opsSeats.length }
})
