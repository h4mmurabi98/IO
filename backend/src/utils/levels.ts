/**
 * Berechnet das Level anhand der Punktzahl.
 * 100 Stufen, je 100 Punkte pro Stufe. Startet bei 0.
 */
export const calcLevel = (points: number): number => {
  return Math.min(100, Math.floor(points / 100))
}
