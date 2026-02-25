import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { AppProvider } from './context/AppContext'
import './index.css'
import App from './App.jsx'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function ConfigErrorScreen() {
  return (
    <div className="min-h-screen grid place-items-center px-4">
      <div className="max-w-lg w-full rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-700">Configuration required</h1>
        <p className="text-sm text-red-700 mt-2">
          Missing <code>VITE_CLERK_PUBLISHABLE_KEY</code>. Add it in your deployment environment and redeploy.
        </p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <BrowserRouter>
          <AppProvider>
            <App />
          </AppProvider>
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <ConfigErrorScreen />
    )}
  </StrictMode>,
)
