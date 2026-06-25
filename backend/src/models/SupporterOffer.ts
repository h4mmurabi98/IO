import mongoose, { Document, Schema } from 'mongoose'

export interface ISupporterOffer extends Document {
  title:          string
  description:    string
  createdBy:      mongoose.Types.ObjectId
  assignedTo:     mongoose.Types.ObjectId | null
  acceptMessage:  string
  categories:     string[]
  location:       string
  offerDate:      Date | null
  difficulty:     number
  durationMinutes: number
  pointValue:     number
  status:         'active' | 'done'
  createdAt:      Date
}

const CATEGORIES = [
  'Geistig', 'Körperlich', 'Talent & Kreativität', 'Sozial & Kommunikation',
]

const supporterOfferSchema = new Schema<ISupporterOffer>(
  {
    title:           { type: String, required: true, trim: true },
    description:     { type: String, required: true },
    createdBy:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo:      { type: Schema.Types.ObjectId, ref: 'User', default: null },
    acceptMessage:   { type: String, default: '' },
    categories:      { type: [String], enum: CATEGORIES, default: [] },
    location:        { type: String, default: '' },
    offerDate:       { type: Date, default: null },
    difficulty:      { type: Number, required: true, min: 1, max: 5 },
    durationMinutes: { type: Number, required: true, min: 1 },
    pointValue:      { type: Number },
    status:          { type: String, enum: ['active', 'done'], default: 'active' },
  },
  { timestamps: true }
)

supporterOfferSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('difficulty') || this.isModified('durationMinutes')) {
    this.pointValue = this.difficulty * this.durationMinutes
  }
  next()
})

export default mongoose.model<ISupporterOffer>('SupporterOffer', supporterOfferSchema)
