import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import type { Task } from '../types'
import styles from './HomePage.module.css'

function Dashboard() {
  const { user } = useAuth()
  const [recentTasks, setRecentTasks] = useState<Task[]>([])

  useEffect(() => {
    api.get('/tasks')
      .then((data: Task[]) => setRecentTasks(data.slice(0, 4)))
      .catch(() => setRecentTasks([]))
  }, [])

  return (
    <div className={styles.dashboard}>
      {/* Begrüßung */}
      <div className={styles.welcomeBar}>
        <div>
          <h1 className={styles.welcomeTitle}>Willkommen zurück, {user!.username}!</h1>
          <p className={styles.welcomeSub}>Stufe {user!.level} · ⚡ {user!.points} Punkte</p>
        </div>
        <Link to="/tasks/new" className={styles.btnPrimary}>+ Aufgabe erstellen</Link>
      </div>

      {/* Schnell-Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statValue}>⚡ {user!.points}</p>
          <p className={styles.statLabel}>Punkte</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue}>LVL {user!.level}</p>
          <p className={styles.statLabel}>Stufe</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue}>{user!.badges.length}</p>
          <p className={styles.statLabel}>Abzeichen</p>
        </div>
      </div>

      {/* Neueste offene Aufgaben */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Offene Aufgaben</h2>
          <Link to="/tasks" className={styles.sectionLink}>Alle ansehen →</Link>
        </div>

        {recentTasks.length === 0 ? (
          <p className={styles.empty}>Keine offenen Aufgaben vorhanden.</p>
        ) : (
          <div className={styles.taskGrid}>
            {recentTasks.map(t => (
              <Link key={t.id} to={`/tasks/${t.id}`} className={styles.taskCard}>
                <p className={styles.taskTitle}>{t.title}</p>
                <div className={styles.taskMeta}>
                  <span className={styles.taskPoints}>⚡ {t.pointValue}</span>
                  <span className={styles.taskDiff}>{'★'.repeat(t.difficulty)}{'☆'.repeat(5 - t.difficulty)}</span>
                </div>
                <div className={styles.taskCats}>
                  {t.categories.slice(0, 2).map(c => (
                    <span key={c} className={styles.taskCat}>{c}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Schnell-Navigation */}
      <div className={styles.quickNav}>
        <Link to="/leaderboard" className={styles.quickCard}>
          <span className={styles.quickIcon}>🏆</span>
          <span>Rangliste</span>
        </Link>
        <Link to="/supporters" className={styles.quickCard}>
          <span className={styles.quickIcon}>🤝</span>
          <span>Supporter</span>
        </Link>
        <Link to="/profile" className={styles.quickCard}>
          <span className={styles.quickIcon}>👤</span>
          <span>Mein Profil</span>
        </Link>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.logo}>IO</h1>
        <p className={styles.tagline}>Gemeinsam helfen – Punkte sammeln – Stufen aufsteigen</p>
        <p className={styles.desc}>
          Stell Aufgaben ein, finde Unterstützung in deiner Umgebung und werde für deine Hilfe belohnt.
        </p>
        <div className={styles.actions}>
          <Link to="/register" className={styles.btnPrimary}>Jetzt registrieren</Link>
          <Link to="/login"    className={styles.btnGhost}>Anmelden</Link>
        </div>
      </div>
    </div>
  )
}

function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  return user ? <Dashboard /> : <LandingPage />
}

export default HomePage
