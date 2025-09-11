import pkg from 'mongoose'
const { Schema, model, models } = pkg

const MovieSchema = new Schema({
    titulo: { type: String, required: true },
    sinopsis: String,
    poster: String,
    duracion: Number,
    clasificacion: String
}, { timestamps: true })

export const Movie = models.Movie || model('Movie', MovieSchema)
