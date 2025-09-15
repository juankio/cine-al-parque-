import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const OrderItemSchema = new Schema({
    reservationId: { type: Types.ObjectId, ref: 'Reservation', required: true },
    menuItemId: { type: Types.ObjectId, ref: 'MenuItem', required: true },
    nombre: { type: String, required: true }, // se “congela” el nombre
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }  // precio unitario al momento de la venta
}, { timestamps: true })

OrderItemSchema.index({ reservationId: 1 })

export const OrderItem = models.OrderItem || model('OrderItem', OrderItemSchema)
