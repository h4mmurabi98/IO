import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  points: number
  level: number
  badges: string[]
  createdAt: Date
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    points:   { type: Number, default: 0, min: 0 },
    level:    { type: Number, default: 1 },
    badges:   { type: [String], default: [] },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model<IUser>('User', userSchema)
