import { Router, Response } from 'express'
import mongoose from 'mongoose'
import User from '../models/User'
import auth, { AuthRequest } from '../middleware/auth'

const router = Router()
router.use(auth)

// GET /api/users/leaderboard – Top 10 nach Scope gefiltert
router.get('/leaderboard', async (req: AuthRequest, res: Response) => {
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
    // scope === 'country' → kein zusätzlicher Filter

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

// POST /api/users/friends/:id – Freund hinzufügen
router.post('/friends/:id', async (req: AuthRequest, res: Response) => {
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

// DELETE /api/users/friends/:id – Freund entfernen
router.delete('/friends/:id', async (req: AuthRequest, res: Response) => {
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

export default router
