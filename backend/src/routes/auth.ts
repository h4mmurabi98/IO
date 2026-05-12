import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import auth, { AuthRequest } from '../middleware/auth'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body

    const exists = await User.findOne({ $or: [{ email }, { username }] })
    if (exists) {
      res.status(400).json({ message: 'Username oder Email bereits vergeben' })
      return
    }

    const user = await User.create({ username, email, password })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

    res.status(201).json({
      token,
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level,
        badges: user.badges,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Passwort explizit selektieren, da select:false im Schema
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      res.status(400).json({ message: 'Email oder Passwort falsch' })
      return
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })

    res.json({
      token,
      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level,
        badges: user.badges,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// GET /api/auth/me – eigenes Profil abrufen (geschützt)
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }

    res.json({
      id: String(user._id),
      username: user.username,
      email: user.email,
      points: user.points,
      level: user.level,
      badges: user.badges,
      createdAt: user.createdAt,
    })
  } catch (err) {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

export default router
