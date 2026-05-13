import mongoose, { Document, Schema } from 'mongoose'

export type TaskCategory = 'Einkauf' | 'Haushalt' | 'Handwerk' | 'Transport' | 'Betreuung' | 'Sonstiges'
export type TaskStatus = 'open' | 'assigned' | 'done'

export interface ITask extends Document {
  title: string
  description: string
  category: TaskCategory
  createdBy: mongoose.Types.ObjectId
  assignedTo: mongoose.Types.ObjectId | null
  status: TaskStatus
  pointValue: number
  location?: string
  completedAt: Date | null
  createdAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category:    { type: String, required: true, enum: ['Einkauf', 'Haushalt', 'Handwerk', 'Transport', 'Betreuung', 'Sonstiges'] },
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo:  { type: Schema.Types.ObjectId, ref: 'User', default: null },
    status:      { type: String, enum: ['open', 'assigned', 'done'], default: 'open' },
    pointValue:  { type: Number, required: true, min: 10, max: 100 },
    location:    { type: String, trim: true },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export default mongoose.model<ITask>('Task', taskSchema)
