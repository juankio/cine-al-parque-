import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg
import type { Document, Model, Types as MongooseTypes } from 'mongoose'

export interface IRecipeIngredient {
  ingredientId: MongooseTypes.ObjectId
  qtyRatio: number
}

export interface IRecipe extends Document {
  nombre: string
  unidad: 'g' | 'kg' | 'ml' | 'l' | 'unid'
  unidadBase: 'g' | 'ml' | 'unid'
  tipo: 'unidad' | 'peso' | 'volumen'
  factorAUnidadBase: number
  stockBase: number
  costoPromedio: number
  activo: boolean
  ingredients: IRecipeIngredient[]
  createdAt: Date
  updatedAt: Date
}

const RecipeIngredientSchema = new Schema({
    ingredientId: { type: Types.ObjectId, ref: 'Ingredient', required: true },
    qtyRatio: { type: Number, required: true, min: 0 } 
}, { _id: false })

const RecipeSchema = new Schema({
    nombre: { type: String, required: true, trim: true, unique: true },
    unidad: { type: String, required: true, enum: ['g', 'kg', 'ml', 'l', 'unid'] },
    unidadBase: { type: String, required: true, enum: ['g', 'ml', 'unid'] },
    tipo: { type: String, required: true, enum: ['unidad', 'peso', 'volumen'] },
    factorAUnidadBase: { type: Number, required: true, default: 1 },
    stockBase: { type: Number, default: 0 },
    costoPromedio: { type: Number, default: 0 },
    activo: { type: Boolean, default: true },
    ingredients: { type: [RecipeIngredientSchema], default: [] }
}, { timestamps: true })

export const Recipe = (models.Recipe || model<IRecipe>('Recipe', RecipeSchema)) as Model<IRecipe>
