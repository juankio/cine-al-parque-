import { connectDB } from '../utils/mongoose'
import { usersCol } from '../utils/db'

export default defineNitroPlugin(async (nitroApp) => {
  // Aseguramos la conexión e índices al iniciar Nitro
  try {
    await connectDB()
    
    // Crear índice único en email
    const col = await usersCol()
    await col.createIndex({ email: 1 }, { unique: true })
    console.log('[mongo-indexes] users.email index OK → email_1 unique: true')
    
  } catch (err) {
    console.error('❌ [mongo-indexes] Error configurando índices al iniciar:', err)
  }
})
