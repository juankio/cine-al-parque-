import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg
import type { Document, Model, Types as MongooseTypes } from 'mongoose'

export interface ISeat extends Document {
  showtimeId: MongooseTypes.ObjectId
  tableCode: string
  seatCode: string
  createdAt: Date
  updatedAt: Date
}

const SeatSchema = new Schema({
    showtimeId: { type: Types.ObjectId, ref: 'Showtime', required: true },
    tableCode: { type: String, required: true }, // M1
    seatCode: { type: String, required: true }  // A, B, C, D
}, { timestamps: true })

SeatSchema.index({ showtimeId: 1, tableCode: 1, seatCode: 1 }, { unique: true })

export const Seat = (models.Seat || model<ISeat>('Seat', SeatSchema)) as Model<ISeat>
