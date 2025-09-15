import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { Reservation } from '@/server/models/Reservation'
import { OrderItem } from '@/server/models/OrderItem'
import { Showtime } from '@/server/models/Showtime'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)

    const q = getQuery(event)
    const from = q.from ? new Date(String(q.from)) : null
    const to = q.to ? new Date(String(q.to)) : null

    const dateMatch: any = {}
    if (from) dateMatch.$gte = from
    if (to) dateMatch.$lte = to

    const resMatch: any = { status: 'paid' }
    if (from || to) resMatch.createdAt = dateMatch

    // --- 1) RESERVAS (visitas) + ingreso por ENTRADAS ---
    const [resAgg] = await Reservation.aggregate([
        { $match: resMatch },
        { $lookup: { from: 'showtimes', localField: 'showtimeId', foreignField: '_id', as: 'st' } },
        { $unwind: '$st' },
        {
            $addFields: {
                seatsCount: { $size: '$seats' },
                seatPrice: { $ifNull: ['$st.price', 0] }
            }
        },
        {
            $group: {
                _id: null,
                visits: { $sum: 1 },
                seatsSold: { $sum: '$seatsCount' },
                seatsRevenue: { $sum: { $multiply: ['$seatsCount', '$seatPrice'] } }
            }
        }
    ])

    const visits = resAgg?.visits || 0
    const seatsSold = resAgg?.seatsSold || 0
    const seatsRevenue = resAgg?.seatsRevenue || 0

    // --- 2) ORDER ITEMS (ingreso por COMIDA) ---
    const [foodAgg] = await OrderItem.aggregate([
        { $lookup: { from: 'reservations', localField: 'reservationId', foreignField: '_id', as: 'res' } },
        { $unwind: '$res' },
        // ✅ Match sobre campos de la reserva
        {
            $match: {
                'res.status': 'paid',
                ...(from || to ? {
                    'res.createdAt': {
                        ...(from ? { $gte: from } : {}),
                        ...(to ? { $lte: to } : {})
                    }
                } : {})
            }
        },
        {
            $group: {
                _id: null,
                foodRevenue: { $sum: { $multiply: ['$qty', '$price'] } }
            }
        }
    ])
    const foodRevenue = foodAgg?.foodRevenue || 0

    // --- 3) COGS estimado por receta ---
    const cogsAgg = await OrderItem.aggregate([
        { $lookup: { from: 'reservations', localField: 'reservationId', foreignField: '_id', as: 'res' } },
        { $unwind: '$res' },
        {
            $match: {
                'res.status': 'paid',
                ...(from || to ? {
                    'res.createdAt': {
                        ...(from ? { $gte: from } : {}),
                        ...(to ? { $lte: to } : {})
                    }
                } : {})
            }
        },
        { $lookup: { from: 'menuitems', localField: 'menuItemId', foreignField: '_id', as: 'mi' } },
        { $unwind: '$mi' },
        { $match: { 'mi.recipeId': { $ne: null } } },
        { $lookup: { from: 'recipes', localField: 'mi.recipeId', foreignField: '_id', as: 'rec' } },
        { $unwind: '$rec' },
        { $unwind: '$rec.items' },
        { $lookup: { from: 'ingredients', localField: 'rec.items.ingredientId', foreignField: '_id', as: 'ing' } },
        { $unwind: '$ing' },
        {
            $project: {
                qtyMenu: '$qty',
                qtyBasePorUnidad: '$rec.items.qtyBase',
                costoUnitIng: { $ifNull: ['$ing.costoPromedio', 0] }
            }
        },
        {
            $group: {
                _id: null,
                cogs: { $sum: { $multiply: ['$qtyMenu', '$qtyBasePorUnidad', '$costoUnitIng'] } }
            }
        }
    ])
    const cogs = cogsAgg?.[0]?.cogs || 0

    const revenue = seatsRevenue + foodRevenue
    const margin = revenue - cogs
    const ticketPromedio = visits > 0 ? revenue / visits : 0

    return {
        range: { from: from || null, to: to || null },
        visits, seatsSold,
        revenue: { total: revenue, seats: seatsRevenue, food: foodRevenue },
        cogs,
        margin,
        ticketPromedio
    }
})
