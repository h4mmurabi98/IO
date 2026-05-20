import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import TaskCard from '../components/TaskCard'
import { TASK_CATEGORIES } from '../types'
import type { Task, TaskCategory } from '../types'
import styles from './TasksPage.module.css'

function TasksPage() {
  const [tasks, setTasks]               = useState<Task[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [activeFilters, setActiveFilters] = useState<TaskCategory[]>([])

  useEffect(() => {
    loadTasks()
  }, [activeFilters])

  const loadTasks = async () => {
    setLoading(true)
    setError('')
    try {
      const query = activeFilters.length > 0
        ? `?categories=${activeFilters.join(',')}`
        : ''
      const data: Task[] = await api.get(`/tasks${query}`)
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  const toggleFilter = (cat: TaskCategory) => {
    setActiveFilters(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Aufgaben</h1>
        <Link to="/tasks/new" className={styles.newBtn}>+ Neue Aufgabe</Link>
      </div>

      <div className={styles.filters}>
        {TASK_CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.filterChip} ${activeFilters.includes(cat) ? styles.filterChipActive : ''}`}
            onClick={() => toggleFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p className={styles.loading}>Lädt…</p>}
      {error   && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {tasks.length === 0 ? (
            <p className={styles.empty}>Keine offenen Aufgaben gefunden.</p>
          ) : (
            tasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      )}
    </div>
  )
}

export default TasksPage
