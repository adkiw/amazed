import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Proof-of-First-Capture MVP</h1>
      <p className="mb-6 text-slate-300">First registered in our system, not first on the internet.</p>
      <form className="space-y-4 max-w-xl" encType="multipart/form-data">
        <input className="block w-full" type="file" />
        <input className="block w-full p-2 text-black" placeholder="Source URL (optional)" />
        <button className="bg-red-600 px-4 py-2 rounded">Register media</button>
      </form>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
