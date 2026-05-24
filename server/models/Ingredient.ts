import pkg from 'mongoose'
const { Schema, model, models } = pkg
import type { Document, Model } from 'mongoose'

export interface IIngredient extends Document {
  nombre: string
  unidad: 'g' | 'kg' | 'ml' | 'l' | 'unid'
  unidadBase: 'g' | 'ml' | 'unid'
  tipo: 'unidad' | 'peso' | 'volumen'
  factorAUnidadBase: number
  stockBase: number
  costoPromedio: number
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const IngredientSchema = new Schema({
    nombre: { type: String, required: true, trim: true, unique: true },
    unidad: { type: String, required: true, enum: ['g', 'kg', 'ml', 'l', 'unid'] },
    unidadBase: { type: String, required: true, enum: ['g', 'ml', 'unid'] },
    tipo: { type: String, required: true, enum: ['unidad', 'peso', 'volumen'] },
    factorAUnidadBase: { type: Number, required: true, default: 1 },
    stockBase: { type: Number, default: 0 },
    costoPromedio: { type: Number, default: 0 },
    activo: { type: Boolean, default: true }
}, { timestamps: true })

IngredientSchema.index({ nombre: 1 })

export const Ingredient = (models.Ingredient || model<IIngredient>('Ingredient', IngredientSchema)) as Model<IIngredient>
