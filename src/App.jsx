import { useState } from 'react'
import Bestiary from './components/Bestiary'
import LootGenerator from './components/LootGenerator'
import DiceTray from './components/DiceTray'

const TABS = [
  { id: 'bestiary', label: 'Bestiario' },
  { id: 'loot', label: 'Botín' },
  { id: 'dice', label: 'Dados' },
]

export default function App() {
  const [tab, setTab] = useState('bestiary')

  return (
    <div className="app">
      <header className="header">
        <h1>Asistente del Dungeon Master</h1>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={'tab' + (tab === t.id ? ' active' : '')}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {tab === 'bestiary' && <Bestiary />}
        {tab === 'loot' && <LootGenerator />}
        {tab === 'dice' && <DiceTray />}
      </main>
    </div>
  )
}