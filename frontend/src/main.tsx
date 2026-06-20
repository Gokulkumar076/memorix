import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'rgba(21, 19, 31, 0.95)',
              color: '#f5f4fa',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              backdropFilter: 'blur(12px)',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#0d0c16' } },
            error: { iconTheme: { primary: '#fb923c', secondary: '#0d0c16' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
