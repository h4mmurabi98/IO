import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'
import styles from './Navbar.module.css'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const { theme, toggle } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>IO</NavLink>

        <div className={styles.links}>
          {user ? (
            <>
              <NavLink to="/tasks"       className={linkClass}>Aufgaben</NavLink>
              <NavLink to="/supporters"  className={linkClass}>Supporter</NavLink>
              <NavLink to="/leaderboard" className={linkClass}>Rangliste</NavLink>
              <NavLink to="/profile"     className={linkClass}>Profil</NavLink>
              <span className={styles.userPoints}>⚡ {user.points}</span>
            </>
          ) : (
            <>
              <NavLink to="/tasks"      className={linkClass}>Aufgaben</NavLink>
              <NavLink to="/supporters" className={linkClass}>Supporter</NavLink>
              <NavLink to="/login"      className={linkClass}>Anmelden</NavLink>
              <NavLink to="/register"   className={linkClass}>Registrieren</NavLink>
            </>
          )}

          <button className={styles.themeBtn} onClick={toggle} title="Design wechseln">
            {theme === 'dark' ? '☀' : '☽'}
          </button>

          {user && (
            <button className={styles.logoutBtn} onClick={handleLogout}>Abmelden</button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
