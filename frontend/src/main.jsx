import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const API_BASE = ''

function App() {
  const [active, setActive] = useState('register')
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [loginEmail, setLoginEmail] = useState('1@1.lt')
  const [loginPassword, setLoginPassword] = useState('1')
  const [user, setUser] = useState(null)
  const [file, setFile] = useState(null)
  const [sourceUrl, setSourceUrl] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const mediaType = useMemo(() => (file?.type?.startsWith('video') ? 'video' : 'image'), [file])

  const callJson = async (path, options) => {
    const res = await fetch(`${API_BASE}${path}`, options)
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Klaida')
    return data
  }

  const register = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const data = await callJson('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
      })
      setUser(data)
      setActive('upload')
      setStatus({ ok: `Paskyra sukurta: ${data.name}` })
    } catch (err) {
      setStatus({ error: err.message })
    } finally { setLoading(false) }
  }

  const login = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const data = await callJson('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      setUser({ id: data.user_id, name: data.name, email: loginEmail })
      setActive('upload')
      setStatus({ ok: `Prisijungta: ${data.name}` })
    } catch (err) {
      setStatus({ error: err.message })
    } finally { setLoading(false) }
  }

  const upload = async (e) => {
    e.preventDefault()
    if (!user) return setStatus({ error: 'Pirmiausia prisijunkite arba užsiregistruokite.' })
    if (!file) return setStatus({ error: 'Pasirinkite nuotrauką arba video failą.' })
    setLoading(true)
    setStatus(null)
    const fd = new FormData()
    fd.append('user_id', String(user.id))
    fd.append('media_type', mediaType)
    fd.append('source_url', sourceUrl)
    fd.append('title', file.name)
    fd.append('author_name', user.name)
    fd.append('file', file)

    try {
      const data = await callJson('/api/media/upload', { method: 'POST', body: fd })
      setStatus({ ok: `Statusas: ${data.status}`, proof: `/api/proof/${data.proof_slug}` })
    } catch (err) {
      setStatus({ error: err.message })
    } finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white"><div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">ProofCapture</h1>
      <p className="text-slate-300 mb-6">Viskas viename: registracija, prisijungimas ir nuotraukos įkėlimas. Demo prisijungimas: 1@1.lt / 1</p>
      <div className="flex gap-2 mb-6">
        <button className="px-3 py-2 rounded bg-slate-800" onClick={() => setActive('register')}>Registracija</button>
        <button className="px-3 py-2 rounded bg-slate-800" onClick={() => setActive('login')}>Prisijungimas</button>
        <button className="px-3 py-2 rounded bg-slate-800" onClick={() => setActive('upload')}>Įkelti</button>
      </div>

      {active === 'register' && <form onSubmit={register} className="grid gap-3 bg-slate-900 p-5 rounded-xl">
        <input placeholder="Vardas" className="p-3 rounded bg-slate-800" value={regName} onChange={(e) => setRegName(e.target.value)} />
        <input placeholder="El. paštas" className="p-3 rounded bg-slate-800" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
        <input placeholder="Slaptažodis" type="password" className="p-3 rounded bg-slate-800" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
        <button disabled={loading} className="bg-indigo-500 rounded p-3">{loading ? 'Kuriama...' : 'Sukurti paskyrą'}</button>
      </form>}

      {active === 'login' && <form onSubmit={login} className="grid gap-3 bg-slate-900 p-5 rounded-xl">
        <input placeholder="El. paštas" className="p-3 rounded bg-slate-800" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
        <input placeholder="Slaptažodis" type="password" className="p-3 rounded bg-slate-800" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
        <button disabled={loading} className="bg-indigo-500 rounded p-3">{loading ? 'Jungiamasi...' : 'Prisijungti'}</button>
      </form>}

      {active === 'upload' && <form onSubmit={upload} className="grid gap-3 bg-slate-900 p-5 rounded-xl">
        <p className="text-sm text-slate-300">Prisijungęs vartotojas: {user ? `${user.name} (#${user.id})` : 'Nėra'}</p>
        <input type="file" className="p-3 rounded bg-slate-800" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <input placeholder="Šaltinio URL (nebūtina)" className="p-3 rounded bg-slate-800" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
        <button disabled={loading} className="bg-emerald-600 rounded p-3">{loading ? 'Keliama...' : 'Įkelti nuotrauką/video'}</button>
      </form>}

      {status && <div className="mt-5 bg-slate-900 border border-slate-700 rounded-xl p-4">
        {status.error && <p className="text-red-300">Klaida: {status.error}</p>}
        {status.ok && <p className="text-emerald-300">{status.ok}</p>}
        {status.proof && <a className="underline text-indigo-300" href={status.proof} target="_blank">Atidaryti proof puslapį</a>}
      </div>}
    </div></main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
