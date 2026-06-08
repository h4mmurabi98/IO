import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { TASK_CATEGORIES } from '../types'
import type { SupporterEntry, SupporterOffer, TaskCategory } from '../types'
import styles from './SupportersPage.module.css'

function AvatarCircle({ avatar, username, size = 40 }: { avatar?: string; username: string; size?: number }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username}
        className={styles.avatarImg}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div className={styles.avatarInitial} style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {username.charAt(0).toUpperCase()}
    </div>
  )
}

function NewOfferForm({ onCreated }: { onCreated: (offer: SupporterOffer) => void }) {
  const [title, setTitle]           = useState('')
  const [description, setDesc]      = useState('')
  const [categories, setCategories] = useState<TaskCategory[]>([])
  const [location, setLocation]     = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const toggle = (cat: TaskCategory) =>
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const offer: SupporterOffer = await api.post('/supporter-offers', { title, description, categories, location })
      onCreated(offer)
      setTitle(''); setDesc(''); setCategories([]); setLocation('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.newOfferForm} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>Neues Angebot erstellen</h3>
      <div className={styles.formField}>
        <input
          placeholder={"Titel – z.B. Ich fahre heute nach Hamburg"}
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className={styles.formInput}
        />
      </div>
      <div className={styles.formField}>
        <textarea
          placeholder="Beschreibung – wen kannst du mitnehmen? Was bringst du mit? Wann bist du verfügbar?"
          value={description}
          onChange={e => setDesc(e.target.value)}
          required
          rows={3}
          className={styles.formTextarea}
        />
      </div>
      <div className={styles.formField}>
        <div className={styles.catChips}>
          {TASK_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              className={`${styles.catChip} ${categories.includes(cat) ? styles.catChipActive : ''}`}
              onClick={() => toggle(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.formRow}>
        <input
          placeholder="Ort (optional)"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className={styles.formInput}
        />
        <button className={styles.submitBtn} type="submit" disabled={loading}>
          {loading ? 'Erstelle…' : 'Angebot posten'}
        </button>
      </div>
      {error && <p className={styles.formError}>{error}</p>}
    </form>
  )
}

function SupportersPage() {
  const { user }                    = useAuth()
  const navigate                    = useNavigate()
  const [offers, setOffers]         = useState<SupporterOffer[]>([])
  const [supporters, setSupporters] = useState<SupporterEntry[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/supporter-offers').catch(() => []),
      api.get('/users/supporters').catch(() => []),
    ]).then(([offersData, suppData]) => {
      setOffers(offersData as SupporterOffer[])
      setSupporters(suppData as SupporterEntry[])
    }).finally(() => setLoading(false))
  }, [])

  const handleOfferCreated = (offer: SupporterOffer) => {
    setOffers(prev => [offer, ...prev])
    setShowForm(false)
  }

  const handleMarkDone = async (offerId: string) => {
    try {
      await api.put(`/supporter-offers/${offerId}/done`, {})
      setOffers(prev => prev.filter(o => o.id !== offerId))
    } catch { /* ignorieren */ }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  if (loading) return <p className={styles.loading}>Lädt…</p>

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Supporter-Board</h1>
          <p className={styles.pageSubtitle}>
            Aktuelle Angebote von Supportern — Mitfahrgelegenheiten, Einkaufshilfen und mehr
          </p>
        </div>
        {user && (
          <button
            className={styles.newOfferBtn}
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? '✕ Abbrechen' : '+ Angebot erstellen'}
          </button>
        )}
        {!user && (
          <button className={styles.newOfferBtn} onClick={() => navigate('/login')}>
            Anmelden um Angebot zu erstellen
          </button>
        )}
      </div>

      {/* Formular */}
      {showForm && <NewOfferForm onCreated={handleOfferCreated} />}

      {/* Aktuelle Angebote */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Aktuelle Angebote</h2>
        {offers.length === 0 ? (
          <p className={styles.empty}>Noch keine aktiven Angebote – sei der Erste!</p>
        ) : (
          <div className={styles.offersGrid}>
            {offers.map(offer => (
              <div key={offer.id} className={styles.offerCard}>
                <div className={styles.offerTop}>
                  <Link to={`/users/${offer.createdBy.id}`} className={styles.offerAuthor}>
                    <AvatarCircle avatar={offer.createdBy.avatar} username={offer.createdBy.username} size={32} />
                    <span className={styles.offerAuthorName}>{offer.createdBy.username}</span>
                    <span className={styles.offerAuthorLevel}>LVL {offer.createdBy.level}</span>
                  </Link>
                  <span className={styles.offerDate}>{formatDate(offer.createdAt)}</span>
                </div>
                <h3 className={styles.offerTitle}>{offer.title}</h3>
                <p className={styles.offerDesc}>{offer.description}</p>
                {offer.categories.length > 0 && (
                  <div className={styles.offerChips}>
                    {offer.categories.map(c => <span key={c} className={styles.chip}>{c}</span>)}
                  </div>
                )}
                {offer.location && (
                  <p className={styles.offerLocation}>📍 {offer.location}</p>
                )}
                {user?.id === offer.createdBy.id && (
                  <button
                    className={styles.doneBtn}
                    onClick={() => handleMarkDone(offer.id)}
                  >
                    Als erledigt markieren (+30 ⚡)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Supporter-Profile */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Aktive Supporter</h2>
        {supporters.length === 0 ? (
          <p className={styles.empty}>Noch keine Supporter eingetragen.</p>
        ) : (
          <div className={styles.supportersGrid}>
            {supporters.map(s => (
              <Link key={s.id} to={`/users/${s.id}`} className={styles.supporterCard}>
                <div className={styles.supporterTop}>
                  <AvatarCircle avatar={s.avatar} username={s.username} size={44} />
                  <div>
                    <p className={styles.supporterName}>{s.username}</p>
                    <div className={styles.supporterMeta}>
                      <span className={styles.levelBadge}>LVL {s.level}</span>
                      <span className={styles.pointsBadge}>⚡ {s.points}</span>
                    </div>
                  </div>
                </div>
                {s.supporterEntry.bio && (
                  <p className={styles.supporterBio}>{s.supporterEntry.bio}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default SupportersPage
