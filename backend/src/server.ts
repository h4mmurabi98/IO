import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import userRoutes from './routes/users'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/users', userRoutes)

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' })
})

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`)
  })
})
