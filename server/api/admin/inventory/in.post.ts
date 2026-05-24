import { connectDB } from '@/server/utils/mongoose'
import { Ingredient, type IIngredient } from '@/server/models/Ingredient'
import { InventoryLog } from '@/server/models/InventoryLog'
import { readSession } from '@/server/utils/session'

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const body = await readBody(event)
  const { ingredientId, qty, unit, cost } = body

  const ing = await Ingredient.findById(ingredientId)
  if (!ing) throw createError({ statusCode: 404, statusMessage: 'Ingrediente no encontrado' })

  // Convert unit to base unit
  let addedBaseQty = Number(qty)
  if (unit === 'kg' && ing.unidadBase === 'g') addedBaseQty *= 1000
  if (unit === 'l' && ing.unidadBase === 'ml') addedBaseQty *= 1000

  // Update average cost
  const oldTotalCost = ing.stockBase * ing.costoPromedio
  const newTotalCost = Number(cost) || 0
  const newStock = ing.stockBase + addedBaseQty
  
  const newAvgCost = newStock > 0 ? (oldTotalCost + newTotalCost) / newStock : 0

  ing.stockBase = newStock
  ing.costoPromedio = newAvgCost
  await ing.save()

  await InventoryLog.create({
    ingredientId: ing._id,
    type: 'IN',
    qty: addedBaseQty,
    unit: ing.unidadBase,
    cost: newTotalCost,
    reason: 'Manual Entry (Admin)',
    userId: session.id
  })

  return ing
})
