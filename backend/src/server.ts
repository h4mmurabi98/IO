import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import authRoutes from './routes/auth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' })
})

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`)
  })
})
