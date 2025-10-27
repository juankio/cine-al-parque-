import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const ItemSchema = new Schema({
    ingredientId: { type: Types.ObjectId, ref: 'Ingredient', required: true },
    qtyBase: { type: Number, required: true, min: 0 } // unidad base del ingrediente (g/ml/unid)
}, { _id: false })

const RecipeSchema = new Schema({
    nombre: { type: String, required: true, trim: true, unique: true },
    porciones: { type: Number, required: true, min: 1, default: 1 },
    activo: { type: Boolean, required: true, default: true },
    items: {
        type: [ItemSchema],
        validate: {
            validator: (arr: any[]) => Array.isArray(arr) && arr.length > 0,
            message: 'La receta debe tener al menos 1 ítem'
        }
    }
}, {
    timestamps: true
})

// Index por si el unique se cae en devs viejos
RecipeSchema.index({ nombre: 1 }, { unique: true })

export const Recipe = models.Recipe || model('Recipe', RecipeSchema)
