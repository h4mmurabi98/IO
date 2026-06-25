import { Router, Request, Response } from 'express'
import mongoose from 'mongoose'
import User from '../models/User'
import auth, { AuthRequest } from '../middleware/auth'

const router = Router()

// Rangliste – Top 10, filterbar nach scope (country/state/district/neighborhood/friends)
router.get('/leaderboard', auth, async (req: AuthRequest, res: Response) => {
  try {
    const scope = (req.query.scope as string) || 'country'

    const currentUser = await User.findById(req.userId)
    if (!currentUser) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }

    const filter: Record<string, unknown> = {}

    if (scope === 'state') {
      filter['location.state'] = currentUser.location?.state
    } else if (scope === 'district') {
      filter['location.district'] = currentUser.location?.district
    } else if (scope === 'neighborhood') {
      filter['location.neighborhood'] = currentUser.location?.neighborhood
    } else if (scope === 'friends') {
      filter['_id'] = { $in: currentUser.friends }
    }

    const users = await User.find(filter)
      .sort({ points: -1 })
      .limit(10)
      .select('username points level')

    res.json(
      users.map(u => ({
        id:       String(u._id),
        username: u.username,
        points:   u.points,
        level:    u.level,
      }))
    )
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// Alle aktiven Supporter abrufen
router.get('/supporters', async (_req: Request, res: Response) => {
  try {
    const supporters = await User.find({ 'supporterEntry.isActive': true })
      .sort({ points: -1 })
      .select('username points level supporterEntry')

    res.json(
      supporters.map(u => ({
        id:             String(u._id),
        username:       u.username,
        points:         u.points,
        level:          u.level,
        supporterEntry: u.supporterEntry,
      }))
    )
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// Eigenen Supporter-Eintrag anlegen oder aktualisieren
router.put('/supporter-entry', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { bio, isActive } = req.body

    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }

    user.supporterEntry = { bio: bio || '', isActive: Boolean(isActive) }
    await user.save()

    res.json({ message: 'Supporter-Eintrag aktualisiert', supporterEntry: user.supporterEntry })
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// Freund hinzufügen
router.post('/friends/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const friendId = req.params.id

    if (friendId === req.userId) {
      res.status(400).json({ message: 'Du kannst dich nicht selbst als Freund hinzufügen' })
      return
    }

    const friend = await User.findById(friendId)
    if (!friend) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }

    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }

    const alreadyFriend = user.friends.some(id => String(id) === friendId)
    if (alreadyFriend) {
      res.status(400).json({ message: 'Bereits in der Freundesliste' })
      return
    }

    user.friends.push(new mongoose.Types.ObjectId(friendId))
    await user.save()

    res.json({ message: 'Freund hinzugefügt' })
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// Freund entfernen
router.delete('/friends/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const friendId = req.params.id

    const user = await User.findById(req.userId)
    if (!user) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }

    const index = user.friends.findIndex(id => String(id) === friendId)
    if (index === -1) {
      res.status(400).json({ message: 'Nicht in der Freundesliste' })
      return
    }

    user.friends.splice(index, 1)
    await user.save()

    res.json({ message: 'Freund entfernt' })
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// Öffentliches Profil – muss als letzter GET-Route stehen damit /supporters nicht kollidiert
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      res.status(404).json({ message: 'Nutzer nicht gefunden' })
      return
    }
    res.json({
      id:             String(user._id),
      username:       user.username,
      fullName:       user.fullName,
      avatar:         user.avatar,
      points:         user.points,
      level:          user.level,
      badges:         user.badges,
      location:       user.location,
      supporterEntry: user.supporterEntry,
      createdAt:      user.createdAt,
    })
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

export default router
