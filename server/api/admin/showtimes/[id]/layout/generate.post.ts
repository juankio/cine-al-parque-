import { connectDB } from '@/server/utils/mongoose'
import { Showtime } from '@/server/models/Showtime'
import { SeatLayout, type ISeatLayout } from '@/server/models/SeatLayout'
import { readSession } from '@/server/utils/session'
import pkg from 'mongoose'
const { Types } = pkg

export default defineEventHandler(async (event) => {
  await connectDB()
  const session = await readSession(event)
  if (!session || !session.isAdmin) throw createError({ statusCode: 403 })

  const showtimeId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!Types.ObjectId.isValid(showtimeId || '')) {
    throw createError({ statusCode: 400, statusMessage: 'ID inválido' })
  }

  const showtime = await Showtime.findById(showtimeId)
  if (!showtime) throw createError({ statusCode: 404 })

  await SeatLayout.deleteMany({ showtimeId })

  const layoutType = body.type || 'traditional'
  const rows = Number(body.rows) || 10
  const cols = Number(body.cols) || 12

  const seats = []

  if (layoutType === 'traditional') {
    for (let r = 0; r < rows; r++) {
      const rowChar = String.fromCharCode(65 + r)
      for (let c = 1; c <= cols; c++) {
        seats.push({
          seatKey: `${rowChar}${c}`,
          label: `${rowChar}${c}`,
          type: 'regular',
          x: c,
          y: r + 1,
          status: 'available'
        })
      }
    }
  } else if (layoutType === 'picnic') {
    let seatCounter = 1
    const totalTables = Math.ceil((rows * cols) / 4)
    for (let i = 1; i <= totalTables; i++) {
      const gridCols = Math.ceil(Math.sqrt(totalTables))
      const gridR = Math.floor((i - 1) / gridCols) + 1
      const gridC = ((i - 1) % gridCols) + 1

      for (let s = 1; s <= 4; s++) {
        const xOffset = s === 1 || s === 3 ? -0.5 : 0.5
        const yOffset = s === 1 || s === 2 ? -0.5 : 0.5
        seats.push({
          seatKey: `M${i}-${String.fromCharCode(64 + s)}`,
          label: `M${i}-${String.fromCharCode(64 + s)}`,
          type: 'table',
          x: gridC * 3 + xOffset,
          y: gridR * 3 + yOffset,
          status: 'available',
          metadata: { tableNumber: i, chairPos: s }
        })
      }
    }
  }

  const layout = await SeatLayout.create({
    showtimeId: showtime._id,
    seats
  }) as ISeatLayout

  return layout
})
