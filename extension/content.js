(async () => {
  const badge = document.createElement('div')
  badge.style.cssText = 'position:fixed;top:12px;right:12px;z-index:999999;background:#111;color:#fff;padding:10px;border-radius:8px;font:12px sans-serif'
  badge.textContent = 'Proof status: checking...'
  document.body.appendChild(badge)

  try {
    const res = await fetch('http://localhost:8000/api/media/register-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: location.href, title: document.title })
    })
    const data = await res.json()
    badge.textContent = `Proof status: ${data.status || 'unknown'}`
  } catch {
    badge.textContent = 'Proof status: backend offline'
  }
})()
