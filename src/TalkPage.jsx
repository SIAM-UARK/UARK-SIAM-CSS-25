import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Users } from 'lucide-react'

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

  const talkData = useMemo(() => {
    // Build an index of talks by slug across all minisymposia files
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
        })
      }
    }
    const match = all.find((t) => t.slug === slug)
    return match || null
  }, [slug])

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

  const { msTitle, title, speakers, abstract } = talkData

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to program
        </Link>
        <article className="mt-6 rounded-2xl bg-white border shadow-sm p-6">
          <header className="mb-4">
            <h1 className="text-2xl font-semibold mb-2">{title}</h1>
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

