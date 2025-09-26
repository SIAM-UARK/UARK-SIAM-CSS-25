import React, { useMemo, useState } from "react";
import { Users, Search, Home } from "lucide-react";
import { Link } from 'react-router-dom'
import participantsData from './data/participants.json'

function caseInsensitiveMatch(query, text) {
  if (!query || !text) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

export default function ParticipantsPage() {
  const [query, setQuery] = useState("");

  const speakers = useMemo(() => {
    const arr = Array.isArray(participantsData) ? participantsData : []
    return arr
      .map((s) => ({
        name: (s?.name || '').trim(),
        affiliation: (s?.affiliation || '').trim(),
        email: (s?.email || '').trim(),
        plenary: Boolean(s?.plenary),
        localOrganizer: Boolean(s?.localOrganizer),
      }))
      .filter((s) => s.name.length > 0)
      .sort((a, b) => {
        if (a.plenary !== b.plenary) return a.plenary ? -1 : 1
        if (a.localOrganizer !== b.localOrganizer) return a.localOrganizer ? -1 : 1
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      })
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim()
    if (!q) return speakers
    return speakers.filter((s) => caseInsensitiveMatch(q, `${s.name} ${s.affiliation}`))
  }, [query, speakers])

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">UARK-SIAM-CSS-25 Conference Participants</h1>
            <a
              href="https://siam.uark.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
              title="Go to UARK SIAM main website"
              aria-label="Go to UARK SIAM main website"
            >
              <Home className="h-4 w-4 text-blue-600" />
            </a>
            <Link
              to="/"
              className="ml-2 text-sm text-blue-700 hover:underline"
              aria-label="Go to Program"
            >
              View Program
            </Link>
            <Link
              to="/posters"
              className="ml-2 text-sm text-blue-700 hover:underline"
              aria-label="View Posters"
            >
              View Posters
            </Link>
          </div>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 opacity-60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search speakers or affiliations…"
              className="pl-9 pr-3 py-2 rounded-xl border text-sm shadow-sm w-72"
              aria-label="Search"
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border shadow-sm">
          <div className="p-4 text-sm text-neutral-600 border-b">
            {filtered.length} {filtered.length === 1 ? 'participant' : 'participants'}
          </div>
          <ul className="divide-y">
            {filtered.map((s, i) => (
              <li key={i} className="p-4">
                <div className="font-medium flex items-center gap-2">
                  <span>{s.name}</span>
                  {s.plenary && (
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-amber-50 border-amber-200 text-amber-800">Plenary</span>
                  )}
                  {!s.plenary && s.localOrganizer && (
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-50 border-blue-200 text-blue-800">Local Organizer</span>
                  )}
                </div>
                {s.affiliation && (
                  <div className="text-sm text-neutral-700">{s.affiliation}</div>
                )}
                {s.email && (
                  <div className="text-sm text-neutral-600">
                    <a className="text-blue-700 hover:underline" href={`mailto:${s.email}`}>{s.email}</a>
                  </div>
                )}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="p-8 text-center text-neutral-600">No speakers yet.</li>
            )}
          </ul>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-10 text-sm text-neutral-500">
        <div className="text-center space-y-2">
          <div className="text-base font-medium text-neutral-700">The 10th Annual Meeting of SIAM CSS at the University of Arkansas</div>
          <div>© {new Date().getFullYear()} The Department of Mathematical Sciences at the University of Arkansas. </div>
        </div>
      </footer>
    </div>
  );
}

