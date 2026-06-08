import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './RewardsPage.module.css'

interface Reward {
  id:           string
  title:        string
  description:  string
  icon:         string
  category:     'food' | 'drink' | 'transport' | 'abo' | 'shopping' | 'fun'
  levelRequired: number
  pointCost:    number
  realPayment?: string   // Was man zusätzlich in € zahlt (leer = komplett über Punkte)
  normalPrice?: string   // Originalpreis für Kontext
  upgradeHint?: string   // "Ab LVL 30 nur noch 1,00 €"
  tag?:         string
  isUpgrade?:   boolean  // Zeigt dieses Item als Upgrade-Version eines tieferen Levels
}

const REWARDS: Reward[] = [
  // ══════════════════════════════════════════════════════════════════
  // LVL 1 – Erste Schritte (sehr simpel, nichts Wertvolles umsonst)
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'profile-badge',
    title: 'Starter-Abzeichen',
    description: 'Exklusives Profilabzeichen für dein IO-Profil – zeig allen, dass du dabei bist.',
    icon: '🏅',
    category: 'fun',
    levelRequired: 1,
    pointCost: 0,
    tag: 'Gratis',
  },
  {
    id: 'tea',
    title: 'Gratis Tee',
    description: 'Ein einfacher Tee deiner Wahl bei teilnehmenden Cafés – der erste Schritt.',
    icon: '🍵',
    category: 'drink',
    levelRequired: 1,
    pointCost: 80,
    normalPrice: '1,50 €',
    upgradeHint: 'Ab LVL 10: Kaffee für 150 Punkte',
  },

  // ══════════════════════════════════════════════════════════════════
  // LVL 5 – Erste echte Vorteile
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'softdrink',
    title: 'Softdrink (50 % Rabatt)',
    description: 'Cola, Limo oder Saft bei teilnehmenden Läden – du zahlst die Hälfte.',
    icon: '🥤',
    category: 'drink',
    levelRequired: 5,
    pointCost: 80,
    realPayment: '0,75 €',
    normalPrice: '1,50 €',
    upgradeHint: 'Ab LVL 10: Softdrink gratis',
  },
  {
    id: 'snack-50',
    title: 'Snack (50 % Rabatt)',
    description: 'Croissant, Muffin oder Riegel – die Hälfte übernimmst du, die andere halbiert IO.',
    icon: '🥐',
    category: 'food',
    levelRequired: 5,
    pointCost: 100,
    realPayment: '0,75 €',
    normalPrice: '1,50 €',
    upgradeHint: 'Ab LVL 20: Snack gratis',
  },

  // ══════════════════════════════════════════════════════════════════
  // LVL 10 – Kaffee-Einstieg + erste Gratis-Getränke
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'coffee-l10',
    title: 'Kaffee (50 % Rabatt)',
    description: 'Kaffee, Cappuccino oder Latte bei teilnehmenden Cafés – du zahlst 1,50 €, IO übernimmt die andere Hälfte.',
    icon: '☕',
    category: 'drink',
    levelRequired: 10,
    pointCost: 150,
    realPayment: '1,50 €',
    normalPrice: '3,00 €',
    upgradeHint: 'Ab LVL 30: Kaffee für nur 1,00 €',
    tag: 'Beliebt',
  },
  {
    id: 'softdrink-free',
    title: 'Softdrink (Gratis)',
    description: 'Cola, Limo, Saft oder Wasser komplett auf uns – einfach einlösen und genießen.',
    icon: '🥤',
    category: 'drink',
    levelRequired: 10,
    pointCost: 100,
    normalPrice: '1,50 €',
    isUpgrade: true,
  },

  // ══════════════════════════════════════════════════════════════════
  // LVL 20 – Erste Abo-Deals + Essen
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'snack-free',
    title: 'Snack (Gratis)',
    description: 'Croissant, Muffin oder Müsliriegel – komplett kostenlos mit deinen Punkten.',
    icon: '🥐',
    category: 'food',
    levelRequired: 20,
    pointCost: 150,
    normalPrice: '1,50 €',
    isUpgrade: true,
  },
  {
    id: 'lieferando-5',
    title: '5 € Lieferando-Gutschein',
    description: 'Bestell dir Essen nach Hause – 5 € übernimmt IO.',
    icon: '🍕',
    category: 'food',
    levelRequired: 20,
    pointCost: 400,
    normalPrice: '5,00 €',
    upgradeHint: 'Ab LVL 40: 10 € Gutschein',
  },
  {
    id: 'spotify-1m',
    title: 'Spotify 1 Monat',
    description: 'Ein Monat Spotify Premium – keine Werbung, offline hören, alle Funktionen.',
    icon: '🎵',
    category: 'abo',
    levelRequired: 20,
    pointCost: 350,
    normalPrice: '10,99 €',
    upgradeHint: 'Ab LVL 50: 3 Monate Spotify',
  },

  // ══════════════════════════════════════════════════════════════════
  // LVL 25 – Kaffee wird günstiger + Transport-Einstieg
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'coffee-l25',
    title: 'Kaffee (67 % Rabatt)',
    description: 'Kaffee bei teilnehmenden Cafés – du zahlst nur noch 1,00 €, IO trägt den Rest.',
    icon: '☕',
    category: 'drink',
    levelRequired: 25,
    pointCost: 100,
    realPayment: '1,00 €',
    normalPrice: '3,00 €',
    upgradeHint: 'Ab LVL 50: Kaffee für 0,50 €',
    isUpgrade: true,
  },
  {
    id: 'bvg-single',
    title: 'ÖPNV-Einzelticket',
    description: 'Eine Einzelfahrt im Nahverkehr – schnell einlösen und losfahren.',
    icon: '🚌',
    category: 'transport',
    levelRequired: 25,
    pointCost: 300,
    normalPrice: '3,20 €',
    tag: 'Neu',
  },

  // ══════════════════════════════════════════════════════════════════
  // LVL 30 – Eis gratis + erstes Restaurant
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'ice-free',
    title: 'Eis (Gratis)',
    description: '1 Kugel Eis deiner Wahl bei teilnehmenden Eisdielen – komplett kostenlos.',
    icon: '🍦',
    category: 'food',
    levelRequired: 30,
    pointCost: 120,
    normalPrice: '1,50 €',
  },
  {
    id: 'restaurant-10',
    title: '10 € Restaurant-Gutschein',
    description: 'Gutschein für ein teilnehmendes Restaurant in deiner Nähe.',
    icon: '🍽️',
    category: 'food',
    levelRequired: 30,
    pointCost: 900,
    normalPrice: '10,00 €',
    upgradeHint: 'Ab LVL 75: 25 € Gutschein',
    tag: 'Exklusiv',
  },

  // ══════════════════════════════════════════════════════════════════
  // LVL 40 – Streaming & Shopping
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'lieferando-10',
    title: '10 € Lieferando-Gutschein',
    description: 'Größerer Essens-Gutschein – gönn dir was Richtiges.',
    icon: '🛵',
    category: 'food',
    levelRequired: 40,
    pointCost: 800,
    normalPrice: '10,00 €',
    isUpgrade: true,
  },
  {
    id: 'netflix-1m',
    title: 'Streaming 1 Monat',
    description: 'Netflix, Disney+ oder Amazon Prime – einen Monat deine Wahl.',
    icon: '🎬',
    category: 'abo',
    levelRequired: 40,
    pointCost: 700,
    normalPrice: '12,99 €',
    upgradeHint: 'Ab LVL 75: 3 Monate gratis',
  },
  {
    id: 'amazon-15',
    title: '15 € Amazon-Gutschein',
    description: 'Kauf dir was du schon länger wolltest.',
    icon: '🛒',
    category: 'shopping',
    levelRequired: 40,
    pointCost: 1200,
    normalPrice: '15,00 €',
    upgradeHint: 'Ab LVL 100: 50 € Gutschein',
  },

  // ══════════════════════════════════════════════════════════════════
  // LVL 50 – Kaffee fast gratis + Bahn + Premium-Abos
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'coffee-l50',
    title: 'Kaffee (83 % Rabatt)',
    description: 'Kaffee für sage und schreibe 0,50 € – fast gratis für treue Supporter.',
    icon: '☕',
    category: 'drink',
    levelRequired: 50,
    pointCost: 50,
    realPayment: '0,50 €',
    normalPrice: '3,00 €',
    upgradeHint: 'Ab LVL 100: Kaffee komplett gratis!',
    isUpgrade: true,
    tag: 'Fast gratis',
  },
  {
    id: 'bahn-50',
    title: 'Bahnfahrt (50 % Rabatt)',
    description: 'Deutschlandweit mit 50 % Ermäßigung – einfach Gutschein beim Kauf angeben.',
    icon: '🚆',
    category: 'transport',
    levelRequired: 50,
    pointCost: 1500,
    realPayment: '~25 €',
    normalPrice: '~50 €',
    upgradeHint: 'Ab LVL 100: Deutschlandticket gratis',
  },
  {
    id: 'spotify-3m',
    title: 'Spotify 3 Monate',
    description: 'Drei Monate Spotify Premium – Musik ohne Ende für lange Hilfs-Einsätze.',
    icon: '🎵',
    category: 'abo',
    levelRequired: 50,
    pointCost: 900,
    normalPrice: '32,97 €',
    isUpgrade: true,
  },

  // ══════════════════════════════════════════════════════════════════
  // LVL 75 – Reise & Premium
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'restaurant-25',
    title: '25 € Restaurant-Gutschein',
    description: 'Ein richtiges Dinner auf Kosten deiner Hilfsbereitschaft.',
    icon: '🍾',
    category: 'food',
    levelRequired: 75,
    pointCost: 2000,
    normalPrice: '25,00 €',
    isUpgrade: true,
    tag: 'Exklusiv',
  },
  {
    id: 'streaming-3m',
    title: 'Streaming 3 Monate',
    description: 'Netflix oder Disney+ für drei Monate – verdiente Erholung.',
    icon: '🎬',
    category: 'abo',
    levelRequired: 75,
    pointCost: 1800,
    normalPrice: '38,97 €',
    isUpgrade: true,
  },
  {
    id: 'hotel-1n',
    title: '1 Hotelübernachtung',
    description: 'Eine Nacht in einem teilnehmenden Hotel – Belohnung für echte Unterstützer.',
    icon: '🏨',
    category: 'fun',
    levelRequired: 75,
    pointCost: 4000,
    normalPrice: '~80 €',
    tag: 'Exklusiv',
  },
  {
    id: 'flug-75',
    title: '75 € Flug-Gutschein',
    description: 'Rabatt auf deinen nächsten Flug – europaweit bei teilnehmenden Airlines.',
    icon: '✈️',
    category: 'transport',
    levelRequired: 75,
    pointCost: 5000,
    normalPrice: '75,00 €',
    tag: 'Exklusiv',
  },

  // ══════════════════════════════════════════════════════════════════
  // LVL 100 – VIP: alles auf Maximum
  // ══════════════════════════════════════════════════════════════════
  {
    id: 'coffee-free',
    title: 'Kaffee (Gratis)',
    description: 'Endlich: Kaffee komplett umsonst bei teilnehmenden Cafés. Die ultimative Belohnung für LVL-100-Supporter.',
    icon: '☕',
    category: 'drink',
    levelRequired: 100,
    pointCost: 0,
    normalPrice: '3,00 €',
    isUpgrade: true,
    tag: '🏆 VIP',
  },
  {
    id: 'deutschlandticket',
    title: 'Deutschlandticket 1 Monat',
    description: 'Einen Monat unbegrenzt mit Bus und Bahn durch ganz Deutschland.',
    icon: '🚉',
    category: 'transport',
    levelRequired: 100,
    pointCost: 2000,
    normalPrice: '58,00 €',
    tag: '🏆 VIP',
  },
  {
    id: 'amazon-50',
    title: '50 € Amazon-Gutschein',
    description: 'Die größte Shopping-Prämie – für die treuesten Supporter der Plattform.',
    icon: '👑',
    category: 'shopping',
    levelRequired: 100,
    pointCost: 4000,
    normalPrice: '50,00 €',
    isUpgrade: true,
    tag: '🏆 VIP',
  },
]

