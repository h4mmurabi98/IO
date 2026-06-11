import mongoose, { Document, Schema } from 'mongoose'

export type TaskCategory =
  | 'Geistig'
  | 'Körperlich'
  | 'Talent & Kreativität'
  | 'Sozial & Kommunikation'

export type TaskStatus = 'open' | 'assigned' | 'done'

export interface ITask extends Document {
  title:              string
  description:        string
  categories:         TaskCategory[]
  createdBy:          mongoose.Types.ObjectId
  assignedTo:         mongoose.Types.ObjectId | null
  invitedSupporters:  mongoose.Types.ObjectId[]
  status:             TaskStatus
  difficulty:         number
  durationMinutes:    number
  pointValue:         number
  location?:          string
  completedAt:        Date | null
  createdAt:          Date
}

const CATEGORIES: TaskCategory[] = [
  'Geistig',
  'Körperlich',
  'Talent & Kreativität',
  'Sozial & Kommunikation',
]

const taskSchema = new Schema<ITask>(
  {
    title:             { type: String, required: true, trim: true },
    description:       { type: String, required: true },
    categories:        { type: [String], enum: CATEGORIES, required: true },
    createdBy:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo:        { type: Schema.Types.ObjectId, ref: 'User', default: null },
    invitedSupporters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status:            { type: String, enum: ['open', 'assigned', 'done'], default: 'open' },
    difficulty:        { type: Number, required: true, min: 1, max: 5 },
    durationMinutes:   { type: Number, required: true, min: 1 },
    pointValue:        { type: Number },
    location:          { type: String, trim: true },
    completedAt:       { type: Date, default: null },
  },
  { timestamps: true }
)

// pointValue automatisch berechnen
taskSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('difficulty') || this.isModified('durationMinutes')) {
    this.pointValue = this.difficulty * this.durationMinutes
  }
  next()
})

export default mongoose.model<ITask>('Task', taskSchema)
