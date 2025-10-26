// ~/server/models/Ingredient.ts
import pkg from 'mongoose'
const { Schema, model, models } = pkg

type Unidad = 'g' | 'kg' | 'ml' | 'l' | 'unid'
type UnidadBase = 'g' | 'ml' | 'unid'
type Tipo = 'peso' | 'volumen' | 'unidad'

export const UNIT_MAP: Record<Unidad, { base: UnidadBase; factor: number; tipo: Tipo }> = {
    g: { base: 'g', factor: 1, tipo: 'peso' },
    kg: { base: 'g', factor: 1000, tipo: 'peso' },
    ml: { base: 'ml', factor: 1, tipo: 'volumen' },
    l: { base: 'ml', factor: 1000, tipo: 'volumen' },
    unid: { base: 'unid', factor: 1, tipo: 'unidad' }
}

const IngredientSchema = new Schema({
    nombre: { type: String, required: true, trim: true, unique: true },
    unidad: { type: String, required: true, enum: ['g', 'kg', 'ml', 'l', 'unid'], default: 'unid' },

    // derivados
    unidadBase: { type: String, enum: ['g', 'ml', 'unid'], default: 'unid' },
    tipo: { type: String, enum: ['peso', 'volumen', 'unidad'], default: 'unidad' },
    factorAUnidadBase: { type: Number, default: 1 },

    // campos nuevos
    stockBase: { type: Number, default: 0 },
    costoPromedio: { type: Number, default: 0 },
    activo: { type: Boolean, default: true }
}, { timestamps: true })

IngredientSchema.pre('validate', function (next) {
    // @ts-ignore
    const def = UNIT_MAP[this.unidad]
    if (def) {
        // @ts-ignore
        this.unidadBase = def.base
        // @ts-ignore
        this.tipo = def.tipo
        // @ts-ignore
        this.factorAUnidadBase = def.factor
    }
    next()
})

export const Ingredient = models.Ingredient || model('Ingredient', IngredientSchema)
