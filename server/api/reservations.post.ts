import { connectDB } from '@/server/utils/mongoose'
import { readSession } from '@/server/utils/session'
import { Showtime } from '@/server/models/Showtime'
import { Seat } from '@/server/models/Seat'
import { Reservation } from '@/server/models/Reservation'
import { ReservationSeat } from '@/server/models/ReservationSeat'
import { MenuItem } from '@/server/models/MenuItem'
import { Recipe } from '@/server/models/Recipe' // solo para validar existencia si quieres
// NOTA: NO descontamos inventario aquí (hasta confirmar pago)

type CartItemReq = { menuItemId: string, qty: number }

export default defineEventHandler(async (event) => {
    await connectDB()
    const sess = await readSession(event)
    if (!sess) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

    const q = getQuery(event)
    const mode = String(q.mode || 'pending') // 'pending' | 'paid' (demo)

    const b = await readBody<{ showtimeId: string, seats: string[], items?: CartItemReq[] }>(event)
    if (!b?.showtimeId || !Array.isArray(b.seats) || b.seats.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'showtimeId y seats[] requeridos' })
    }

    // 1) validar showtime
    const st = await Showtime.findById(b.showtimeId).select('_id fechaHora active price').lean()
    if (!st || !st.active) throw createError({ statusCode: 400, statusMessage: 'Showtime inválido' })
    if (new Date(st.fechaHora).getTime() < Date.now()) {
        throw createError({ statusCode: 400, statusMessage: 'Función pasada' })
    }

    // 2) validar layout + asientos
    const seatDocs = await Seat.find({ showtimeId: b.showtimeId }).select('tableCode seatCode').lean()
    if (!seatDocs.length) throw createError({ statusCode: 409, statusMessage: 'Este showtime no tiene layout generado' })
    const seatsSet = new Set(seatDocs.map(d => `${d.tableCode}-${d.seatCode}`))
    for (const key of b.seats) {
        if (!seatsSet.has(key)) throw createError({ statusCode: 400, statusMessage: `Asiento inválido: ${key}` })
    }

    // 3) procesar carrito (snapshot precios y nombres)
    const reqItems = Array.isArray(b.items) ? b.items.filter(i => i && i.menuItemId && i.qty > 0) : []
    let foodTotal = 0
    let cartSnapshot: Array<{ menuItemId: string, nombre: string, unitPrice: number, qty: number }> = []

    if (reqItems.length) {
        const ids = [...new Set(reqItems.map(i => i.menuItemId))]
        const menuDocs = await MenuItem.find({ _id: { $in: ids }, activo: true }).lean()
        const menuMap = new Map(menuDocs.map(m => [String(m._id), m]))
        for (const it of reqItems) {
            const md = menuMap.get(it.menuItemId)
            if (!md) throw createError({ statusCode: 400, statusMessage: 'Menu item inválido o inactivo' })
            const unitPrice = Number((md as any).precio || 0)
            const line = unitPrice * it.qty
            foodTotal += line
            cartSnapshot.push({
                menuItemId: String(md._id),
                nombre: md.nombre,
                unitPrice,
                qty: it.qty
            })
        }
    }

    const seatsTotal = (Number(st.price || 0)) * b.seats.length
    const total = seatsTotal + foodTotal

    // TTL de hold (minutos) desde runtimeConfig (o 10 por defecto)
    const { holdsTtlMinutes } = useRuntimeConfig()
    const ttlMin = Number(holdsTtlMinutes || 10)
    const expiresAt = new Date(Date.now() + ttlMin * 60 * 1000)

    try {
        const res = await Reservation.create({
            userId: sess.id,
            showtimeId: b.showtimeId,
            seats: b.seats,
            total,
            status: mode === 'paid' ? 'paid' : 'pending',
            expiresAt: mode === 'paid' ? undefined : expiresAt,
            cart: cartSnapshot
        })

        // bloquear asientos (status según reservation.status)
        await ReservationSeat.insertMany(
            b.seats.map(seatKey => ({
                showtimeId: b.showtimeId,
                seatKey,
                reservationId: res._id,
                status: mode === 'paid' ? 'paid' : 'pending'
            }))
        )

        // NOTA: inventario solo se descuenta cuando confirmamos pago

        return {
            ok: true,
            reservation: { id: String(res._id), total },
            breakdown: { seatsTotal, foodTotal },
            ...(mode === 'pending' ? { expiresAt } : {})
        }
    } catch (err: any) {
        if (err?.code === 11000) {
            throw createError({ statusCode: 409, statusMessage: 'Algún asiento ya fue tomado. Actualiza disponibilidad.' })
        }
        throw err
    }
})
