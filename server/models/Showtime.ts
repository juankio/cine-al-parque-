import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg
import type { Document, Model, Types as MongooseTypes } from 'mongoose'

export interface IShowtime extends Document {
  movieId: MongooseTypes.ObjectId
  fechaHora: Date
  sala: string
  price: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const ShowtimeSchema = new Schema({
    movieId: { type: Types.ObjectId, ref: 'Movie', required: true },
    fechaHora: { type: Date, required: true },   // guarda en UTC
    sala: { type: String, default: '' },
    price: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
}, { timestamps: true })

ShowtimeSchema.index({ movieId: 1, fechaHora: 1 })

export const Showtime = (models.Showtime || model<IShowtime>('Showtime', ShowtimeSchema)) as Model<IShowtime>
