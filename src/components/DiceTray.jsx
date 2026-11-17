import { useState } from 'react'

const DICE = [4, 6, 8, 10, 12, 20, 100]

export default function DiceTray() {
  const [sides, setSides] = useState(20)
  const [count, setCount] = useState(1)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const rollDice = () => {
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1)
    const total = rolls.reduce((a, b) => a + b, 0)
    const r = { id: Date.now(), sides, count, rolls, total }
    setResult(r)
    setHistory((h) => [r, ...h].slice(0, 8))
  }

  let tone = ''
  if (result && result.sides === 20 && result.count === 1) {
    if (result.total === 20) tone = 'crit'
    if (result.total === 1) tone = 'fail'
  }

  return (
    <section>
      <h2>Bandeja de dados</h2>

      <div className="dice-row">
        {DICE.map((d) => (
          <button
            key={d}
            className={'die' + (sides === d ? ' active' : '')}
            onClick={() => setSides(d)}
          >
            d{d}
          </button>
        ))}
      </div>

      <div className="panel">
        <label htmlFor="count">Cantidad de dados</label>
        <select
          id="count"
          className="input"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button className="btn" onClick={rollDice}>
          Lanzar {count}d{sides}
        </button>
      </div>

      <div className={'result ' + tone}>
        {result ? (
          <>
            <div key={result.id} className="result-number">
              {result.total}
            </div>
            <p>
              {result.count}d{result.sides}
              {result.count > 1 && ` = [${result.rolls.join(', ')}]`}
            </p>
            {tone === 'crit' && <p>¡Crítico!</p>}
            {tone === 'fail' && <p>¡Pifia!</p>}
          </>
        ) : (
          <p>Elige un dado y lánzalo</p>
        )}
      </div>

      {history.length > 0 && (
        <div className="history">
          <h3 className="subtitle">Últimos lanzamientos</h3>
          <ul>
            {history.map((h) => (
              <li key={h.id}>
                <span>
                  {h.count}d{h.sides}
                </span>
                <strong>{h.total}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}