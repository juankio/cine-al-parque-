// server/models/MenuItem.ts
import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const MenuExtraSchema = new Schema({
    ingredientId: { type: Types.ObjectId, ref: 'Ingredient', required: true },
    qtyExtra: { type: Number, required: true, min: 0 }
}, { _id: false })

const MenuItemSchema = new Schema({
    nombre: { type: String, required: true, trim: true, unique: true },
    precio: { type: Number, required: true, min: 0 },
    recipeId: { type: Types.ObjectId, ref: 'Recipe', default: null },
    // NUEVO
    porciones: { type: Number, default: 1, min: 1 },   // porciones que rinde este ítem
    extras: { type: [MenuExtraSchema], default: [] },// extras por producto (ingrediente + cantidad)
    descripcion: { type: String, default: '', trim: true },
    categoria: { type: String, default: '', trim: true },
    tags: { type: [String], default: [] },
    activo: { type: Boolean, default: true }
}, { timestamps: true })

MenuItemSchema.index({ activo: 1 })
MenuItemSchema.index({ recipeId: 1 })

export const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema)
