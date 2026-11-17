import { useState } from 'react'
import Card from './Card'
import { getJSON, shuffle, formatCR } from '../api'

const CR_OPTIONS = [
  { label: '0', value: 0 },
  { label: '1/8', value: 0.125 },
  { label: '1/4', value: 0.25 },
  { label: '1/2', value: 0.5 },
  ...Array.from({ length: 30 }, (_, i) => ({ label: String(i + 1), value: i + 1 })),
]

const RARITIES = [
  ['Common', 'Uncommon'],
  ['Uncommon', 'Rare'],
  ['Rare', 'Very Rare'],
  ['Very Rare', 'Legendary'],
]

const RARITY_ES = {
  Common: 'Común',
  Uncommon: 'Poco común',
  Rare: 'Raro',
  'Very Rare': 'Muy raro',
  Legendary: 'Legendario',
}

const COIN_INFO = [
  { key: 'cp', name: 'Cobre' },
  { key: 'sp', name: 'Plata' },
  { key: 'gp', name: 'Oro' },
  { key: 'pp', name: 'Platino' },
]

const roll = (n, sides) => {
  let total = 0
  for (let i = 0; i < n; i++) total += Math.floor(Math.random() * sides) + 1
  return total
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const getTier = (cr) => {
  if (cr <= 4) return 0
  if (cr <= 10) return 1
  if (cr <= 16) return 2
  return 3
}

function generateCoins(cr) {
  const tier = getTier(cr)
  const coins = { cp: 0, sp: 0, gp: 0, pp: 0 }
  if (tier === 0) {
    coins.cp = roll(3, 6) * 10
    coins.sp = roll(2, 6) * 10
    coins.gp = roll(2, 6) * (1 + Math.floor(cr))
  } else if (tier === 1) {
    coins.sp = roll(2, 6) * 10
    coins.gp = roll(2, 6) * cr * 5
    coins.pp = roll(1, 6) * Math.floor(cr / 2)
  } else if (tier === 2) {
    coins.gp = roll(4, 6) * cr * 10
    coins.pp = roll(2, 6) * cr
  } else {
    coins.gp = roll(6, 6) * cr * 50
    coins.pp = roll(4, 6) * cr * 10
  }
  return coins
}

async function pickEquipment(count) {
  const list = (await getJSON('/api/equipment')).results
  const picks = shuffle(list).slice(0, count)
  const details = await Promise.all(picks.map((p) => getJSON(p.url).catch(() => null)))
  return details.filter(Boolean).map((d) => ({
    id: 'e-' + d.index,
    name: d.name,
    badge: 'Equipo',
    category: d.equipment_category?.name ?? '',
    stats: [{ label: 'Valor', value: d.cost ? `${d.cost.quantity} ${d.cost.unit}` : '—' }],
    desc: '',
  }))
}

async function pickMagicItems(count, tier) {
  if (count === 0) return []
  const list = (await getJSON('/api/magic-items')).results
  const candidates = shuffle(list).slice(0, Math.max(count * 12, 16))
  const details = await Promise.all(candidates.map((c) => getJSON(c.url).catch(() => null)))
  return details
    .filter((d) => d && RARITIES[tier].includes(d.rarity?.name))
    .slice(0, count)
    .map((d) => ({
      id: 'm-' + d.index,
      name: d.name,
      badge: RARITY_ES[d.rarity.name],
      category: d.equipment_category?.name ?? 'Objeto mágico',
      stats: [{ label: 'Rareza', value: RARITY_ES[d.rarity.name] }],
      desc: d.desc?.[0] ? d.desc[0].slice(0, 140) + '...' : '',
    }))
}

export default function LootGenerator() {
  const [cr, setCr] = useState(1)
  const [loot, setLoot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(false)
    try {
      const tier = getTier(cr)
      const equipmentCount = randInt(1, 2) + Math.floor(cr / 8)
      let magicCount = Math.random() < Math.min(0.1 + cr * 0.04, 0.95) ? 1 : 0
      if (tier >= 2 && Math.random() < 0.5) magicCount += 1

      const [coins, equipment, magic] = await Promise.all([
        Promise.resolve(generateCoins(cr)),
        pickEquipment(equipmentCount),
        pickMagicItems(magicCount, tier),
      ])
      setLoot({ cr, coins, items: [...magic, ...equipment] })
    } catch {
      setError(true)
    }
    setLoading(false)
  }

  return (
    <section>
      <h2>Generador de Botín</h2>
      <div className="panel">
        <label htmlFor="cr">Nivel de desafío del monstruo derrotado</label>
        <select
          id="cr"
          className="input"
          value={cr}
          onChange={(e) => setCr(Number(e.target.value))}
        >
          {CR_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              CR {o.label}
            </option>
          ))}
        </select>
        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? 'Buscando tesoro...' : 'Generar botín'}
        </button>
      </div>

      {error && <p className="msg error">No se pudo generar el botín. Intenta de nuevo.</p>}

      {loot && (
        <div>
          <h3 className="subtitle">Monedas (CR {formatCR(loot.cr)})</h3>
          <div className="coins">
            {COIN_INFO.map((c) => (
              <div key={c.key} className="coin">
                <span className={'coin-dot ' + c.key}></span>
                <strong>{loot.coins[c.key]}</strong>
                <span>{c.name}</span>
              </div>
            ))}
          </div>

          <h3 className="subtitle">Objetos</h3>
          <div className="grid">
            {loot.items.map((item) => (
              <Card
                key={item.id}
                title={item.name}
                subtitle={item.category}
                badge={item.badge}
                stats={item.stats}
              >
                {item.desc && <p className="card-desc">{item.desc}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}