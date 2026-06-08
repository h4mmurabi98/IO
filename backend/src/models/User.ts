import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

interface ILocation {
  country?:      string
  state?:        string
  district?:     string
  neighborhood?: string
}

interface ISupporterEntry {
  bio:      string
  isActive: boolean
}

export interface IUser extends Document {
  username:       string
  email:          string
  password:       string
  fullName:       string
  avatar:         string
  points:         number
  level:          number
  badges:         string[]
  friends:        mongoose.Types.ObjectId[]
  location:       ILocation
  supporterEntry: ISupporterEntry | null
  createdAt:      Date
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    fullName: { type: String, default: '' },
    avatar:   { type: String, default: '' },
    points:   { type: Number, default: 0 },
    level:    { type: Number, default: 0, max: 100 },
    badges:   { type: [String], default: [] },
    friends:  [{ type: Schema.Types.ObjectId, ref: 'User' }],
    location: {
      country:      { type: String },
      state:        { type: String },
      district:     { type: String },
      neighborhood: { type: String },
    },
    supporterEntry: {
      type: new Schema({ bio: String, isActive: Boolean }, { _id: false }),
      default: null,
    },
  },
  { timestamps: true }
)

// Passwort hashen vor dem Speichern
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  // Punkte dürfen nie negativ werden
  if (this.points < 0) this.points = 0
  next()
})

userSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.model<IUser>('User', userSchema)
