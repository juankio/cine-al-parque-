import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const ReservationSeatSchema = new Schema({
    showtimeId: { type: Types.ObjectId, ref: 'Showtime', required: true },
    seatKey: { type: String, required: true }, // "M1-A"
    reservationId: { type: Types.ObjectId, ref: 'Reservation', required: true },
    status: { type: String, enum: ['pending', 'paid', 'canceled'], default: 'paid' }
}, { timestamps: true })


ReservationSeatSchema.index(
    { showtimeId: 1, seatKey: 1 },
    { unique: true, partialFilterExpression: { status: { $in: ['pending', 'paid'] } } }
)

export const ReservationSeat = models.ReservationSeat || model('ReservationSeat', ReservationSeatSchema)
