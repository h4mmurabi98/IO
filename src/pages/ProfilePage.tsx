import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { UserProfile } from '../types'
import styles from './ProfilePage.module.css'

function ProfilePage() {
  const [profile, setProfile]     = useState<UserProfile | null>(null)
  const [loading, setLoading]     = useState(true)
  const [bio, setBio]             = useState('')
  const [isActive, setIsActive]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [savedMsg, setSavedMsg]   = useState('')

  useEffect(() => {
    api.get('/auth/me')
      .then((data: UserProfile) => {
        setProfile(data)
      })
      .catch(() => {/* Fehler ignorieren */})
      .finally(() => setLoading(false))
  }, [])

  const handleSaveSupporter = async () => {
    setSaving(true)
    setSavedMsg('')
    try {
      await api.put('/users/supporter-entry', { bio, isActive })
      setSavedMsg('Gespeichert!')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch {/* ignorieren */}
    finally { setSaving(false) }
  }

  if (loading) return <div className={styles.loading}>Lädt…</div>
  if (!profile) return <div className={styles.loading}>Profil nicht gefunden</div>

  const initial = profile.username.charAt(0).toUpperCase()
  const memberDate = new Date(profile.createdAt).toLocaleDateString('de-DE', {
    year: 'numeric', month: 'long',
  })

  return (
    <div className={styles.page}>
      {/* Profilkopf */}
      <div className={styles.header}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.headerInfo}>
          <h1 className={styles.username}>{profile.username}</h1>
          <div className={styles.headerMeta}>
            <span className={styles.level}>LVL {profile.level}</span>
            <span className={styles.points}>⚡ {profile.points}</span>
            <span className={styles.memberSince}>Dabei seit {memberDate}</span>
          </div>
          {profile.badges.length > 0 && (
            <div className={styles.badges}>
              {profile.badges.map(b => (
                <span key={b} className={styles.badge}>🏅 {b}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistiken */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Als Seeker</p>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Gesuche erstellt</span>
            <span className={styles.statValue}>{profile.seekerStats.tasksCreated}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Davon abgeschlossen</span>
            <span className={styles.statValue}>{profile.seekerStats.tasksCompleted}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Ø Schwierigkeit</span>
            <span className={styles.statValue}>
              {profile.seekerStats.avgDifficulty > 0
                ? `${profile.seekerStats.avgDifficulty} / 5`
                : '–'}
            </span>
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>Als Supporter</p>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Gesuche angenommen</span>
            <span className={styles.statValue}>{profile.supporterStats.tasksAccepted}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Davon abgeschlossen</span>
            <span className={styles.statValue}>{profile.supporterStats.tasksCompleted}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Verdiente Punkte</span>
            <span className={`${styles.statValue} ${styles.statValueAccent}`}>
              ⚡ {profile.supporterStats.pointsEarned}
            </span>
          </div>
        </div>
      </div>

      {/* Supporter-Eintrag verwalten */}
      <div className={styles.supporterSection}>
        <div className={styles.supporterCard}>
          <p className={styles.cardTitle}>Supporter-Eintrag</p>
          <div className={styles.supporterForm}>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Beschreibe kurz, womit du helfen kannst…"
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              In Supporter-Liste anzeigen
            </label>
            <button className={styles.saveBtn} onClick={handleSaveSupporter} disabled={saving}>
              {saving ? 'Wird gespeichert…' : 'Speichern'}
            </button>
            {savedMsg && <span className={styles.successMsg}>{savedMsg}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
