import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const API_BASE = 'http://localhost:8000'

function App() {
  const [file, setFile] = useState(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [userId, setUserId] = useState('1')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const mediaType = useMemo(() => {
    if (!file) return 'image'
    return file.type.startsWith('video') ? 'video' : 'image'
  }, [file])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setStatus({ error: 'Pasirinkite failą prieš registruodami.' })
      return
    }

    setLoading(true)
    setStatus(null)

    const data = new FormData()
    data.append('user_id', userId)
    data.append('media_type', mediaType)
    data.append('source_url', sourceUrl)
    data.append('title', file.name)
    data.append('author_name', 'Local User')
    data.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/api/media/upload`, { method: 'POST', body: data })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.detail || 'Nepavyko užregistruoti failo')
      setStatus(payload)
    } catch (err) {
      setStatus({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <p className="inline-block rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-1 text-xs font-semibold mb-4">
            FIRST REGISTERED IN OUR SYSTEM
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight">Apsaugok savo kūrinį per 30 sekundžių</h1>
          <p className="text-slate-300 mt-3 max-w-3xl">
            Įkelk nuotrauką arba video, gauk įrodymo puslapį ir pamatyk, ar panašus turinys jau registruotas mūsų sistemoje.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 mb-8">
          <article className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6">
            <h2 className="text-lg font-bold mb-3">1. Įkelkite failą</h2>
            <p className="text-slate-300 text-sm">Palaikomos nuotraukos ir video failai. Failas neieškomas visame internete.</p>
          </article>
          <article className="rounded-2xl bg-slate-800/60 border border-slate-700 p-6">
            <h2 className="text-lg font-bold mb-3">2. Gaukite proof rezultatą</h2>
            <p className="text-slate-300 text-sm">Sistema grąžins statusą: FIRST REGISTERED arba SIMILAR FOUND su proof nuoroda.</p>
          </article>
        </section>

        <section className="rounded-3xl bg-slate-900/80 border border-slate-700 shadow-2xl p-6 md:p-8">
          <form onSubmit={onSubmit} className="grid gap-5">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Vartotojo ID</label>
              <input className="w-full rounded-xl bg-slate-800 border border-slate-600 px-4 py-3" value={userId} onChange={(e) => setUserId(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Pasirinkite failą</label>
              <input
                type="file"
                className="w-full rounded-xl bg-slate-800 border border-slate-600 px-4 py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-white"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Šaltinio URL (nebūtina)</label>
              <input
                className="w-full rounded-xl bg-slate-800 border border-slate-600 px-4 py-3"
                placeholder="https://..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </div>

            <button disabled={loading} className="rounded-xl bg-indigo-500 hover:bg-indigo-400 transition font-semibold py-3 px-5 disabled:opacity-60">
              {loading ? 'Registruojama...' : 'Registruoti turinį'}
            </button>
          </form>

          {status && (
            <div className="mt-6 rounded-2xl border border-slate-600 bg-slate-800/80 p-5">
              {'error' in status ? (
                <p className="text-red-300 font-medium">Klaida: {status.error}</p>
              ) : (
                <>
                  <p className="font-semibold text-emerald-300">Statusas: {status.status}</p>
                  <p className="text-slate-300">Media ID: {status.id}</p>
                  <p className="text-slate-300">Proof: <a className="text-indigo-300 underline" href={`${API_BASE}/api/proof/${status.proof_slug}`} target="_blank">/api/proof/{status.proof_slug}</a></p>
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
