import pkg from 'mongoose'
const { Schema, model, models } = pkg
import type { Document, Model } from 'mongoose'

export interface IMovie extends Document {
  titulo: string
  sinopsis: string
  poster: string
  duracion: number
  clasificacion: string
  price: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const MovieSchema = new Schema({
    titulo: { type: String, required: true, trim: true },
    sinopsis: { type: String, default: '' },
    poster: { type: String, default: '' },
    duracion: { type: Number, default: 0 },       // minutos
    clasificacion: { type: String, default: '' }, // PG, PG-13, etc.
    price: { type: Number, default: 0 },       // opcional (boleta)
    active: { type: Boolean, default: true }
}, { timestamps: true })

MovieSchema.index({ titulo: 'text' })

export const Movie = (models.Movie || model<IMovie>('Movie', MovieSchema)) as Model<IMovie>
