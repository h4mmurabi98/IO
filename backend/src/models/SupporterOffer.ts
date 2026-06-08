import mongoose, { Document, Schema } from 'mongoose'
import type { TaskCategory } from './Task'

export interface ISupporterOffer extends Document {
  title:      string
  description: string
  createdBy:  mongoose.Types.ObjectId
  categories: TaskCategory[]
  location:   string
  status:     'active' | 'done'
  createdAt:  Date
}

const CATEGORIES: TaskCategory[] = [
  'Geistig', 'Körperlich', 'Haushalt & Handwerk',
  'Digital & Technik', 'Talent & Kreativität', 'Sozial & Kommunikation',
]

const supporterOfferSchema = new Schema<ISupporterOffer>(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    createdBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    categories:  { type: [String], enum: CATEGORIES, default: [] },
    location:    { type: String, default: '' },
    status:      { type: String, enum: ['active', 'done'], default: 'active' },
  },
  { timestamps: true }
)

export default mongoose.model<ISupporterOffer>('SupporterOffer', supporterOfferSchema)
