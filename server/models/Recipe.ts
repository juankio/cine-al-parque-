import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const RecipeSchema = new Schema({
    nombre: { type: String, required: true, trim: true, unique: true },
    items: [{
        ingredientId: { type: Types.ObjectId, ref: 'Ingredient', required: true },
        qtyBase: { type: Number, required: true, min: 0 } // en unidad base del ingrediente (g/ml/unid)
    }]
}, { timestamps: true })

export const Recipe = models.Recipe || model('Recipe', RecipeSchema)
