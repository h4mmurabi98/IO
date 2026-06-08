import { useState, useEffect, useRef } from 'react'
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

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function TaskDetailPage() {
  const { id }                       = useParams<{ id: string }>()
  const { user, refreshUser }        = useAuth()
  const [task, setTask]              = useState<Task | null>(null)
  const [loading, setLoading]        = useState(true)
  const [error, setError]            = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [completionInfo, setCompletionInfo] = useState<{ pointsEarned: number; newLevel: number } | null>(null)

  // Timer-State: gespeichert in localStorage damit er Seitenreloads überlebt
  const storageKey = `task-started-${id}`
  const [startTime, setStartTime] = useState<number | null>(() => {
    const stored = localStorage.getItem(storageKey)
    return stored ? Number(stored) : null
  })
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    loadTask()
  }, [id])

  // Timer läuft solange startTime gesetzt ist
  useEffect(() => {
    if (!startTime) return
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000))
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTime])

  const loadTask = async () => {
    setLoading(true)
    try {
      const data: Task = await api.get(`/tasks/${id}`)
      setTask(data)
    } catch {
      setError('Hilfegesuch konnte nicht geladen werden')
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

  const handleStart = () => {
    const now = Date.now()
    localStorage.setItem(storageKey, String(now))
    setStartTime(now)
  }

  const handleComplete = async () => {
    if (!task) return
    setActionLoading(true)
    setError('')
    try {
      const res = await api.put(`/tasks/${task.id}/complete`, {})
      setTask(res.task)
      localStorage.removeItem(storageKey)
      if (timerRef.current) clearInterval(timerRef.current)
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
  if (!task)   return <div className={styles.loading}>{error || 'Hilfegesuch nicht gefunden'}</div>

  const isCreator   = user?.id === task.createdBy
  const isAssignee  = user?.id === task.assignedTo
  const isInvited   = user ? (task.invitedSupporters ?? []).includes(user.id) : false

  // Timer ist "fertig" wenn mindestens 80% der geschätzten Zeit verstrichen ist
  const estimatedSeconds  = (task.durationMinutes ?? 0) * 60
  const timerDone         = startTime !== null && elapsed >= Math.max(estimatedSeconds * 0.8, 60)
  const remainingSeconds  = Math.max(0, estimatedSeconds - elapsed)

  const statusClass =
    task.status === 'open'     ? styles.statusOpen :
    task.status === 'assigned' ? styles.statusAssigned :
    styles.statusDone

  return (
    <div className={styles.page}>
      <Link to="/tasks" className={styles.back}>← Zurück zu Hilfegesuchen</Link>

      {isInvited && task.status === 'open' && (
        <div className={styles.invitedBanner}>
          ✉ Du wurdest persönlich für dieses Hilfegesuch eingeladen
        </div>
      )}

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
          {/* Offenes Hilfegesuch annehmen */}
          {task.status === 'open' && !isCreator && (
            <button
              className={styles.btnPrimary}
              onClick={handleAssign}
              disabled={actionLoading}
            >
              {actionLoading ? 'Wird angenommen…' : 'Hilfegesuch annehmen'}
            </button>
          )}

          {/* Zugewiesenes Hilfegesuch: Supporter sieht Beginnen-Button */}
          {task.status === 'assigned' && isAssignee && !startTime && !completionInfo && (
            <button className={styles.btnPrimary} onClick={handleStart}>
              Hilfe beginnen
            </button>
          )}

          {/* Timer läuft: Countdown + Abschließen wenn Zeit fast um */}
          {task.status === 'assigned' && isAssignee && startTime !== null && !completionInfo && (
            <div className={styles.timerBlock}>
              <div className={styles.timerRow}>
                <span className={styles.timerLabel}>Laufzeit</span>
                <span className={styles.timerValue}>{formatElapsed(elapsed)}</span>
              </div>
              {!timerDone && (
                <p className={styles.timerHint}>
                  Noch ca. {Math.ceil(remainingSeconds / 60)} Min. verbleibend
                </p>
              )}
              <button
                className={styles.btnSuccess}
                onClick={handleComplete}
                disabled={actionLoading || !timerDone}
              >
                {actionLoading
                  ? 'Wird abgeschlossen…'
                  : timerDone
                    ? 'Hilfe abschließen'
                    : 'Bitte warte bis die Zeit abgelaufen ist'}
              </button>
            </div>
          )}

          {/* Ersteller kann immer abschließen wenn assigned */}
          {task.status === 'assigned' && isCreator && !isAssignee && !completionInfo && (
            <button
              className={styles.btnSuccess}
              onClick={handleComplete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Wird abgeschlossen…' : 'Als erledigt markieren'}
            </button>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {completionInfo && (
          <div className={styles.successBox}>
            <p className={styles.successTitle}>Hilfe erfolgreich abgeschlossen!</p>
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
