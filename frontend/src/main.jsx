import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const API_BASE = 'http://localhost:8000'

const features = [
  {
    title: 'Greita registracija',
    description: 'Įkeliate failą ir per kelias sekundes gaunate proof rezultatą.',
  },
  {
    title: 'Aiškus statusas',
    description: 'Matote tiksliai: FIRST REGISTERED arba SIMILAR FOUND.',
  },
  {
    title: 'Skaidrus principas',
    description: 'Vertiname tik tai, kas registruota mūsų sistemoje.',
  },
]

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
      setStatus({ error: 'Pasirinkite failą. Be failo negalime sukurti skaitmeninio įrodymo.' })
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
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
        <header className="mb-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 text-emerald-300 px-3 py-1 text-xs font-semibold">
            READY FOR MARKET MVP
          </p>
          <h1 className="text-4xl lg:text-5xl font-black mt-4 leading-tight">ProofCapture: jūsų turinio pirmos registracijos įrodymas</h1>
          <p className="text-slate-300 mt-4 max-w-4xl text-lg">
            Sukurta paprastam naudotojui: įkelkite nuotrauką ar video, gaukite aiškų statusą ir proof nuorodą. 
            <span className="font-semibold">Svarbu:</span> sistema parodo pirmą registraciją mūsų sistemoje, o ne visame internete.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-4 mb-8">
          {features.map((f) => (
            <article key={f.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-slate-300">{f.description}</p>
            </article>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-1">Registruoti turinį</h2>
            <p className="text-slate-400 text-sm mb-6">Užpildykite 3 laukus. Kiekvienas laukas turi aiškų tikslą.</p>

            <form onSubmit={onSubmit} className="grid gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Vartotojo ID</label>
                <input className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3" value={userId} onChange={(e) => setUserId(e.target.value)} />
                <p className="text-xs text-slate-400 mt-2">Kam reikia: kad įrodymas būtų susietas su konkrečiu jūsų profiliu.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Failas (nuotrauka arba video)</label>
                <input
                  type="file"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-500 file:px-4 file:py-2 file:text-white"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-slate-400 mt-2">Kam reikia: iš failo skaičiuojamas hash ir panašumo fingerprint.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Šaltinio URL (nebūtina)</label>
                <input
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3"
                  placeholder="https://..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-2">Kam reikia: padeda vėliau aiškiai parodyti, iš kur turinys buvo paimtas.</p>
              </div>

              <button disabled={loading} className="rounded-xl bg-indigo-500 hover:bg-indigo-400 transition font-semibold py-3 px-5 disabled:opacity-60">
                {loading ? 'Registruojama...' : 'Registruoti ir gauti proof'}
              </button>
            </form>

            {status && (
              <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-800 p-5">
                {'error' in status ? (
                  <p className="text-red-300 font-medium">Klaida: {status.error}</p>
                ) : (
                  <>
                    <p className="font-semibold text-emerald-300">Statusas: {status.status}</p>
                    <p className="text-slate-300">Media ID: {status.id}</p>
                    <p className="text-slate-300">Proof nuoroda: <a className="text-indigo-300 underline" href={`${API_BASE}/api/proof/${status.proof_slug}`} target="_blank">atidaryti įrodymą</a></p>
                  </>
                )}
              </div>
            )}
          </div>

          <aside className="rounded-3xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-xl font-bold mb-4">Kaip tai veikia?</h3>
            <ol className="space-y-4 text-sm text-slate-300 list-decimal pl-5">
              <li>Įkeliate failą ir (nebūtinai) URL.</li>
              <li>Sistema sugeneruoja hash, fingerprint ir laiką.</li>
              <li>Palygina su anksčiau registruotu turiniu.</li>
              <li>Grąžina statusą + proof nuorodą.</li>
            </ol>

            <div className="mt-6 rounded-xl border border-amber-700/40 bg-amber-500/10 p-4 text-sm text-amber-200">
              Svarbu: ši platforma netikrina viso interneto. Ji rodo tik tai, kas praėjo per mūsų sistemą.
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
