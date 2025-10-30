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
    recipeIds: { type: [Types.ObjectId], ref: 'Recipe', default: [] },
    porciones: { type: Number, default: 1, min: 1 },
    extras: { type: [MenuExtraSchema], default: [] },
    descripcion: { type: String, default: '', trim: true },
    categoria: { type: String, default: '', trim: true },
    tags: { type: [String], default: [] },
    activo: { type: Boolean, default: true }
}, { timestamps: true })

MenuItemSchema.index({ activo: 1 })
MenuItemSchema.index({ recipeId: 1 })
MenuItemSchema.index({ recipeIds: 1 })

MenuItemSchema.pre('validate', function (next) {
    if (Array.isArray(this.recipeIds) && this.recipeIds.length > 0) {
        if (!this.recipeId) this.recipeId = this.recipeIds[0]
    } else if (this.recipeId) {
        this.recipeIds = [this.recipeId]
    } else {
        this.recipeIds = []
        this.recipeId = null
    }

    this.tags = (this.tags || [])
        .map((s: any) => String(s || '').trim())
        .filter(Boolean)

    if (!Array.isArray(this.extras)) this.extras = []

    next()
})

export const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema)
