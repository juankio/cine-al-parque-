import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const MenuItemSchema = new Schema({
    nombre: { type: String, required: true, trim: true, unique: true }, // único índice
    precio: { type: Number, required: true, min: 0 },
    recipeId: { type: Types.ObjectId, ref: 'Recipe', default: null },
    activo: { type: Boolean, default: true },
}, { timestamps: true })

MenuItemSchema.index({ activo: 1 })
MenuItemSchema.index({ recipeId: 1 })

export const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema)
