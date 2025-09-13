import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const SeatSchema = new Schema({
    showtimeId: { type: Types.ObjectId, ref: 'Showtime', required: true },
    tableCode: { type: String, required: true }, // M1
    seatCode: { type: String, required: true }  // A, B, C, D
}, { timestamps: true })

SeatSchema.index({ showtimeId: 1, tableCode: 1, seatCode: 1 }, { unique: true })

export const Seat = models.Seat || model('Seat', SeatSchema)
