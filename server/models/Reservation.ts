import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const CartItemSchema = new Schema({
    menuItemId: { type: Types.ObjectId, ref: 'MenuItem', required: true },
    nombre: { type: String, required: true },         // snapshot
    unitPrice: { type: Number, required: true },      // snapshot
    qty: { type: Number, required: true, min: 1 }
}, { _id: false })

const ReservationSchema = new Schema({
    userId: { type: Types.ObjectId, required: true },
    showtimeId: { type: Types.ObjectId, ref: 'Showtime', required: true },
    seats: [{ type: String, required: true }],   // "M1-A"
    total: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'paid', 'canceled', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: false },      // hold TTL
    cart: { type: [CartItemSchema], default: [] },
    checkedInAt: { type: Date, required: false },
    checkedInBy: { type: Types.ObjectId, ref: 'User', required: false }
}, { timestamps: true })

ReservationSchema.index({ userId: 1, createdAt: -1 })
ReservationSchema.index({ showtimeId: 1, createdAt: -1 })
ReservationSchema.index({ status: 1, expiresAt: 1 })

export const Reservation = models.Reservation || model('Reservation', ReservationSchema)
