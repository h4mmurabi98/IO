/**
 * Berechnet das Level anhand der aktuellen Punktzahl.
 * Level 1: 0–99 | Level 2: 100–299 | Level 3: 300–599 | Level 4: 600–999 | Level 5+: je 500 Punkte
 */
export const calcLevel = (points: number): number => {
  if (points < 100)  return 1
  if (points < 300)  return 2
  if (points < 600)  return 3
  if (points < 1000) return 4
  return 5 + Math.floor((points - 1000) / 500)
}