const TIERS = [
  { level: 1,   label: 'Starter',    color: '#8b949e' },
  { level: 5,   label: 'Helfer',     color: '#3fb950' },
  { level: 10,  label: 'Aktiver',    color: '#4a9eff' },
  { level: 20,  label: 'Erfahrener', color: '#58a6ff' },
  { level: 25,  label: 'Profi',      color: '#a371f7' },
  { level: 30,  label: 'Experte',    color: '#d29922' },
  { level: 40,  label: 'Meister',    color: '#e3b341' },
  { level: 50,  label: 'Champion',   color: '#ffa657' },
  { level: 75,  label: 'Legende',    color: '#f78166' },
  { level: 100, label: 'VIP',        color: '#f1e05a' },
]

const CATEGORY_LABEL: Record<string, string> = {
  food:      '🍔 Essen',
  drink:     '☕ Getränke',
  transport: '🚆 Transport',
  abo:       '📱 Abos',
  shopping:  '🛍️ Shopping',
  fun:       '🎉 Sonstiges',
}

function RedeemModal({ reward, onClose }: { reward: Reward; onClose: () => void }) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <p className={styles.modalIcon}>{reward.icon}</p>
        <h2 className={styles.modalTitle}>{reward.title}</h2>
        <p className={styles.modalDesc}>{reward.description}</p>

        <div className={styles.modalPricing}>
          {reward.normalPrice && (
            <div className={styles.modalPriceRow}>
              <span className={styles.modalPriceLabel}>Normalpreis</span>
              <span className={styles.modalNormal}>{reward.normalPrice}</span>
            </div>
          )}
          {reward.realPayment && (
            <div className={styles.modalPriceRow}>
              <span className={styles.modalPriceLabel}>Du zahlst (€)</span>
              <span className={styles.modalReal}>{reward.realPayment}</span>
            </div>
          )}
          <div className={styles.modalPriceRow}>
            <span className={styles.modalPriceLabel}>Punktekosten</span>
            <span className={styles.modalPoints}>
              {reward.pointCost === 0 ? 'Gratis ✓' : `⚡ ${reward.pointCost}`}
            </span>
          </div>
        </div>

        <div className={styles.modalNote}>
          <p>Im Prototyp noch nicht live angebunden. In der finalen Version erscheint hier ein QR-Code oder Einlöse-Code.</p>
        </div>
        <button className={styles.modalClose} onClick={onClose}>Schließen</button>
      </div>
    </div>
  )
}

