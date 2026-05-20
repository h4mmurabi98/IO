import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './HomePage.module.css'

function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (user) return <Navigate to="/tasks" replace />

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

export default HomePage
