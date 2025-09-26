import React, { useMemo, useState } from "react";
import { FileText, Search, Home, Users, Calendar } from "lucide-react";
import { Link } from 'react-router-dom'
import posterData from './data/poster.json'

function caseInsensitiveMatch(query, text) {
  if (!query || !text) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

export default function PosterPage() {
  const [query, setQuery] = useState("");

  const posters = useMemo(() => {
    if (!posterData || !Array.isArray(posterData)) return [];
    
    const allPosters = [];
    
    // Extract posters from the poster data
    for (const posterSection of posterData) {
      if (posterSection.talks && Array.isArray(posterSection.talks)) {
        for (const poster of posterSection.talks) {
          if (poster.title && poster.speakers) {
            allPosters.push({
              title: poster.title.trim(),
              speakers: poster.speakers.map(s => ({
                name: s.name?.trim() || '',
                affiliation: s.affiliation?.trim() || '',
              })).filter(s => s.name.length > 0),
              abstract: poster.abstract?.trim() || '',
              posterCategory: posterSection.minisymposium_title || 'Posters'
            });
          }
        }
      }
    }
    
    return allPosters.sort((a, b) => {
      // Sort by primary speaker name
      const aSpeaker = a.speakers[0]?.name || '';
      const bSpeaker = b.speakers[0]?.name || '';
      return aSpeaker.localeCompare(bSpeaker, undefined, { sensitivity: 'base' });
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return posters;
    return posters.filter((poster) => {
      const searchText = `${poster.title} ${poster.speakers.map(s => `${s.name} ${s.affiliation}`).join(' ')}`;
      return caseInsensitiveMatch(q, searchText);
    });
  }, [query, posters]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">UARK-SIAM-CSS-25 Conference Posters</h1>
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
              to="/participants"
              className="ml-2 text-sm text-blue-700 hover:underline"
              aria-label="View Participants"
            >
              View Participants
            </Link>
          </div>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 opacity-60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posters, speakers or affiliations…"
              className="pl-9 pr-3 py-2 rounded-xl border text-sm shadow-sm w-72"
              aria-label="Search"
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border shadow-sm">
          <div className="p-4 text-sm text-neutral-600 border-b">
            {filtered.length} {filtered.length === 1 ? 'poster' : 'posters'}
          </div>
          <div className="divide-y">
            {filtered.map((poster, i) => (
              <article key={i} className="p-6">
                <header className="mb-4">
                  <h2 className="text-lg font-semibold mb-2 text-neutral-900 leading-tight">
                    {poster.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {poster.speakers.map((speaker, idx) => (
                        <span key={idx}>
                          {speaker.name}
                          {speaker.affiliation ? `, ${speaker.affiliation}` : ''}
                          {idx < poster.speakers.length - 1 ? '; ' : ''}
                        </span>
                      ))}
                    </span>
                  </div>
                </header>
                {poster.abstract && (
                  <section className="prose prose-neutral max-w-none">
                    <div className="text-sm text-neutral-700 leading-relaxed">
                      {poster.abstract}
                    </div>
                  </section>
                )}
                {!poster.abstract && (
                  <div className="text-sm text-neutral-500 italic">
                    Abstract not available
                  </div>
                )}
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-neutral-600">
                {query ? 'No posters found matching your search.' : 'No posters yet.'}
              </div>
            )}
          </div>
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
