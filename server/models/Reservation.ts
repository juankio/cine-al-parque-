import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const ReservationSchema = new Schema({
    userId: { type: Types.ObjectId, required: true },
    showtimeId: { type: Types.ObjectId, ref: 'Showtime', required: true },
    seats: [{ type: String, required: true }], // ej: "M1-A"
    total: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'paid', 'canceled'], default: 'paid' } // demo: marcamos pagado
}, { timestamps: true })

ReservationSchema.index({ userId: 1, createdAt: -1 })
ReservationSchema.index({ showtimeId: 1, createdAt: -1 })

export const Reservation = models.Reservation || model('Reservation', ReservationSchema)
