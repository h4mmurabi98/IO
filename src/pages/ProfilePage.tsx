import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'
import type { UserProfile } from '../types'
import styles from './ProfilePage.module.css'

type Msg = { type: 'success' | 'error'; text: string }

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const fileRef               = useRef<HTMLInputElement>(null)

  const [fullName, setFullName]               = useState('')
  const [email, setEmail]                     = useState('')
  const [avatar, setAvatar]                   = useState('')
  const [locState, setLocState]               = useState('')
  const [locDistrict, setLocDistrict]         = useState('')
  const [locNeighborhood, setLocNeighborhood] = useState('')
  const [currentPw, setCurrentPw]             = useState('')
  const [newPw, setNewPw]                     = useState('')
  const [confirmPw, setConfirmPw]             = useState('')

  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState<Msg | null>(null)

  const [bio, setBio]           = useState('')
  const [isActive, setIsActive] = useState(false)
  const [supporterMsg, setSupporterMsg]   = useState<Msg | null>(null)
  const [savingSupporter, setSavingSupporter] = useState(false)

  useEffect(() => {
    api.get('/auth/me')
      .then((data: UserProfile) => {
        setProfile(data)
        setFullName(data.fullName ?? '')
        setEmail(data.email ?? '')
        setAvatar(data.avatar ?? '')
        setLocState(data.location?.state ?? '')
        setLocDistrict(data.location?.district ?? '')
        setLocNeighborhood(data.location?.neighborhood ?? '')
        setBio(data.supporterEntry?.bio ?? '')
        setIsActive(data.supporterEntry?.isActive ?? false)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const flash = (set: (m: Msg | null) => void, m: Msg) => {
    set(m); setTimeout(() => set(null), 4000)
  }

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 400_000) { alert('Bild zu groß. Bitte unter 400 KB wählen.'); return }
    const reader = new FileReader()
    reader.onload = ev => setAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveAll = async () => {
    const changingPw = newPw || currentPw || confirmPw
    if (changingPw) {
      if (!currentPw) { flash(setMsg, { type: 'error', text: 'Aktuelles Passwort erforderlich' }); return }
      if (!newPw)     { flash(setMsg, { type: 'error', text: 'Neues Passwort eingeben' }); return }
      if (newPw !== confirmPw) { flash(setMsg, { type: 'error', text: 'Passwörter stimmen nicht überein' }); return }
      if (newPw.length < 6)   { flash(setMsg, { type: 'error', text: 'Mindestens 6 Zeichen erforderlich' }); return }
    }
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        fullName,
        email,
        avatar,
        location: { state: locState, district: locDistrict, neighborhood: locNeighborhood },
      }
      if (changingPw) { body.currentPassword = currentPw; body.newPassword = newPw }
      await api.put('/auth/profile', body)
      setProfile(p => p ? { ...p, fullName, email, avatar } : p)
      if (changingPw) { setCurrentPw(''); setNewPw(''); setConfirmPw('') }
      flash(setMsg, { type: 'success', text: 'Gespeichert!' })
    } catch (err) {
      flash(setMsg, { type: 'error', text: err instanceof Error ? err.message : 'Fehler beim Speichern' })
    } finally { setSaving(false) }
  }

  const handleSaveSupporter = async () => {
    setSavingSupporter(true)
    try {
      await api.put('/users/supporter-entry', { bio, isActive })
      flash(setSupporterMsg, { type: 'success', text: 'Gespeichert!' })
    } catch (err) {
      flash(setSupporterMsg, { type: 'error', text: err instanceof Error ? err.message : 'Fehler' })
    } finally { setSavingSupporter(false) }
  }

  if (loading) return <div className={styles.loading}>Lädt…</div>
  if (!profile) return <div className={styles.loading}>Profil nicht gefunden</div>

  const memberDate = new Date(profile.createdAt).toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })

  return (
    <div className={styles.page}>

      {/* Profilkopf */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          {avatar
            ? <img src={avatar} alt="Avatar" className={styles.avatarImg} />
            : <div className={styles.avatarInitial}>{profile.username.charAt(0).toUpperCase()}</div>
          }
          <button className={styles.avatarEdit} onClick={() => fileRef.current?.click()} title="Bild ändern">✎</button>
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
              {profile.badges.map(b => <span key={b} className={styles.badge}>🏅 {b}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* ── Persönliche Daten (alles in einer Karte) ── */}
      <div className={styles.editCard}>
        <p className={styles.cardTitle}>Persönliche Daten</p>

        <div className={styles.editSection}>
          <p className={styles.editSectionTitle}>Name & Kontakt</p>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Echter Name</label>
            <input className={styles.editInput} type="text" value={fullName}
              onChange={e => setFullName(e.target.value)} placeholder="Vor- und Nachname" />
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>E-Mail</label>
            <input className={styles.editInput} type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="deine@email.de" />
          </div>
        </div>

        <div className={styles.editSection}>
          <p className={styles.editSectionTitle}>Wohnort</p>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Bundesland</label>
            <input className={styles.editInput} type="text" value={locState}
              onChange={e => setLocState(e.target.value)} placeholder="z.B. Berlin, Bayern" />
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Bezirk</label>
            <input className={styles.editInput} type="text" value={locDistrict}
              onChange={e => setLocDistrict(e.target.value)} placeholder="z.B. Charlottenburg, Mitte" />
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Nachbarschaft</label>
            <input className={styles.editInput} type="text" value={locNeighborhood}
              onChange={e => setLocNeighborhood(e.target.value)} placeholder="z.B. Hackescher Markt" />
          </div>
        </div>

        <div className={styles.editSection}>
          <p className={styles.editSectionTitle}>Passwort ändern</p>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Aktuelles Passwort</label>
            <input className={styles.editInput} type="password" value={currentPw}
              onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Neues Passwort</label>
            <input className={styles.editInput} type="password" value={newPw}
              onChange={e => setNewPw(e.target.value)} placeholder="Mindestens 6 Zeichen" autoComplete="new-password" />
          </div>
          <div className={styles.editField}>
            <label className={styles.editLabel}>Passwort bestätigen</label>
            <input className={styles.editInput} type="password" value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          </div>
        </div>

        <div className={styles.editActions}>
          <button className={styles.saveBtn} onClick={handleSaveAll} disabled={saving}>
            {saving ? 'Wird gespeichert…' : 'Speichern'}
          </button>
          {msg && <span className={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>{msg.text}</span>}
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
              {profile.seekerStats.avgDifficulty > 0 ? `${profile.seekerStats.avgDifficulty} / 5` : '–'}
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
            <span className={`${styles.statValue} ${styles.statValueAccent}`}>⚡ {profile.supporterStats.pointsEarned}</span>
          </div>
        </div>
      </div>

      {/* Supporter-Eintrag */}
      <div className={styles.supporterSection}>
        <div className={styles.supporterCard}>
          <p className={styles.cardTitle}>Supporter-Eintrag</p>
          <p className={styles.supporterHint}>
            Wenn aktiv, wirst du in der Supporter-Liste angezeigt und kannst Hilfegesuche annehmen.
          </p>
          <div className={styles.supporterForm}>
            <textarea className={styles.textarea} rows={3}
              placeholder="Beschreibe kurz, womit du helfen kannst…"
              value={bio} onChange={e => setBio(e.target.value)} />
            <label className={styles.toggleRow}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              In Supporter-Liste anzeigen
            </label>
            <div className={styles.editActions}>
              <button className={styles.saveBtn} onClick={handleSaveSupporter} disabled={savingSupporter}>
                {savingSupporter ? 'Wird gespeichert…' : 'Speichern'}
              </button>
              {supporterMsg && <span className={supporterMsg.type === 'success' ? styles.successMsg : styles.errorMsg}>{supporterMsg.text}</span>}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ProfilePage
