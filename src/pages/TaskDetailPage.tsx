import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { Task } from '../types'
import styles from './TaskDetailPage.module.css'

const stars = (d: number) => '★'.repeat(d) + '☆'.repeat(5 - d)

const STATUS_LABEL: Record<string, string> = {
  open:     'Offen',
  assigned: 'In Bearbeitung',
  done:     'Abgeschlossen',
}

function TaskDetailPage() {
  const { id }                       = useParams<{ id: string }>()
  const { user, refreshUser }        = useAuth()
  const [task, setTask]              = useState<Task | null>(null)
  const [loading, setLoading]        = useState(true)
  const [error, setError]            = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [completionInfo, setCompletionInfo] = useState<{ pointsEarned: number; newLevel: number } | null>(null)

  useEffect(() => {
    loadTask()
  }, [id])

  const loadTask = async () => {
    setLoading(true)
    try {
      const data: Task = await api.get(`/tasks/${id}`)
      setTask(data)
    } catch {
      setError('Aufgabe konnte nicht geladen werden')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!task) return
    setActionLoading(true)
    setError('')
    try {
      const data: Task = await api.put(`/tasks/${task.id}/assign`, {})
      setTask(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Annehmen')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!task) return
    setActionLoading(true)
    setError('')
    try {
      const res = await api.put(`/tasks/${task.id}/complete`, {})
      setTask(res.task)
      if (res.pointsEarned) {
        setCompletionInfo({ pointsEarned: res.pointsEarned, newLevel: res.newLevel })
        await refreshUser()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Abschließen')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className={styles.loading}>Lädt…</div>
  if (!task)   return <div className={styles.loading}>{error || 'Aufgabe nicht gefunden'}</div>

  const isCreator  = user?.id === task.createdBy
  const isAssignee = user?.id === task.assignedTo

  const statusClass =
    task.status === 'open'     ? styles.statusOpen :
    task.status === 'assigned' ? styles.statusAssigned :
    styles.statusDone

  return (
    <div className={styles.page}>
      <Link to="/tasks" className={styles.back}>← Zurück zu Aufgaben</Link>

      <div className={styles.card}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{task.title}</h1>
          <span className={`${styles.statusBadge} ${statusClass}`}>
            {STATUS_LABEL[task.status]}
          </span>
        </div>

        <div className={styles.categories}>
          {task.categories.map(cat => (
            <span key={cat} className={styles.chip}>{cat}</span>
          ))}
        </div>

        <p className={styles.description}>{task.description}</p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Schwierigkeit</p>
            <p className={`${styles.statValue} ${styles.statValueWarning}`}>{stars(task.difficulty)}</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Dauer</p>
            <p className={styles.statValue}>{task.durationMinutes} Min.</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statLabel}>Punktwert</p>
            <p className={`${styles.statValue} ${styles.statValueAccent}`}>⚡ {task.pointValue}</p>
          </div>
          {task.location && (
            <div className={styles.stat}>
              <p className={styles.statLabel}>Ort</p>
              <p className={styles.statValue}>{task.location}</p>
            </div>
          )}
        </div>

        {/* Aktionsbereich */}
        <div className={styles.actions}>
          {task.status === 'open' && !isCreator && (
            <button
              className={styles.btnPrimary}
              onClick={handleAssign}
              disabled={actionLoading}
            >
              {actionLoading ? 'Wird angenommen…' : 'Aufgabe annehmen'}
            </button>
          )}

          {task.status === 'assigned' && (isCreator || isAssignee) && !completionInfo && (
            <button
              className={styles.btnSuccess}
              onClick={handleComplete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Wird abgeschlossen…' : 'Aufgabe abschließen'}
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {completionInfo && (
          <div className={styles.successBox}>
            <p className={styles.successTitle}>Aufgabe abgeschlossen!</p>
            <p className={styles.successPoints}>⚡ +{completionInfo.pointsEarned} Punkte</p>
            {completionInfo.newLevel > 0 && (
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                Aktuelles Level: LVL {completionInfo.newLevel}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskDetailPage
