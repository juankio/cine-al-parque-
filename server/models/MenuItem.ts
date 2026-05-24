import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg
import type { Document, Model, Types as MongooseTypes } from 'mongoose'

export interface IMenuItemRecipe {
  ingredientId: MongooseTypes.ObjectId
  qty: number
}

export interface IMenuItem extends Document {
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  tags: string[]
  imagenUrl: string
  activo: boolean
  recipe: IMenuItemRecipe[]
  createdAt: Date
  updatedAt: Date
}

const MenuItemRecipeSchema = new Schema({
    ingredientId: { type: Types.ObjectId, ref: 'Ingredient', required: true },
    qty: { type: Number, required: true, min: 0 }
}, { _id: false })

const MenuItemSchema = new Schema({
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, default: '' },
    precio: { type: Number, required: true, min: 0 },
    categoria: { type: String, default: 'snack' }, 
    tags: { type: [String], default: [] },
    imagenUrl: { type: String, default: '' },
    activo: { type: Boolean, default: true },
    recipe: { type: [MenuItemRecipeSchema], default: [] }
}, { timestamps: true })

MenuItemSchema.index({ categoria: 1 })
MenuItemSchema.index({ nombre: 'text' })

export const MenuItem = (models.MenuItem || model<IMenuItem>('MenuItem', MenuItemSchema)) as Model<IMenuItem>
