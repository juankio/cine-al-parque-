import pkg from 'mongoose'
const { Schema, model, models, Types } = pkg

const TableSchema = new Schema({
    showtimeId: { type: Types.ObjectId, ref: 'Showtime', required: true },
    code: { type: String, required: true },        // M1, M2, ...
    capacity: { type: Number, enum: [2, 4], required: true }
}, { timestamps: true })

TableSchema.index({ showtimeId: 1, code: 1 }, { unique: true })

export const Table = models.Table || model('Table', TableSchema)
