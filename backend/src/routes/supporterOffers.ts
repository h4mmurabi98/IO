import { Router, Request, Response } from 'express'
import SupporterOffer from '../models/SupporterOffer'
import User from '../models/User'
import auth, { AuthRequest } from '../middleware/auth'
import { calcLevel } from '../utils/levels'

const router = Router()

// GET /api/supporter-offers – alle aktiven Angebote (öffentlich)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const offers = await SupporterOffer.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .populate<{ createdBy: { _id: unknown; username: string; level: number; points: number; avatar: string } }>(
        'createdBy', 'username level points avatar'
      )

    res.json(
      offers.map(o => ({
        id:          String(o._id),
        title:       o.title,
        description: o.description,
        categories:  o.categories,
        location:    o.location,
        status:      o.status,
        createdAt:   o.createdAt,
        createdBy: {
          id:       String((o.createdBy as any)._id),
          username: (o.createdBy as any).username,
          level:    (o.createdBy as any).level,
          points:   (o.createdBy as any).points,
          avatar:   (o.createdBy as any).avatar,
        },
      }))
    )
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// POST /api/supporter-offers – eigenes Angebot erstellen (Auth erforderlich)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, categories, location } = req.body

    if (!title || !description) {
      res.status(400).json({ message: 'Titel und Beschreibung sind erforderlich' })
      return
    }

    const offer = await SupporterOffer.create({
      title,
      description,
      categories: Array.isArray(categories) ? categories : [],
      location:   location || '',
      createdBy:  req.userId,
    })

    await offer.populate<{ createdBy: { _id: unknown; username: string; level: number; points: number; avatar: string } }>(
      'createdBy', 'username level points avatar'
    )

    res.status(201).json({
      id:          String(offer._id),
      title:       offer.title,
      description: offer.description,
      categories:  offer.categories,
      location:    offer.location,
      status:      offer.status,
      createdAt:   offer.createdAt,
      createdBy: {
        id:       String((offer.createdBy as any)._id),
        username: (offer.createdBy as any).username,
        level:    (offer.createdBy as any).level,
        points:   (offer.createdBy as any).points,
        avatar:   (offer.createdBy as any).avatar,
      },
    })
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// PUT /api/supporter-offers/:id/done – Angebot als erledigt markieren + Punkte gutschreiben
router.put('/:id/done', auth, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await SupporterOffer.findById(req.params.id)
    if (!offer) {
      res.status(404).json({ message: 'Angebot nicht gefunden' })
      return
    }
    if (String(offer.createdBy) !== req.userId) {
      res.status(403).json({ message: 'Keine Berechtigung' })
      return
    }
    if (offer.status === 'done') {
      res.status(400).json({ message: 'Bereits abgeschlossen' })
      return
    }

    offer.status = 'done'
    await offer.save()

    // Pauschal 30 Punkte für abgeschlossenes Angebot
    const OFFER_REWARD = 30
    const user = await User.findById(req.userId)
    if (user) {
      user.points += OFFER_REWARD
      user.level   = calcLevel(user.points)
      await user.save()
      res.json({ message: 'Angebot abgeschlossen', pointsEarned: OFFER_REWARD, newPoints: user.points })
      return
    }

    res.json({ message: 'Angebot abgeschlossen' })
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// DELETE /api/supporter-offers/:id – Angebot löschen (nur eigene)
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await SupporterOffer.findById(req.params.id)
    if (!offer) {
      res.status(404).json({ message: 'Angebot nicht gefunden' })
      return
    }
    if (String(offer.createdBy) !== req.userId) {
      res.status(403).json({ message: 'Keine Berechtigung' })
      return
    }
    await offer.deleteOne()
    res.json({ message: 'Angebot gelöscht' })
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

export default router
