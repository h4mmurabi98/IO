import { useState, useEffect, useRef } from 'react'
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

  // Profil-Bearbeitung
  const [fullName, setFullName]   = useState('')
  const [avatar, setAvatar]       = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get('/auth/me')
      .then((data: UserProfile) => {
        setProfile(data)
        setBio(data.supporterEntry?.bio ?? '')
        setIsActive(data.supporterEntry?.isActive ?? false)
        setFullName(data.fullName ?? '')
        setAvatar(data.avatar ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 400_000) {
      alert('Bild zu groß. Bitte unter 400 KB wählen.')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    setSavedMsg('')
    try {
      await api.put('/auth/profile', { fullName, avatar })
      setSavedMsg('Profil gespeichert!')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch { /* ignorieren */ }
    finally { setSavingProfile(false) }
  }

  const handleSaveSupporter = async () => {
    setSaving(true)
    setSavedMsg('')
    try {
      await api.put('/users/supporter-entry', { bio, isActive })
      setSavedMsg('Gespeichert!')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch { /* ignorieren */ }
    finally { setSaving(false) }
  }

  if (loading) return <div className={styles.loading}>Lädt…</div>
  if (!profile) return <div className={styles.loading}>Profil nicht gefunden</div>

  const memberDate = new Date(profile.createdAt).toLocaleDateString('de-DE', {
    year: 'numeric', month: 'long',
  })

  return (
    <div className={styles.page}>
      {/* Profilkopf */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          {avatar ? (
            <img src={avatar} alt="Avatar" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarInitial}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          <button className={styles.avatarEdit} onClick={() => fileRef.current?.click()} title="Bild ändern">
            ✎
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarFile} />
        </div>
        <div className={styles.headerInfo}>
          <h1 className={styles.username}>{profile.username}</h1>
          {profile.fullName && <p className={styles.fullName}>{profile.fullName}</p>}
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

      {/* Profil bearbeiten */}
      <div className={styles.editSection}>
        <div className={styles.editCard}>
          <p className={styles.cardTitle}>Profil bearbeiten</p>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Echter Name (optional)</label>
            <input
              className={styles.editInput}
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Vor- und Nachname"
            />
          </div>
          <div className={styles.editActions}>
            <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Wird gespeichert…' : 'Profil speichern'}
            </button>
            {savedMsg && <span className={styles.successMsg}>{savedMsg}</span>}
          </div>
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
          <p className={styles.supporterHint}>
            Wenn aktiv, wirst du in der Supporter-Liste angezeigt und kannst Hilfegesuche annehmen.
          </p>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
