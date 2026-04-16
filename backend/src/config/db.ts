import mongoose from 'mongoose'

const connectDB = async () => {
  const uri = process.env.MONGODB_URI as string
  await mongoose.connect(uri)
  console.log('MongoDB verbunden')
}

export default connectDB
