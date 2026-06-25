import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { TASK_CATEGORIES } from '../types'
import type { SupporterEntry, SupporterOffer, TaskCategory } from '../types'
import styles from './SupportersPage.module.css'

const stars = (d: number) => '★'.repeat(d) + '☆'.repeat(5 - d)

function AvatarCircle({ avatar, username, size = 40 }: { avatar?: string; username: string; size?: number }) {
  if (avatar) {
    return (
      <img src={avatar} alt={username} className={styles.avatarImg} style={{ width: size, height: size }} />
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
  const [offerDate, setOfferDate]   = useState('')
  const [difficulty, setDifficulty] = useState(1)
  const [duration, setDuration]     = useState(30)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const toggle = (cat: TaskCategory) =>
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const offer: SupporterOffer = await api.post('/supporter-offers', {
        title, description, categories, location,
        offerDate: offerDate || undefined,
        difficulty, durationMinutes: duration,
      })
      onCreated(offer)
      setTitle(''); setDesc(''); setCategories([]); setLocation('')
      setOfferDate(''); setDifficulty(1); setDuration(30)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.newOfferForm} onSubmit={handleSubmit}>
      <h3 className={styles.formTitle}>Neues Hilfsangebot erstellen</h3>

      <div className={styles.formField}>
        <input
          placeholder="Titel – z.B. Ich fahre heute nach Hamburg"
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

      <div className={styles.formMeta}>
        <div className={styles.formMetaGroup}>
          <label className={styles.formLabel}>Schwierigkeit</label>
          <div className={styles.difficultyBtns}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                className={`${styles.diffBtn} ${difficulty >= n ? styles.diffBtnActive : ''}`}
                onClick={() => setDifficulty(n)}
              >
                ★
              </button>
            ))}
            <span className={styles.diffLabel}>{difficulty} / 5</span>
          </div>
        </div>

        <div className={styles.formMetaGroup}>
          <label className={styles.formLabel}>Dauer (Minuten)</label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={e => setDuration(Math.max(1, Number(e.target.value)))}
            className={styles.durationInput}
          />
        </div>

        <div className={styles.formMetaGroup}>
          <label className={styles.formLabel}>Punkte</label>
          <span className={styles.pointsPreview}>⚡ {difficulty * duration}</span>
        </div>
      </div>

      <div className={styles.formRow}>
        <input
          placeholder="Ort – z.B. Berlin-Mitte"
          value={location}
          onChange={e => setLocation(e.target.value)}
          required
          className={styles.formInput}
        />
        <div className={styles.formMetaGroup}>
          <label className={styles.formLabel}>Wann? (optional)</label>
          <input
            type="date"
            value={offerDate}
            onChange={e => setOfferDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
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
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [acceptMsg, setAcceptMsg]     = useState('')

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

  const handleAccept = async (offerId: string) => {
    if (!user) return
    try {
      await api.put(`/supporter-offers/${offerId}/assign`, { message: acceptMsg })
      setOffers(prev => prev.map(o =>
        o.id === offerId
          ? { ...o, assignedTo: { id: user.id, username: user.username }, acceptMessage: acceptMsg }
          : o
      ))
      setAcceptingId(null)
      setAcceptMsg('')
    } catch { /* ignorieren */ }
  }

  const handleMarkDone = async (offerId: string) => {
    try {
      await api.put(`/supporter-offers/${offerId}/done`, {})
      setOffers(prev => prev.filter(o => o.id !== offerId))
    } catch { /* ignorieren */ }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  const formatOfferDate = (iso: string) =>
    new Date(iso).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) return <p className={styles.loading}>Lädt…</p>

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Supporter-Board</h1>
          <p className={styles.pageSubtitle}>
            Aktuelle Hilfsangebote von Supportern — Mitfahrgelegenheiten, Einkaufshilfen und mehr
          </p>
        </div>
        {user ? (
          <button className={styles.newOfferBtn} onClick={() => setShowForm(v => !v)}>
            {showForm ? '✕ Abbrechen' : '+ Hilfsangebot erstellen'}
          </button>
        ) : (
          <button className={styles.newOfferBtn} onClick={() => navigate('/login')}>
            Anmelden um Angebot zu erstellen
          </button>
        )}
      </div>

      {/* Formular */}
      {showForm && <NewOfferForm onCreated={handleOfferCreated} />}

      {/* Aktuelle Hilfsangebote */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Aktuelle Hilfsangebote</h2>
        {offers.length === 0 ? (
          <p className={styles.empty}>Noch keine aktiven Hilfsangebote – sei der Erste!</p>
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

                <div className={styles.offerMeta}>
                  <span className={styles.offerDifficulty} title="Schwierigkeit">
                    {stars(offer.difficulty)}
                  </span>
                  <span className={styles.offerDuration}>{offer.durationMinutes} Min.</span>
                  <span className={styles.offerPoints}>⚡ {offer.pointValue}</span>
                  {offer.location && (
                    <span className={styles.offerLocation}>📍 {offer.location}</span>
                  )}
                </div>

                {offer.offerDate && (
                  <p className={styles.offerDateBadge}>
                    📅 {formatOfferDate(offer.offerDate)}
                  </p>
                )}

                {offer.assignedTo ? (
                  <div className={styles.assignedBlock}>
                    <p className={styles.assignedBadge}>✓ Angenommen von {offer.assignedTo.username}</p>
                    {offer.acceptMessage && (
                      <p className={styles.acceptMessageText}>„{offer.acceptMessage}"</p>
                    )}
                  </div>
                ) : user && user.id !== offer.createdBy.id ? (
                  acceptingId === offer.id ? (
                    <div className={styles.acceptForm}>
                      <textarea
                        className={styles.acceptTextarea}
                        placeholder="Was brauchst du genau? z.B. 2 Liter Milch, Äpfel…"
                        value={acceptMsg}
                        onChange={e => setAcceptMsg(e.target.value)}
                        rows={2}
                      />
                      <div className={styles.acceptActions}>
                        <button className={styles.acceptBtn} onClick={() => handleAccept(offer.id)}>
                          Bestätigen
                        </button>
                        <button className={styles.cancelBtn} onClick={() => { setAcceptingId(null); setAcceptMsg('') }}>
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className={styles.acceptBtn} onClick={() => setAcceptingId(offer.id)}>
                      Annehmen
                    </button>
                  )
                ) : null}

                {user?.id === offer.createdBy.id && (
                  <button
                    className={styles.doneBtn}
                    onClick={() => handleMarkDone(offer.id)}
                  >
                    Als erledigt markieren (+{offer.pointValue} ⚡)
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
