import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary/index.ts'
import { logger } from './services/logger.ts'

// Log app initialization
logger.info('Keep Plus application starting', { version: '1.0.0' }, 'main');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename="/keep-plus">
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/tag/:tagName" element={<App />} />
          <Route path="/note/:noteId" element={<App />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
