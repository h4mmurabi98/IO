import { Link } from 'react-router-dom'
import type { Task } from '../types'
import styles from './TaskCard.module.css'

const stars = (d: number) => '★'.repeat(d) + '☆'.repeat(5 - d)

interface Props {
  task: Task
}

function TaskCard({ task }: Props) {
  return (
    <Link to={`/tasks/${task.id}`} className={styles.card}>
      <p className={styles.title}>{task.title}</p>

      <div className={styles.categories}>
        {task.categories.map(cat => (
          <span key={cat} className={styles.chip}>{cat}</span>
        ))}
      </div>

      <div className={styles.meta}>
        <span className={styles.difficulty} title="Schwierigkeit">
          {stars(task.difficulty)}
        </span>
        <span className={styles.points}>⚡ {task.pointValue}</span>
        <span className={styles.metaItem}>{task.durationMinutes} Min.</span>
        {task.location && (
          <span className={styles.metaItem}>📍 {task.location}</span>
        )}
      </div>
    </Link>
  )
}

export default TaskCard
