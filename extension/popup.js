async function currentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

document.getElementById('register').addEventListener('click', async () => {
  const tab = await currentTab()
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      videoUrl: location.href,
      title: document.querySelector('h1.ytd-watch-metadata')?.innerText || document.title,
      channelName: document.querySelector('#owner #text a')?.innerText || null,
      uploadDate: document.querySelector('#info-strings yt-formatted-string')?.innerText || null,
      thumbnail: document.querySelector('link[rel="image_src"]')?.href || null,
      description: document.querySelector('#description-inline-expander')?.innerText || null,
    })
  })

  const res = await fetch('http://localhost:8000/api/media/register-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  })
  document.getElementById('out').innerText = JSON.stringify(await res.json(), null, 2)
})
