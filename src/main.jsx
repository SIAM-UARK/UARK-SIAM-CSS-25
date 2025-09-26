import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import TalkPage from './TalkPage.jsx'
import ParticipantsPage from './ParticipantsPage.jsx'
import PosterPage from './PosterPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/participants" element={<ParticipantsPage />} />
        <Route path="/posters" element={<PosterPage />} />
        <Route path="/talk/:slug" element={<TalkPage />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
