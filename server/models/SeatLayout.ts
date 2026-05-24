import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg
import type { Document, Model, Types as MongooseTypes } from 'mongoose'

export interface ISeatConfig {
  seatKey: string
  label: string
  type: string
  x: number
  y: number
  status: 'available' | 'locked' | 'maintenance'
  metadata?: any
}

export interface ISeatLayout extends Document {
  showtimeId: MongooseTypes.ObjectId
  seats: ISeatConfig[]
  createdAt: Date
  updatedAt: Date
}

const SeatConfigSchema = new Schema({
    seatKey: { type: String, required: true }, // "M1-A"
    label: { type: String, required: true },
    type: { type: String, default: 'regular' }, // 'regular', 'sofa', 'table'
    x: { type: Number, required: true }, // Posición grid o absoluta
    y: { type: Number, required: true },
    status: { type: String, enum: ['available', 'locked', 'maintenance'], default: 'available' },
    metadata: { type: Schema.Types.Mixed, required: false }
}, { _id: false })

const SeatLayoutSchema = new Schema({
    showtimeId: { type: Types.ObjectId, ref: 'Showtime', required: true, unique: true },
    seats: { type: [SeatConfigSchema], default: [] }
}, { timestamps: true })

export const SeatLayout = (models.SeatLayout || model<ISeatLayout>('SeatLayout', SeatLayoutSchema)) as Model<ISeatLayout>
