import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App'
import { IS_DEMO } from './config'
import { PreferencesProvider } from './context/PreferencesProvider'
import { AuthProvider } from './context/AuthContext'

const app = (
  <PreferencesProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </PreferencesProvider>
)

// Hash routes reload on Pages without server rewrites. Normal mode keeps clean URLs.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {IS_DEMO ? <HashRouter>{app}</HashRouter> : <BrowserRouter>{app}</BrowserRouter>}
  </StrictMode>,
)
