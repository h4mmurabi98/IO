import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import Task from '../models/Task'
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

// GET /api/auth/me – eigenes Profil mit Rollen-Stats abrufen (geschützt)
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }

    // Seeker-Stats: Tasks die ich erstellt habe
    const seekerTasks = await Task.find({ createdBy: req.userId })
    const seekerCompleted = seekerTasks.filter(t => t.status === 'done')
    const avgDifficulty =
      seekerTasks.length > 0
        ? seekerTasks.reduce((sum, t) => sum + t.difficulty, 0) / seekerTasks.length
        : 0

    // Supporter-Stats: Tasks die ich angenommen habe
    const supporterTasks    = await Task.find({ assignedTo: req.userId })
    const supporterCompleted = supporterTasks.filter(t => t.status === 'done')
    const totalPointsEarned  = supporterCompleted.reduce((sum, t) => sum + t.pointValue, 0)

    res.json({
      id:        String(user._id),
      username:  user.username,
      email:     user.email,
      fullName:  user.fullName,
      avatar:    user.avatar,
      points:    user.points,
      level:     user.level,
      badges:    user.badges,
      location:  user.location,
      createdAt: user.createdAt,
      seekerStats: {
        tasksCreated:   seekerTasks.length,
        tasksCompleted: seekerCompleted.length,
        avgDifficulty:  Math.round(avgDifficulty * 10) / 10,
      },
      supporterStats: {
        tasksAccepted:  supporterTasks.length,
        tasksCompleted: supporterCompleted.length,
        pointsEarned:   totalPointsEarned,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// PUT /api/auth/profile – Profil aktualisieren (fullName, avatar)
router.put('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, avatar } = req.body

    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }

    if (typeof fullName === 'string') user.fullName = fullName.trim()
    // Avatar als base64 Data-URL – max. ~400KB (um MongoDB-Limits zu vermeiden)
    if (typeof avatar === 'string') {
      if (avatar.length > 550_000) {
        res.status(400).json({ message: 'Bild zu groß (max. 400 KB)' })
        return
      }
      user.avatar = avatar
    }

    await user.save()
    res.json({ message: 'Profil aktualisiert', fullName: user.fullName, avatar: user.avatar })
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

export default router
