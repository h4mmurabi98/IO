import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import type { LeaderboardEntry } from '../types'
import styles from './LeaderboardPage.module.css'

type Scope = 'country' | 'state' | 'district' | 'neighborhood' | 'friends'

const SCOPE_LABELS: Record<Scope, string> = {
  country:      'Deutschland',
  state:        'Bundesland',
  district:     'Bezirk',
  neighborhood: 'Nachbarschaft',
  friends:      'Freunde',
}

function LeaderboardPage() {
  const [entries, setEntries]   = useState<LeaderboardEntry[]>([])
  const [scope, setScope]       = useState<Scope>('country')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/users/leaderboard?scope=${scope}`)
      .then((data: LeaderboardEntry[]) => setEntries(data))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [scope])

  // Podium: Platz 1, 2, 3
  const top3    = entries.slice(0, 3)
  const rest    = entries.slice(3)
  const first   = top3[0]
  const second  = top3[1]
  const third   = top3[2]

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Rangliste</h1>

      {/* Scope-Filter */}
      <div className={styles.scopes}>
        {(Object.keys(SCOPE_LABELS) as Scope[]).map(s => (
          <button
            key={s}
            className={`${styles.scopeBtn} ${scope === s ? styles.scopeBtnActive : ''}`}
            onClick={() => setScope(s)}
          >
            {SCOPE_LABELS[s]}
          </button>
        ))}
      </div>

      {loading && <p className={styles.loading}>Lädt…</p>}

      {!loading && entries.length === 0 && (
        <p className={styles.empty}>Keine Einträge für diesen Bereich.</p>
      )}

      {!loading && entries.length > 0 && (
        <>
          {/* Podium: Reihenfolge 2 – 1 – 3 */}
          <div className={styles.podium}>
            {[second, first, third].map((entry, i) => {
              if (!entry) return <div key={i} style={{ flex: 1, maxWidth: 180 }} />
              const place   = i === 0 ? 2 : i === 1 ? 1 : 3
              const rankCls = place === 1 ? styles.rank1 : place === 2 ? styles.rank2 : styles.rank3
              const baseCls = place === 1 ? styles.base1 : place === 2 ? styles.base2 : styles.base3
              return (
                <div key={entry.id} className={styles.podiumSpot}>
                  <Link to={`/users/${entry.id}`} className={styles.podiumLink}>
                    <div className={styles.podiumCard}>
                      <div className={`${styles.podiumRank} ${rankCls}`}>
                        {place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉'}
                      </div>
                      <p className={styles.podiumUsername}>{entry.username}</p>
                      <p className={styles.podiumPoints}>⚡ {entry.points}</p>
                      <p className={styles.podiumLevel}>LVL {entry.level}</p>
                    </div>
                  </Link>
                  <div className={`${styles.podiumBase} ${baseCls}`} />
                </div>
              )
            })}
          </div>

          {/* Plätze 4–10 */}
          {rest.length > 0 && (
            <div className={styles.list}>
              {rest.map((entry, i) => (
                <Link key={entry.id} to={`/users/${entry.id}`} className={styles.listRowLink}>
                  <div className={styles.listRow}>
                    <span className={styles.listRank}>{i + 4}</span>
                    <span className={styles.listUsername}>{entry.username}</span>
                    <span className={styles.listLevel}>LVL {entry.level}</span>
                    <span className={styles.listPoints}>⚡ {entry.points}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default LeaderboardPage
