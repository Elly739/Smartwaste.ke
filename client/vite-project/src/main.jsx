import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

async function clearDevelopmentServiceWorkers() {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(registrations.map((registration) => registration.unregister()))

  if ('caches' in window) {
    const cacheKeys = await window.caches.keys()
    await Promise.all(cacheKeys.map((key) => window.caches.delete(key)))
  }
}

if (import.meta.env.DEV) {
  clearDevelopmentServiceWorkers().catch((error) => {
    console.error('Failed to clear development service workers:', error)
  })
} else if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error)
    })
  })
}