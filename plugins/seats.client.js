import { useSeats } from '@/stores/useSeats'

export default defineNuxtPlugin(() => {
  // No hacemos init global; se hace al visitar /sala con el contexto de película
  const seats = useSeats()
  // si hay un contexto previo guardado en memoria (navegación interna),
  // seats.load() levantará ese estado; si no, /sala seteará movieId/hora
  if (process.client && seats.movieId) seats.load()
})
