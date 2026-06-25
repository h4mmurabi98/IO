import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import Task from '../models/Task'
import auth, { AuthRequest } from '../middleware/auth'

const router = Router()

// Registrierung – gibt direkt einen JWT zurück
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, state } = req.body

    if (!fullName || !String(fullName).trim()) {
      res.status(400).json({ message: 'Echter Name ist erforderlich' })
      return
    }
    if (!state || !String(state).trim()) {
      res.status(400).json({ message: 'Wohnort ist erforderlich' })
      return
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] })
    if (exists) {
      res.status(400).json({ message: 'Username oder Email bereits vergeben' })
      return
    }

    const user = await User.create({
      username,
      email,
      password,
      fullName: String(fullName).trim(),
      location: { country: 'Deutschland', state: String(state).trim() },
    })
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

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Passwort-Feld ist per default ausgeblendet (select: false im Schema)
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

// Eigenes Profil abrufen inkl. Seeker- und Supporter-Statistiken
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }

    const seekerTasks = await Task.find({ createdBy: req.userId })
    const seekerCompleted = seekerTasks.filter(t => t.status === 'done')
    const avgDifficulty =
      seekerTasks.length > 0
        ? seekerTasks.reduce((sum, t) => sum + t.difficulty, 0) / seekerTasks.length
        : 0

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
      friends:   user.friends.map(id => String(id)),
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

// Profil aktualisieren – Name, Avatar, Wohnort, Email und optional Passwort
router.put('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, avatar, location, email, currentPassword, newPassword } = req.body

    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }

    if (typeof fullName === 'string') user.fullName = fullName.trim()

    if (typeof avatar === 'string') {
      if (avatar.length > 550_000) {
        res.status(400).json({ message: 'Bild zu groß (max. 400 KB)' })
        return
      }
      user.avatar = avatar
    }

    if (location && typeof location === 'object') {
      user.location = {
        country:      'Deutschland',
        state:        typeof location.state        === 'string' ? location.state.trim()        : user.location?.state,
        district:     typeof location.district     === 'string' ? location.district.trim()     : user.location?.district,
        neighborhood: typeof location.neighborhood === 'string' ? location.neighborhood.trim() : user.location?.neighborhood,
      }
    }

    if (typeof email === 'string' && email.trim() && email.trim() !== user.email) {
      const taken = await User.findOne({ email: email.trim() })
      if (taken) {
        res.status(400).json({ message: 'E-Mail bereits vergeben' })
        return
      }
      user.email = email.trim()
    }

    // Passwort nur ändern wenn currentPassword mitgeschickt wurde
    if (typeof newPassword === 'string' && newPassword) {
      if (!currentPassword) {
        res.status(400).json({ message: 'Aktuelles Passwort erforderlich' })
        return
      }
      if (newPassword.length < 6) {
        res.status(400).json({ message: 'Neues Passwort muss mindestens 6 Zeichen haben' })
        return
      }
      const userWithPw = await User.findById(req.userId).select('+password')
      if (!userWithPw || !(await userWithPw.comparePassword(currentPassword))) {
        res.status(400).json({ message: 'Aktuelles Passwort falsch' })
        return
      }
      user.password = newPassword
    }

    await user.save()
    res.json({ message: 'Profil aktualisiert' })
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

export default router
