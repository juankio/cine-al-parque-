import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const MenuItemSchema = new Schema({
    nombre: { type: String, required: true, trim: true, unique: true },
    precio: { type: Number, required: true },
    recipeId: { type: Types.ObjectId, ref: 'Recipe', default: null },
    activo: { type: Boolean, default: true }
}, { timestamps: true })

export const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema)
