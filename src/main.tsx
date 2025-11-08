import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/keep-plus">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tag/:tagName" element={<App />} />
        <Route path="/note/:noteId" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
