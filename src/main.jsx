import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker (vite-plugin-pwa will generate the worker in production)
if ('serviceWorker' in navigator) {
  // Only attempt to register in production builds
  if (import.meta.env.PROD) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('Service worker registered:', reg.scope)
      })
      .catch((err) => {
        console.warn('Service worker registration failed:', err)
      })
  } else {
    // In dev, the plugin may not generate a worker; log helpful hint
    console.log('Service worker not registered in development. Run a production build to test PWA.')
  }
}
