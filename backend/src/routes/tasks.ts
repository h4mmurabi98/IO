import { Router, Response } from 'express'
import mongoose from 'mongoose'
import Task, { ITask } from '../models/Task'
import auth, { AuthRequest } from '../middleware/auth'

const router = Router()
router.use(auth)

// Hilfsfunktion: MongoDB-Objekt in API-Response umwandeln
const formatTask = (task: ITask) => ({
  id:          String(task._id),
  title:       task.title,
  description: task.description,
  category:    task.category,
  createdBy:   String(task.createdBy),
  assignedTo:  task.assignedTo ? String(task.assignedTo) : null,
  status:      task.status,
  pointValue:  task.pointValue,
  location:    task.location ?? null,
  completedAt: task.completedAt,
  createdAt:   task.createdAt,
})

// GET /api/tasks – alle offenen Tasks abrufen
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ status: 'open' }).sort({ createdAt: -1 })
    res.json(tasks.map(formatTask))
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// POST /api/tasks – neuen Task erstellen
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, pointValue, location } = req.body

    const task = await Task.create({
      title,
      description,
      category,
      pointValue,
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
    task.status = 'assigned'
    await task.save()

    res.json(formatTask(task))
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

// PUT /api/tasks/:id/complete – Task abschließen
// Punkte- und Level-Logik wird in Schritt 4 ergänzt
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
    // Nur der Ersteller oder der Ausführende darf abschließen
    const isCreator  = String(task.createdBy) === req.userId
    const isAssignee = String(task.assignedTo) === req.userId
    if (!isCreator && !isAssignee) {
      res.status(403).json({ message: 'Keine Berechtigung' })
      return
    }

    task.status      = 'done'
    task.completedAt = new Date()
    await task.save()

    res.json(formatTask(task))
  } catch {
    res.status(500).json({ message: 'Serverfehler' })
  }
})

export default router
