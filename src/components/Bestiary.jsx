import { useEffect, useState } from 'react'
import Card from './Card'
import { getJSON, imageUrl, formatCR } from '../api'

function MonsterCard({ monster }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    getJSON(monster.url)
      .then((d) => active && setData(d))
      .catch(() => active && setError(true))
    return () => {
      active = false
    }
  }, [monster.url])

  if (error) return <Card title={monster.name} subtitle="No se pudo cargar" />
  if (!data) return <Card title={monster.name} subtitle="Cargando..." />

  const armor = data.armor_class?.[0]?.value ?? '—'

  return (
    <Card
      title={data.name}
      subtitle={`${data.size} · ${data.type}`}
      image={imageUrl(data.image)}
      stats={[
        { label: 'Clase de Armadura', value: armor },
        { label: 'Puntos de Golpe', value: data.hit_points },
        { label: 'Nivel de Desafío', value: formatCR(data.challenge_rating) },
      ]}
    />
  )
}

export default function Bestiary() {
  const [monsters, setMonsters] = useState([])
  const [search, setSearch] = useState('')
  const [visible, setVisible] = useState(12)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    getJSON('/api/monsters')
      .then((d) => {
        setMonsters(d.results)
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [])

  const filtered = monsters.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section>
      <h2>Bestiario</h2>
      <input
        className="input"
        type="search"
        placeholder="Buscar monstruo (ej: dragon, goblin)..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setVisible(12)
        }}
      />

      {status === 'loading' && <p className="msg">Cargando monstruos...</p>}
      {status === 'error' && (
        <p className="msg error">No se pudo conectar con la API. Revisa tu internet.</p>
      )}
      {status === 'ok' && (
        <p className="msg">
          {filtered.length} monstruo{filtered.length !== 1 && 's'} encontrado
          {filtered.length !== 1 && 's'}
        </p>
      )}

      <div className="grid">
        {filtered.slice(0, visible).map((m) => (
          <MonsterCard key={m.index} monster={m} />
        ))}
      </div>

      {visible < filtered.length && (
        <button className="btn" onClick={() => setVisible(visible + 12)}>
          Ver más
        </button>
      )}
    </section>
  )
}