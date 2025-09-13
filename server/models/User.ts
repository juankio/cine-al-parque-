import pkg from 'mongoose'
const { Schema, model, models } = pkg

const UserSchema = new Schema({
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
}, { timestamps: true })

UserSchema.index({ email: 1 }, { unique: true })



export const User = models.User || model('User', UserSchema)
