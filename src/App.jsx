import { useEffect, useMemo, useState } from 'react'

function MobileShell({ children, activeTab, onTabChange }) {
  const tabs = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'tasks', label: 'Tasks', icon: '📝' },
    { key: 'about', label: 'About', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-md w-full mx-auto bg-white shadow-sm">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b px-4 py-3">
          <h1 className="text-xl font-semibold">Mobile Starter</h1>
          <p className="text-xs text-gray-500">Responsive, mobile-first UI</p>
        </header>

        <main className="p-4">{children}</main>
      </div>

      <nav className="sticky bottom-0 bg-white border-t w-full max-w-md mx-auto">
        <div className="grid grid-cols-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`flex flex-col items-center justify-center py-2 text-sm ${
                activeTab === t.key ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[11px] mt-0.5">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

function HomeTab() {
  const [hello, setHello] = useState('')
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/hello`)
        const data = await res.json()
        setHello(data.message || 'Hello!')
      } catch (e) {
        setHello('Could not reach backend')
      }
    }
    run()
  }, [baseUrl])

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Welcome</h2>
      <p className="text-gray-600">{hello}</p>
      <a
        href="/test"
        className="inline-block text-sm text-blue-600 hover:underline"
      >
        Check backend & database status
      </a>
    </div>
  )
}

function TasksTab() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${baseUrl}/api/tasks`)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addTask = async (e) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    try {
      const res = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      })
      if (!res.ok) throw new Error('Failed to add task')
      const created = await res.json()
      setItems((prev) => [created, ...prev])
      setTitle('')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addTask} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50"
          disabled={!title.trim()}
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-sm">No tasks yet. Add your first one!</p>
      ) : (
        <ul className="divide-y">
          {items.map((t, idx) => (
            <li key={idx} className="py-3 flex items-start gap-3">
              <span className={`mt-0.5 inline-block w-5 h-5 rounded-full border ${t.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{t.title}</p>
                <p className="text-xs text-gray-500">{t.done ? 'Done' : 'Pending'}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AboutTab() {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">About</h2>
      <p className="text-gray-600 text-sm">
        This is a mobile-style starter with a bottom tab bar and a simple tasks feature
        connected to a backend database.
      </p>
      <p className="text-gray-600 text-sm">
        Ready for your custom features: authentication, camera uploads, payments, and more.
      </p>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <MobileShell activeTab={tab} onTabChange={setTab}>
      {tab === 'home' && <HomeTab />}
      {tab === 'tasks' && <TasksTab />}
      {tab === 'about' && <AboutTab />}
    </MobileShell>
  )
}
