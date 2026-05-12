import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI as string
    await mongoose.connect(uri)
    console.log('MongoDB verbunden')
  } catch (err) {
    console.error('DB-Verbindung fehlgeschlagen:', err)
    process.exit(1)
  }
}

export default connectDB
