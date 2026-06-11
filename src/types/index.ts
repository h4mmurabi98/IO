export interface User {
  id:       string
  username: string
  email:    string
  fullName: string
  avatar:   string
  points:   number
  level:    number
  badges:   string[]
  friends:  string[]
}

export interface UserProfile extends User {
  location: {
    country?:      string
    state?:        string
    district?:     string
    neighborhood?: string
  }
  supporterEntry: { bio: string; isActive: boolean } | null
  createdAt: string
  seekerStats: {
    tasksCreated:   number
    tasksCompleted: number
    avgDifficulty:  number
  }
  supporterStats: {
    tasksAccepted:  number
    tasksCompleted: number
    pointsEarned:   number
  }
}

export interface PublicUser {
  id:             string
  username:       string
  fullName:       string
  avatar:         string
  points:         number
  level:          number
  badges:         string[]
  location: {
    country?:      string
    state?:        string
    district?:     string
    neighborhood?: string
  }
  supporterEntry: { bio: string; isActive: boolean } | null
  createdAt:      string
}

export type TaskCategory =
  | 'Geistig'
  | 'Körperlich'
  | 'Talent & Kreativität'
  | 'Sozial & Kommunikation'

export const TASK_CATEGORIES: TaskCategory[] = [
  'Geistig',
  'Körperlich',
  'Talent & Kreativität',
  'Sozial & Kommunikation',
]

export type TaskStatus = 'open' | 'assigned' | 'done'

export interface Task {
  id:                 string
  title:              string
  description:        string
  categories:         TaskCategory[]
  createdBy:          string
  assignedTo:         string | null
  invitedSupporters:  string[]
  status:             TaskStatus
  difficulty:         number
  durationMinutes:    number
  pointValue:         number
  location:           string | null
  completedAt:        string | null
  createdAt:          string
}

export interface LeaderboardEntry {
  id:       string
  username: string
  points:   number
  level:    number
}

export interface SupporterEntry {
  id:       string
  username: string
  fullName: string
  avatar:   string
  points:   number
  level:    number
  supporterEntry: {
    bio:      string
    isActive: boolean
  }
}

export interface SupporterOffer {
  id:          string
  title:       string
  description: string
  categories:  TaskCategory[]
  location:    string
  status:      'active' | 'done'
  createdAt:   string
  createdBy: {
    id:       string
    username: string
    level:    number
    points:   number
    avatar:   string
  }
}
