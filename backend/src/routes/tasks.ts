import { Router, Response } from 'express'
import mongoose from 'mongoose'
import Task, { ITask } from '../models/Task'
import User from '../models/User'
import auth, { AuthRequest } from '../middleware/auth'
import { calcLevel } from '../utils/levels'

const router = Router()
router.use(auth)

// Hilfsfunktion: MongoDB-Objekt in API-Response umwandeln
const formatTask = (task: ITask) => ({
  id:              String(task._id),
  title:           task.title,
  description:     task.description,
  categories:      task.categories,
  createdBy:       String(task.createdBy),
  assignedTo:      task.assignedTo ? String(task.assignedTo) : null,
  status:          task.status,
  difficulty:      task.difficulty,
  durationMinutes: task.durationMinutes,
  pointValue:      task.pointValue,
  location:        task.location ?? null,
  completedAt:     task.completedAt,
  createdAt:       task.createdAt,
})

// GET /api/tasks – offene Tasks abrufen, optional nach Kategorien filtern
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, unknown> = { status: 'open' }

    // ?categories=Geistig,Körperlich → Array aufteilen und filtern
    if (req.query.categories) {
      const cats = (req.query.categories as string).split(',').map(c => c.trim())
      filter.categories = { $in: cats }
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 })
    res.json(tasks.map(formatTask))
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// POST /api/tasks – neuen Task erstellen
// pointValue wird vom Backend berechnet (difficulty * durationMinutes)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, categories, difficulty, durationMinutes, location } = req.body

    // Eingaben validieren
    if (!Array.isArray(categories) || categories.length === 0) {
      res.status(400).json({ message: 'Mindestens eine Kategorie erforderlich' })
      return
    }
    if (difficulty < 1 || difficulty > 5) {
      res.status(400).json({ message: 'Schwierigkeit muss zwischen 1 und 5 liegen' })
      return
    }
    if (durationMinutes < 1) {
      res.status(400).json({ message: 'Dauer muss mindestens 1 Minute betragen' })
      return
    }

    const task = await Task.create({
      title,
      description,
      categories,
      difficulty,
      durationMinutes,
      location,
      createdBy: req.userId,
    })

    res.status(201).json(formatTask(task))
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// GET /api/tasks/:id – einzelnen Task abrufen
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      res.status(404).json({ message: 'Task nicht gefunden' })
      return
    }
    res.json(formatTask(task))
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// PUT /api/tasks/:id/assign – Task annehmen
router.put('/:id/assign', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      res.status(404).json({ message: 'Task nicht gefunden' })
      return
    }
    if (task.status !== 'open') {
      res.status(400).json({ message: 'Task ist nicht mehr verfügbar' })
      return
    }
    if (String(task.createdBy) === req.userId) {
      res.status(400).json({ message: 'Eigene Tasks können nicht angenommen werden' })
      return
    }

    task.assignedTo = new mongoose.Types.ObjectId(req.userId)
    task.status     = 'assigned'
    await task.save()

    res.json(formatTask(task))
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// PUT /api/tasks/:id/complete – Task abschließen + Punkte & Level aktualisieren
router.put('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      res.status(404).json({ message: 'Task nicht gefunden' })
      return
    }
    if (task.status !== 'assigned') {
      res.status(400).json({ message: 'Task muss zuerst angenommen werden' })
      return
    }
    const isCreator  = String(task.createdBy) === req.userId
    const isAssignee = String(task.assignedTo) === req.userId
    if (!isCreator && !isAssignee) {
      res.status(403).json({ message: 'Keine Berechtigung' })
      return
    }

    task.status      = 'done'
    task.completedAt = new Date()
    await task.save()

    // Punkte dem Ausführenden gutschreiben und Level neu berechnen
    const user = await User.findById(task.assignedTo)
    if (user) {
      user.points += task.pointValue
      user.level   = calcLevel(user.points)
      await user.save()

      res.json({
        task:         formatTask(task),
        pointsEarned: task.pointValue,
        newPoints:    user.points,
        newLevel:     user.level,
      })
      return
    }

    res.json({ task: formatTask(task) })
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

export default router
