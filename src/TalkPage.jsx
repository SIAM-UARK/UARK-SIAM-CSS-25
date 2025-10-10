import { useMemo } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Calendar, Users } from 'lucide-react'
import contributedCsvRaw from './data/contributed_talks.csv?raw'
import Papa from 'papaparse'

// Load all abstract bundles eagerly
const modules = import.meta.glob('./data/abstract/*.json', { eager: true })

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function TalkPage() {
  const { slug } = useParams()
  const location = useLocation()
  const msParam = useMemo(() => new URLSearchParams(location.search).get('ms') || null, [location.search])

  const talkData = useMemo(() => {
    // Build an index of talks by slug across all minisymposia files (JSON)
    const all = []
    for (const [path, mod] of Object.entries(modules)) {
      const data = mod?.default || mod
      if (!data) continue
      const msTitle = data.minisymposium_title || data.title
      for (const t of (data.talks || [])) {
        all.push({
          msTitle,
          title: t.title,
          speakers: t.speakers || [],
          abstract: t.abstract || '',
          slug: slugify(t.title),
          cancelled: t.cancelled || false,
        })
      }
    }

    // Add contributed talks from CSV so their abstracts appear
    if (contributedCsvRaw && contributedCsvRaw.length > 0) {
      const parsed = Papa.parse(contributedCsvRaw, { header: true, skipEmptyLines: true })
      const rows = (parsed?.data || []).filter((r) => (r.Title && r.Title.trim().length > 0))
      for (const r of rows) {
        const title = (r.Title || '').trim()
        if (!title) continue
        const name = [r['First Name'], r['Last Name']].filter(Boolean).join(' ').trim()
        const affiliation = (r.Affiliation || '').trim()
        const abstract = (r.Abstract || '').trim()
        const presentationType = (r['Which type of presentation are you submitting?'] || '').trim()
        const cancelled = presentationType.includes('CANCELLED')
        all.push({
          msTitle: 'Contributed Talks',
          title,
          speakers: name ? [{ name, affiliation }] : [],
          abstract,
          slug: slugify(title),
          cancelled,
        })
      }
    }

    // Prefer a match that also matches the minisymposium slug if provided
    const candidates = all.filter((t) => t.slug === slug)
    if (candidates.length === 0) return null
    if (!msParam) return candidates[0]
    const exact = candidates.find((t) => slugify(t.msTitle || '') === msParam)
    return exact || candidates[0]
  }, [slug, msParam])

  if (!talkData) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to program
          </Link>
          <div className="mt-6 rounded-2xl bg-white border shadow-sm p-6">
            <div className="text-neutral-700">Talk not found.</div>
          </div>
        </div>
      </div>
    )
  }

  const { msTitle, title, speakers, abstract, cancelled } = talkData

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to program
        </Link>
        <article className="mt-6 rounded-2xl bg-white border shadow-sm p-6">
          <header className="mb-4">
            <div className="flex items-start gap-3 mb-2">
              <h1 className="text-2xl font-semibold flex-1">{title}</h1>
              {cancelled && (
                <span className="text-xs px-2 py-1 rounded-full border bg-red-50 border-red-200 text-red-800 font-medium">
                  CANCELLED
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600">
              {msTitle && (
                <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{msTitle}</span>
              )}
              {speakers?.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {speakers.map((p, i) => (
                    <span key={i}>
                      {p.name}{p.affiliation ? ` (${p.affiliation})` : ''}{i < speakers.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </header>
          <section className="prose prose-neutral max-w-none">
            {abstract ? (
              abstract.split(/\n\n+/).map((para, i) => (
                <p key={i} className="leading-7 text-neutral-800">{para}</p>
              ))
            ) : (
              <p className="text-neutral-700">Abstract not available.</p>
            )}
          </section>
        </article>
      </div>
    </div>
  )
}
