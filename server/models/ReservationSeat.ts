import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg
import type { Document, Model, Types as MongooseTypes } from 'mongoose'

export interface IReservationSeat extends Document {
  showtimeId: MongooseTypes.ObjectId
  seatKey: string
  reservationId: MongooseTypes.ObjectId
  status: 'pending' | 'paid' | 'canceled'
  createdAt: Date
  updatedAt: Date
}

const ReservationSeatSchema = new Schema({
    showtimeId: { type: Types.ObjectId, ref: 'Showtime', required: true },
    seatKey: { type: String, required: true }, // "M1-A"
    reservationId: { type: Types.ObjectId, ref: 'Reservation', required: true },
    status: { type: String, enum: ['pending', 'paid', 'canceled'], default: 'pending' }
}, { timestamps: true })

ReservationSeatSchema.index({ showtimeId: 1, seatKey: 1 }, { unique: true })

export const ReservationSeat = (models.ReservationSeat || model<IReservationSeat>('ReservationSeat', ReservationSeatSchema)) as Model<IReservationSeat>
