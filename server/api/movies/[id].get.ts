import { connectDB } from '@/server/utils/mongoose'
import { Movie } from '@/server/models/Movie'
import pkg from 'mongoose'

const { isValidObjectId } = pkg

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !isValidObjectId(id)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de pelicula invalido' })
  }

  await connectDB()

  const movie = await Movie.findOne({ _id: id, active: true }).lean()

  if (!movie) {
    throw createError({ statusCode: 404, statusMessage: 'Pelicula no encontrada' })
  }

  const movieId = typeof movie._id === 'string' ? movie._id : movie._id?.toString?.()

  return {
    ...movie,
    id: movieId
  }
})
