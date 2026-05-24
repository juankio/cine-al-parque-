import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg
import type { Document, Model, Types as MongooseTypes } from 'mongoose'

export interface IInventoryLog extends Document {
  ingredientId: MongooseTypes.ObjectId
  type: 'IN' | 'OUT' | 'ADJUST'
  qty: number
  unit: string
  cost: number
  reason: string
  userId: MongooseTypes.ObjectId
  createdAt: Date
  updatedAt: Date
}

const InventoryLogSchema = new Schema({
    ingredientId: { type: Types.ObjectId, ref: 'Ingredient', required: true },
    type: { type: String, enum: ['IN', 'OUT', 'ADJUST'], required: true },
    qty: { type: Number, required: true }, // Positivo para IN, Negativo o Positivo para ADJUST
    unit: { type: String, required: true }, // Unidad base
    cost: { type: Number, default: 0 }, // Costo total de la transacción (para compras IN)
    reason: { type: String, default: '' },
    userId: { type: Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

InventoryLogSchema.index({ ingredientId: 1, createdAt: -1 })

export const InventoryLog = (models.InventoryLog || model<IInventoryLog>('InventoryLog', InventoryLogSchema)) as Model<IInventoryLog>
