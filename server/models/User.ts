import pkg from 'mongoose'
const { Schema, model, models } = pkg
import type { Document, Model } from 'mongoose'

export interface IUser extends Document {
  email: string
  name: string
  passwordHash?: string | null
  googleId?: string
  picture?: string
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: false },
    googleId: { type: String, required: false },
    picture: { type: String, required: false },
    isAdmin: { type: Boolean, default: false },
}, { timestamps: true })

UserSchema.index({ email: 1 }, { unique: true })

export const User = (models.User || model<IUser>('User', UserSchema)) as Model<IUser>
