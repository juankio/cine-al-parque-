import { connectDB } from '@/server/utils/mongoose'
import { readSession } from '@/server/utils/session'
import { Reservation, type IReservation, type ICartItem } from '@/server/models/Reservation'
import { Showtime } from '@/server/models/Showtime'
import { MenuItem, type IMenuItem, type IMenuItemRecipe } from '@/server/models/MenuItem'
import { Recipe, type IRecipe, type IRecipeIngredient } from '@/server/models/Recipe'
import { Ingredient } from '@/server/models/Ingredient'
import { InventoryLog } from '@/server/models/InventoryLog'
import { Types } from 'mongoose'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }

  const body = await readBody(event)
  const reservationId = body?.reservationId

  if (!reservationId || !Types.ObjectId.isValid(reservationId)) {
    throw createError({ statusCode: 400, statusMessage: 'ID de reserva inválido' })
  }

  const reservation = await Reservation.findById(reservationId) as IReservation | null
  if (!reservation) {
    throw createError({ statusCode: 404, statusMessage: 'Reserva no encontrada' })
  }

  if (reservation.userId.toString() !== session.id && !session.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'No autorizado' })
  }

  if (reservation.status === 'paid') {
    return { ok: true, message: 'La reserva ya estaba pagada' }
  }

  const cartItems = reservation.cart || []
  if (cartItems.length > 0) {
    const menuItems = await MenuItem.find({
      _id: { $in: cartItems.map((ci: ICartItem) => ci.menuItemId) }
    }).lean<IMenuItem[]>()

    const menuMap = new Map<string, IMenuItem>(menuItems.map((m: IMenuItem) => [m._id.toString(), m]))

    const recipeIds = menuItems.flatMap((m: IMenuItem) => m.recipe?.map((r: IMenuItemRecipe) => r.ingredientId.toString()) || [])
    const recipes = await Recipe.find({
      _id: { $in: recipeIds }
    }).lean<IRecipe[]>()
    const recipeMap = new Map<string, IRecipe>(recipes.map((r: IRecipe) => [r._id.toString(), r]))

    const ingredientDeltas = new Map<string, number>()

    for (const cartItem of cartItems) {
      const menuObj = menuMap.get(cartItem.menuItemId.toString())
      if (!menuObj) continue

      for (const reqRecipe of (menuObj.recipe || [])) {
        const recipeObj = recipeMap.get(reqRecipe.ingredientId.toString())
        if (!recipeObj) continue

        const qtyNeededOfRecipe = reqRecipe.qty * cartItem.qty

        for (const reqIng of (recipeObj.ingredients || [])) {
          const ingIdStr = reqIng.ingredientId.toString()
          const totalIngNeeded = reqIng.qtyRatio * qtyNeededOfRecipe
          ingredientDeltas.set(ingIdStr, (ingredientDeltas.get(ingIdStr) || 0) + totalIngNeeded)
        }
      }
    }

    if (ingredientDeltas.size > 0) {
      const ingIds = Array.from(ingredientDeltas.keys())
      const ingredients = await Ingredient.find({ _id: { $in: ingIds } })
      
      for (const ing of ingredients) {
        const needed = ingredientDeltas.get(ing._id.toString()) || 0
        if (ing.stockBase < needed) {
          throw createError({ 
            statusCode: 400, 
            statusMessage: `Stock insuficiente de ${ing.nombre}. Se necesitan ${needed}, hay ${ing.stockBase}.` 
          })
        }
      }

      for (const ing of ingredients) {
        const needed = ingredientDeltas.get(ing._id.toString()) || 0
        ing.stockBase -= needed
        await ing.save()

        await InventoryLog.create({
          ingredientId: ing._id,
          type: 'OUT',
          qty: needed,
          unit: ing.unidadBase,
          cost: 0,
          reason: `Venta POS - Reserva ${reservation._id}`,
          userId: session.id
        })
      }
    }
  }

  reservation.status = 'paid'
  reservation.expiresAt = undefined
  await reservation.save()

  return { ok: true, message: 'Pago confirmado exitosamente' }
})
