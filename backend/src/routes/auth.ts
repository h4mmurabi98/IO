import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body

    const exists = await User.findOne({ email })
    if (exists) {
      res.status(400).json({ message: 'Email bereits vergeben' })
      return
    }

    const user = await User.create({ name, email, password })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      res.status(400).json({ message: 'Email oder Passwort falsch' })
      return
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

export default router
