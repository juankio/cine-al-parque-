import { connectDB } from '@/server/utils/mongoose'
import { requireAdmin } from '@/server/utils/admin'
import { OrderItem } from '@/server/models/OrderItem'

export default defineEventHandler(async (event) => {
    await connectDB(); await requireAdmin(event)

    const q = getQuery(event)
    const from = q.from ? new Date(String(q.from)) : null
    const to = q.to ? new Date(String(q.to)) : null
    const limit = Math.min(50, Math.max(1, Number(q.limit || 10)))

    const items = await OrderItem.aggregate([
        { $lookup: { from: 'reservations', localField: 'reservationId', foreignField: '_id', as: 'res' } },
        { $unwind: '$res' },
        // ✅ Match sobre la reserva
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
                _id: '$menuItemId',
                nombre: { $first: '$nombre' },
                qty: { $sum: '$qty' },
                revenue: { $sum: { $multiply: ['$qty', '$price'] } }
            }
        },
        { $sort: { revenue: -1, qty: -1 } },
        { $limit: limit }
    ])

    return { items }
})
