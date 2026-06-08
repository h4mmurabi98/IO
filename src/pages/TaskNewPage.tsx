import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { TASK_CATEGORIES } from '../types'
import type { TaskCategory, SupporterEntry } from '../types'
import styles from './TaskNewPage.module.css'

function TaskNewPage() {
  const navigate = useNavigate()

  const [title, setTitle]               = useState('')
  const [description, setDescription]   = useState('')
  const [categories, setCategories]     = useState<TaskCategory[]>([])
  const [difficulty, setDifficulty]     = useState(0)
  const [durationMinutes, setDuration]  = useState('')
  const [location, setLocation]         = useState('')
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)

  // Supporter-Einladung
  const [supporters, setSupporters]     = useState<SupporterEntry[]>([])
  const [invited, setInvited]           = useState<string[]>([])

  useEffect(() => {
    api.get('/users/supporters')
      .then((data: SupporterEntry[]) => setSupporters(data))
      .catch(() => setSupporters([]))
  }, [])

  const toggleCategory = (cat: TaskCategory) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const toggleInvite = (id: string) => {
    setInvited(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const previewPoints = difficulty > 0 && Number(durationMinutes) > 0
    ? difficulty * Number(durationMinutes)
    : null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (categories.length === 0) {
      setError('Bitte mindestens eine Kategorie auswählen')
      return
    }
    if (difficulty === 0) {
      setError('Bitte eine Schwierigkeit auswählen')
      return
    }

    setLoading(true)
    try {
      await api.post('/tasks', {
        title,
        description,
        categories,
        difficulty,
        durationMinutes: Number(durationMinutes),
        location: location.trim() || undefined,
        invitedSupporters: invited,
      })
      navigate('/tasks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Neues Hilfegesuch erstellen</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="title">Titel</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Kurze Beschreibung des Hilfegesuchs"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Beschreibung</label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Was genau wird benötigt? Wo, wann, wie?"
          />
        </div>

        <div className={styles.field}>
          <label>Kategorien</label>
          <div className={styles.categories}>
            {TASK_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`${styles.catChip} ${categories.includes(cat) ? styles.catChipActive : ''}`}
                onClick={() => toggleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label>Schwierigkeit</label>
          <div className={styles.difficultyBtns}>
            {[1, 2, 3, 4, 5].map(d => (
              <button
                key={d}
                type="button"
                className={`${styles.diffBtn} ${difficulty === d ? styles.diffBtnActive : ''}`}
                onClick={() => setDifficulty(d)}
                title={`Schwierigkeit ${d}`}
              >
                {'★'.repeat(d)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="duration">Geschätzte Dauer (Minuten)</label>
          <input
            id="duration"
            type="number"
            value={durationMinutes}
            onChange={e => setDuration(e.target.value)}
            required
            min={1}
            placeholder="z.B. 60"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="location">Ort (optional)</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="z.B. Berlin-Mitte"
          />
        </div>

        {/* Supporter einladen */}
        {supporters.length > 0 && (
          <div className={styles.field}>
            <label>
              Supporter direkt einladen
              <span className={styles.labelHint}> — bis zu 3, optional</span>
            </label>
            <p className={styles.fieldHint}>
              Eingeladene Supporter werden beim Hilfegesuch besonders hervorgehoben.
            </p>
            <div className={styles.supporterList}>
              {supporters.map(s => {
                const isSelected = invited.includes(s.id)
                const isDisabled = !isSelected && invited.length >= 3
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.supporterChip} ${isSelected ? styles.supporterChipActive : ''} ${isDisabled ? styles.supporterChipDisabled : ''}`}
                    onClick={() => !isDisabled && toggleInvite(s.id)}
                  >
                    <span className={styles.chipName}>{s.username}</span>
                    <span className={styles.chipLevel}>LVL {s.level}</span>
                    {isSelected && <span className={styles.chipCheck}>✓</span>}
                  </button>
                )
              })}
            </div>
            {invited.length > 0 && (
              <p className={styles.invitedNote}>
                {invited.length} Supporter eingeladen
              </p>
            )}
          </div>
        )}

        {previewPoints !== null && (
          <div className={styles.preview}>
            Punktwert: <span className={styles.previewPoints}>⚡ {previewPoints}</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
              ({difficulty} × {durationMinutes} Min.)
            </span>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? 'Wird gespeichert…' : 'Hilfegesuch erstellen'}
        </button>
      </form>
    </div>
  )
}

export default TaskNewPage
