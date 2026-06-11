import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import type { PublicUser } from '../types'
import styles from './PublicProfilePage.module.css'

function PublicProfilePage() {
  const { id }                      = useParams<{ id: string }>()
  const navigate                    = useNavigate()
  const { user, refreshUser }       = useAuth()
  const [profile, setProfile]       = useState<PublicUser | null>(null)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [friendLoading, setFriendLoading] = useState(false)

  useEffect(() => {
    api.get(`/users/${id}`)
      .then((data: PublicUser) => setProfile(data))
      .catch(() => setError('Profil nicht gefunden'))
      .finally(() => setLoading(false))
  }, [id])

  const isFriend = !!(user && profile && user.friends.includes(profile.id))
  const isOwnProfile = user?.id === profile?.id

  const handleFriendToggle = async () => {
    if (!profile) return
    setFriendLoading(true)
    try {
      if (isFriend) {
        await api.delete(`/users/friends/${profile.id}`)
      } else {
        await api.post(`/users/friends/${profile.id}`, {})
      }
      await refreshUser()
    } catch { /* ignorieren */ } finally {
      setFriendLoading(false)
    }
  }

  if (loading) return <div className={styles.loading}>Lädt…</div>
  if (!profile || error) return (
    <div className={styles.loading}>
      {error || 'Profil nicht gefunden'}
      <br />
      <button className={styles.back} onClick={() => navigate(-1)}>← Zurück</button>
    </div>
  )

  const memberDate = new Date(profile.createdAt).toLocaleDateString('de-DE', {
    year: 'numeric', month: 'long',
  })

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>← Zurück</button>

      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.username} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarInitial}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className={styles.headerInfo}>
          <h1 className={styles.username}>{profile.username}</h1>
          {profile.fullName && <p className={styles.fullName}>{profile.fullName}</p>}
          <div className={styles.meta}>
            <span className={styles.levelBadge}>LVL {profile.level}</span>
            <span className={styles.points}>⚡ {profile.points}</span>
            <span className={styles.since}>Dabei seit {memberDate}</span>
          </div>
          {profile.badges.length > 0 && (
            <div className={styles.badges}>
              {profile.badges.map(b => <span key={b} className={styles.badge}>🏅 {b}</span>)}
            </div>
          )}
          {user && !isOwnProfile && (
            <button
              className={isFriend ? styles.friendBtnRemove : styles.friendBtnAdd}
              onClick={handleFriendToggle}
              disabled={friendLoading}
            >
              {friendLoading ? '…' : isFriend ? '✓ Freund entfernen' : '+ Als Freund hinzufügen'}
            </button>
          )}
        </div>
      </div>

      {/* Supporter-Info */}
      {profile.supporterEntry?.isActive && (
        <div className={styles.supporterCard}>
          <p className={styles.cardLabel}>Supporter-Profil</p>
          <p className={styles.bio}>{profile.supporterEntry.bio || 'Keine Beschreibung angegeben.'}</p>
        </div>
      )}

      {/* Standort */}
      {(profile.location?.state || profile.location?.district) && (
        <div className={styles.locationCard}>
          <p className={styles.cardLabel}>Standort</p>
          <p className={styles.locationText}>
            📍 {[profile.location.neighborhood, profile.location.district, profile.location.state]
                  .filter(Boolean)
                  .join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}

export default PublicProfilePage
