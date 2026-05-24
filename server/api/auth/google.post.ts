import { connectDB } from '~/server/utils/mongoose'
import { createError, readBody } from 'h3'
import { usersCol } from '~/server/utils/db'
import { createSession } from '~/server/utils/auth'
import { isAdminEmail } from '~/server/utils/admin'

export default defineEventHandler(async (event) => {
  await connectDB()

  const body = await readBody<{ credential?: string; remember?: boolean }>(event)
  const token = body?.credential
  const remember = !!body?.remember

  if (!token) {
    throw createError({ statusCode: 400, message: 'Falta el token de Google' })
  }

  try {
    // 1. Usar el Access Token para obtener los datos del usuario desde la API de Google
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!googleResponse.ok) {
      throw createError({ statusCode: 400, message: 'Token de Google inválido' })
    }

    const payload = await googleResponse.json()
    
    if (!payload || !payload.email) {
      throw createError({ statusCode: 400, message: 'Token de Google sin email' })
    }

    const email = payload.email.toLowerCase().trim()
    const name = payload.name || 'Usuario Google'
    const googleId = payload.sub
    const picture = payload.picture

    // 2. Buscar al usuario en la DB
    const col = await usersCol()
    let user: any = await col.findOne({ email })

    // 3. Crear el usuario si no existe
    if (!user) {
      const result = await col.insertOne({
        email,
        name,
        googleId,
        picture,
        passwordHash: null,
        isAdmin: isAdminEmail(email),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      user = { _id: result.insertedId, email, name, googleId, isAdmin: isAdminEmail(email) }
      console.log('✨ [Google Auth] Nuevo usuario creado:', email)
    } else {
      if (!user.googleId) {
        await col.updateOne({ _id: user._id }, { $set: { googleId, picture } })
        console.log('🔗 [Google Auth] Cuenta existente vinculada con Google:', email)
      }
    }

    // 4. Determinar rol de admin
    const isAdmin = isAdminEmail(email) || !!user.isAdmin

    // 5. Crear la sesión JWT local
    const sessionPayload = {
      sub: String(user._id),
      email: user.email,
      isAdmin,
      name: user.name,
    }
    
    createSession(event, sessionPayload, remember)

    return {
      ok: true,
      user: { id: String(user._id), email: user.email, name: user.name, isAdmin, picture }
    }
  } catch (error: any) {
    console.error('❌ [Google Auth Error]:', error.message)
    throw createError({ statusCode: 401, message: 'Fallo la autenticación con Google' })
  }
})
