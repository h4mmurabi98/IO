import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import type { SupporterEntry } from '../types'
import styles from './SupportersPage.module.css'

function SupportersPage() {
  const [supporters, setSupporters] = useState<SupporterEntry[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    api.get('/users/supporters')
      .then((data: SupporterEntry[]) => setSupporters(data))
      .catch(() => setSupporters([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Supporter</h1>
        <p className={styles.subtitle}>Personen, die aktiv helfen möchten</p>
      </div>

      {loading && <p className={styles.loading}>Lädt…</p>}

      {!loading && (
        <div className={styles.grid}>
          {supporters.length === 0 ? (
            <p className={styles.empty}>Noch keine Supporter eingetragen.</p>
          ) : (
            supporters.map(s => (
              <div key={s.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>
                    {s.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={styles.cardName}>{s.username}</p>
                    <div className={styles.cardMeta}>
                      <span className={styles.level}>LVL {s.level}</span>
                      <span className={styles.points}>⚡ {s.points}</span>
                    </div>
                  </div>
                </div>
                {s.supporterEntry.bio && (
                  <p className={styles.bio}>{s.supporterEntry.bio}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default SupportersPage