function RewardsPage() {
  const { user }                            = useAuth()
  const [redeeming, setRedeeming]           = useState<Reward | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const userLevel  = user?.level  ?? 0
  const userPoints = user?.points ?? 0

  const categories = [...new Set(REWARDS.map(r => r.category))]

  const nextTier       = TIERS.find(t => t.level > userLevel)
  const pointsToNext   = nextTier ? nextTier.level * 100 - userPoints : 0
  const currentTier    = [...TIERS].reverse().find(t => t.level <= userLevel)

  const filtered = (level: number) =>
    REWARDS.filter(r =>
      r.levelRequired === level &&
      (!activeCategory || r.category === activeCategory)
    )

  const visibleTiers = TIERS.filter(t => filtered(t.level).length > 0)

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Prämien-Shop</h1>
          <p className={styles.heroSub}>
            Punkte sammeln, Levels aufsteigen, bessere Deals freischalten —
            vom günstigen Kaffee bis zum Gratis-Ticket.
          </p>
        </div>

        {user ? (
          <div className={styles.heroRight}>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal} style={{ color: currentTier?.color }}>
                  LVL {userLevel}
                </span>
                <span className={styles.heroStatLabel}>{currentTier?.label ?? 'Starter'}</span>
              </div>
              <div className={styles.heroDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatVal}>⚡ {userPoints}</span>
                <span className={styles.heroStatLabel}>Punkte</span>
              </div>
              {nextTier && pointsToNext > 0 && (
                <>
                  <div className={styles.heroDivider} />
                  <div className={styles.heroStat}>
                    <span className={styles.heroStatVal}>+{pointsToNext}</span>
                    <span className={styles.heroStatLabel}>bis LVL {nextTier.level}</span>
                  </div>
                </>
              )}
            </div>
            <p className={styles.heroHint}>
              100 Punkte ≈ 1 € · Levels schalten bessere Deals frei
            </p>
          </div>
        ) : (
          <Link to="/login" className={styles.loginBtn}>Anmelden zum Einlösen</Link>
        )}
      </div>

      {/* Wie funktioniert's? */}
      <div className={styles.howTo}>
        <div className={styles.howStep}>
          <span className={styles.howIcon}>⚡</span>
          <div>
            <p className={styles.howTitle}>Punkte verdienen</p>
            <p className={styles.howDesc}>Hilfegesuche annehmen und abschließen</p>
          </div>
        </div>
        <div className={styles.howArrow}>→</div>
        <div className={styles.howStep}>
          <span className={styles.howIcon}>🏆</span>
          <div>
            <p className={styles.howTitle}>Level aufsteigen</p>
            <p className={styles.howDesc}>Bessere Deals freischalten</p>
          </div>
        </div>
        <div className={styles.howArrow}>→</div>
        <div className={styles.howStep}>
          <span className={styles.howIcon}>🎁</span>
          <div>
            <p className={styles.howTitle}>Prämien einlösen</p>
            <p className={styles.howDesc}>Mit Punkten kaufen</p>
          </div>
        </div>
      </div>

      {/* Kategorie-Filter */}
      <div className={styles.catFilter}>
        <button
          className={`${styles.catBtn} ${activeCategory === null ? styles.catBtnActive : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          Alle
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={`${styles.catBtn} ${activeCategory === cat ? styles.catBtnActive : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      {/* Reward-Tiers */}
      {visibleTiers.map(tier => {
        const isUnlocked = userLevel >= tier.level
        const rewards    = filtered(tier.level)

        return (
          <section key={tier.level} className={styles.tier}>
            <div className={styles.tierHeader}>
              <span
                className={styles.tierBadge}
                style={{ borderColor: tier.color, color: tier.color }}
              >
                LVL {tier.level}
              </span>
              <h2 className={styles.tierLabel} style={{ color: tier.color }}>
                {tier.label}
              </h2>
              <span className={styles.tierSep} />
              {isUnlocked
                ? <span className={styles.tierOpen}>✓ Freigeschaltet</span>
                : <span className={styles.tierLocked}>🔒 {tier.level * 100 - userPoints} Punkte bis zur Freischaltung</span>
              }
            </div>

            <div className={styles.rewardsGrid}>
              {rewards.map(reward => {
                const unlocked   = userLevel >= reward.levelRequired
                const canAfford  = userPoints >= reward.pointCost
                const isFree     = reward.pointCost === 0

                return (
                  <div
                    key={reward.id}
                    className={`${styles.rewardCard} ${!unlocked ? styles.rewardCardLocked : ''} ${reward.isUpgrade ? styles.rewardCardUpgrade : ''}`}
                  >
                    {reward.tag && (
                      <span
                        className={styles.rewardTag}
                        style={{ color: tier.color, borderColor: tier.color + '55', background: tier.color + '18' }}
                      >
                        {reward.tag}
                      </span>
                    )}
                    {reward.isUpgrade && (
                      <span className={styles.upgradeLabel}>↑ Upgrade</span>
                    )}

                    <div className={styles.rewardIcon}>{reward.icon}</div>
                    <h3 className={styles.rewardTitle}>{reward.title}</h3>
                    <p className={styles.rewardDesc}>{reward.description}</p>

                    {/* Preis-Übersicht */}
                    <div className={styles.pricing}>
                      {reward.normalPrice && (
                        <div className={styles.pricingRow}>
                          <span className={styles.pricingLabel}>Normalpreis</span>
                          <span className={styles.pricingNormal}>{reward.normalPrice}</span>
                        </div>
                      )}
                      {reward.realPayment && (
                        <div className={styles.pricingRow}>
                          <span className={styles.pricingLabel}>Du zahlst</span>
                          <span className={styles.pricingReal}>{reward.realPayment}</span>
                        </div>
                      )}
                      <div className={styles.pricingRow}>
                        <span className={styles.pricingLabel}>Punktekosten</span>
                        <span className={`${styles.pricingPoints} ${!canAfford && unlocked && !isFree ? styles.pricingInsuff : ''}`}>
                          {isFree ? '✓ Gratis' : `⚡ ${reward.pointCost}`}
                        </span>
                      </div>
                    </div>

                    {reward.upgradeHint && (
                      <p className={styles.upgradeHint}>{reward.upgradeHint}</p>
                    )}

                    {unlocked ? (
                      user ? (
                        <button
                          className={`${styles.redeemBtn} ${(!canAfford && !isFree) ? styles.redeemBtnOff : ''}`}
                          onClick={() => (canAfford || isFree) && setRedeeming(reward)}
                          disabled={!canAfford && !isFree}
                        >
                          {(canAfford || isFree) ? 'Einlösen' : 'Zu wenig Punkte'}
                        </button>
                      ) : (
                        <Link to="/login" className={styles.redeemBtnLink}>Anmelden</Link>
                      )
                    ) : (
                      <div className={styles.lockBar}>
                        <span>🔒 Ab LVL {reward.levelRequired}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {redeeming && <RedeemModal reward={redeeming} onClose={() => setRedeeming(null)} />}
    </div>
  )
}

export default RewardsPage
