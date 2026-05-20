export interface User {
  id: string
  username: string
  email: string
  points: number
  level: number
  badges: string[]
}

export type TaskCategory =
  | 'Geistig'
  | 'Körperlich'
  | 'Haushalt & Handwerk'
  | 'Digital & Technik'
  | 'Talent & Kreativität'
  | 'Sozial & Kommunikation'

export const TASK_CATEGORIES: TaskCategory[] = [
  'Geistig',
  'Körperlich',
  'Haushalt & Handwerk',
  'Digital & Technik',
  'Talent & Kreativität',
  'Sozial & Kommunikation',
]

export type TaskStatus = 'open' | 'assigned' | 'done'

export interface Task {
  id: string
  title: string
  description: string
  categories: TaskCategory[]
  createdBy: string
  assignedTo: string | null
  status: TaskStatus
  difficulty: number
  durationMinutes: number
  pointValue: number
  location: string | null
  completedAt: string | null
  createdAt: string
}
