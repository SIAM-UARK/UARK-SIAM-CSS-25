import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CalendarClock, Clock, Filter, MapPin, Users, Search, Download, Globe2, Home } from "lucide-react";
import { Link } from 'react-router-dom'
// Load abstracts to auto-add minisymposia not present in sessions
const abstractModules = import.meta.glob('./data/abstract/*.json', { eager: true });
import contributedCsvRaw from './data/contributed_talks.csv?raw'
import Papa from 'papaparse'
import rawSessions from "./sessions.js";

// --- Utilities --------------------------------------------------------------

// Case-insensitive search helper
function caseInsensitiveMatch(query, text) {
  if (!query || !text) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

const fmtTime = (iso, tz) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });

const fmtDay = (iso, tz) => {
  if (!iso) return "";
  // If date-only (YYYY-MM-DD), avoid timezone shifting by anchoring at UTC noon
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number);
    const anchor = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12, 0, 0));
    return anchor.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: tz,
    });
  }
  // For full ISO datetimes, default formatting with timezone
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: tz,
  });
}

function downloadICS(filename, ics) {
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function createICS(ms) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Conference Program//EN",
  ];
  ms.sessions.forEach((s, si) => {
    const uid = `${ms.id}-S${si}@program`;
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`SUMMARY:${ms.title} — Session ${si + 1}`);
    lines.push(`DTSTART:${toICSDate(s.start)}`);
    lines.push(`DTEND:${toICSDate(s.end)}`);
    lines.push(`LOCATION:${escapeICS(ms.room || "TBA")}`);
    lines.push(`DESCRIPTION:Chair: ${escapeICS(s.chair || "TBA")}`);
    lines.push("END:VEVENT");
    s.talks.forEach((t, ti) => {
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}-T${ti}`);
      const spk = t.speakers?.map((p) => p.name).join(", ") || "";
      lines.push(`SUMMARY:${escapeICS(t.title)}${spk ? ` — ${escapeICS(spk)}` : ""}`);
      lines.push(`DTSTART:${toICSDate(t.start)}`);
      lines.push(`DTEND:${toICSDate(t.end)}`);
      lines.push(`LOCATION:${escapeICS(ms.room || "TBA")}`);
      lines.push("END:VEVENT");
    });
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function toICSDate(iso) {
  // Convert ISO string to UTC Zulu format without separators
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeICS(text) {
  return String(text).replaceAll(",", "\\,").replaceAll("\n", "\\n");
}

// Infer session time bounds from session or talks if missing
function inferSessionBounds(session) {
  const starts = [];
  const ends = [];
  if (session?.start) starts.push(new Date(session.start));
  if (session?.end) ends.push(new Date(session.end));
  for (const t of session?.talks || []) {
    if (t?.start) starts.push(new Date(t.start));
    if (t?.end) ends.push(new Date(t.end));
  }
  const start = starts.length ? new Date(Math.min(...starts)) : null;
  const end = ends.length ? new Date(Math.max(...ends)) : null;
  return { start: start ? start.toISOString() : null, end: end ? end.toISOString() : null };
}

// Create .ics for a single session (with its talks)
function createICSForSession(ms, session, sessionIndex) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Conference Program//EN",
  ];

  const { start: sStart, end: sEnd } = inferSessionBounds(session);
  const sid = session.id || `${ms.id}-S${sessionIndex + 1}`;

  lines.push("BEGIN:VEVENT");
  lines.push(`UID:${sid}@program`);
  lines.push(`SUMMARY:${ms.title} — Session ${sessionIndex + 1}`);
  if (sStart) lines.push(`DTSTART:${toICSDate(sStart)}`);
  if (sEnd) lines.push(`DTEND:${toICSDate(sEnd)}`);
  if (ms.room) lines.push(`LOCATION:${escapeICS(ms.room)}`);
  if (session.chair) lines.push(`DESCRIPTION:Chair: ${escapeICS(session.chair)}`);
  lines.push("END:VEVENT");

  (session.talks || []).forEach((t, ti) => {
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${sid}-T${ti}`);
    const spk = t.speakers?.map((p) => p.name).join(", ") || "";
    lines.push(`SUMMARY:${escapeICS(t.title)}${spk ? ` — ${escapeICS(spk)}` : ""}`);
    if (t.start) lines.push(`DTSTART:${toICSDate(t.start)}`);
    if (t.end) lines.push(`DTEND:${toICSDate(t.end)}`);
    if (ms.room) lines.push(`LOCATION:${escapeICS(ms.room)}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// --- UI ---------------------------------------------------------------------
export default function ProgramPage() {
  const [query, setQuery] = useState("");
  const [day, setDay] = useState("all");
  const [tz, setTz] = useState("America/Chicago");

  // Map the real sessions.json into the internal structure expected by the UI
  const programData = useMemo(() => {
    // Temporary override: assign Oct 11, 2025 to all minisymposia
    const TEMP_DAY_OVERRIDE = "2025-10-11";
    // Temporary session time template
    const TEMP_SESSION_START = "2025-10-11T09:00:00-05:00";
    const TEMP_SESSION_END = "2025-10-11T10:30:00-05:00";
    const slugify = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

    // Build a meta map from abstracts (organizers, maybe later room/timezone)
    const absMeta = Object.values(abstractModules).reduce((acc, mod) => {
      const data = mod?.default || mod
      if (!data) return acc
      const title = data.minisymposium_title || data.title
      if (!title) return acc
      const key = slugify(title)
      acc[key] = {
        organizers: data.organizers || [],
      }
      return acc
    }, {})

    const fromSessions = (rawSessions || []).map((ms, i) => {
      const sessionsArray = (ms.sessions && Array.isArray(ms.sessions) && ms.sessions.length > 0)
        ? ms.sessions
        : [{ start: ms.start, end: ms.end, chair: ms.chair, talks: ms.talks }];

      const title = ms.minisymposium_title || ms.title || `Mini‑Symposium ${i + 1}`
      const key = slugify(title)
      const mergedOrganizers = (ms.organizers && ms.organizers.length > 0)
        ? ms.organizers
        : (absMeta[key]?.organizers || [])

      // Derive display day from earliest session/talk start if available
      const extractDate = (iso) => (typeof iso === 'string' && iso.length >= 10) ? iso.slice(0,10) : null
      const sessionDates = []
      for (const s of sessionsArray) {
        if (s?.start) sessionDates.push(extractDate(s.start))
        for (const t of (s?.talks || [])) {
          if (t?.start) sessionDates.push(extractDate(t.start))
        }
      }
      const validDates = sessionDates.filter(Boolean)
      const msDay = validDates.length ? validDates.sort()[0] : null

      return {
        id: ms.id || `MS${i + 1}`,
        title,
        organizers: mergedOrganizers,
        day: msDay || TEMP_DAY_OVERRIDE,
        room: ms.room || null,
        timezone: ms.timezone || "America/Chicago",
        sessions: sessionsArray.map((s, si) => ({
          id: s?.id || `${ms.id || `MS${i + 1}`}-S${si + 1}`,
          start: s?.start || TEMP_SESSION_START,
          end: s?.end || TEMP_SESSION_END,
          chair: s?.chair || null,
          talks: (s?.talks || []).map((t) => ({
            start: t?.start || null,
            end: t?.end || null,
            title: t?.title,
            speakers: t?.speakers || [],
          })),
        })),
      };
    });

    const existingTitles = new Set(fromSessions.map((m) => slugify(m.title)))

    const fromAbstractsOnly = Object.values(abstractModules).flatMap((mod) => {
      const data = mod?.default || mod
      if (!data) return []
      const msTitle = data.minisymposium_title || data.title
      if (!msTitle) return []
      const key = slugify(msTitle)
      if (existingTitles.has(key)) return []
      const slugId = `MS-${key}`
      return [{
        id: slugId,
        title: msTitle,
        organizers: data.organizers || [],
        day: TEMP_DAY_OVERRIDE,
        room: null,
        timezone: "America/Chicago",
        sessions: [
          {
            id: `${slugId}-S1`,
            start: TEMP_SESSION_START,
            end: TEMP_SESSION_END,
            chair: null,
            talks: (data.talks || []).map((t) => ({
              start: null,
              end: null,
              title: t?.title,
              speakers: t?.speakers || [],
            })),
          },
        ],
      }]
    })

    // Parse contributed talks CSV into a minisymposium
    let contributed = null
    if (contributedCsvRaw && contributedCsvRaw.length > 0) {
      const parsed = Papa.parse(contributedCsvRaw, { header: true, skipEmptyLines: true })
      const rows = (parsed?.data || []).filter((r) => (r.Title && r.Title.trim().length > 0))
      if (rows.length > 0) {
        const msTitle = 'Contributed Talks'
        if (!existingTitles.has(slugify(msTitle))) {
          contributed = {
            id: 'CT',
            title: msTitle,
            organizers: [],
            day: TEMP_DAY_OVERRIDE,
            room: null,
            timezone: 'America/Chicago',
            sessions: [
              {
                id: 'CT-S1',
                start: TEMP_SESSION_START,
                end: TEMP_SESSION_END,
                chair: null,
                talks: rows.map((r) => ({
                  title: r.Title?.trim(),
                  speakers: [
                    { name: [r['First Name'], r['Last Name']].filter(Boolean).join(' ').trim(), affiliation: (r.Affiliation || '').trim() },
                  ],
                  start: null,
                  end: null,
                })),
              },
            ],
          }
        }
      }
    }

    const combined = contributed ? [...fromSessions, ...fromAbstractsOnly, contributed] : [...fromSessions, ...fromAbstractsOnly]

    // Assign sequential codes MS1, MS2, ... to minisymposia; keep Contributed Talks as CT
    let msCounter = 1
    return combined.map((ms) => {
      const isContrib = (ms.title || '').trim().toLowerCase() === 'contributed talks'
      const code = isContrib ? (ms.id || 'CT') : `MS${msCounter++}`
      const sessions = (ms.sessions || []).map((s, si) => ({
        ...s,
        id: `${code}-S${si + 1}`,
      }))
      return { ...ms, id: code, sessions }
    })
  }, []);

  const allDays = useMemo(() => {
    const dset = new Set(programData.map((m) => m.day).filter(Boolean));
    return ["all", ...Array.from(dset).sort()];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    return programData
      .filter((ms) => (day === "all" ? true : ms.day === day))
      .map((ms) => ({
        ...ms,
        sessions: ms.sessions.map((s) => ({
          ...s,
          talks: s.talks.filter((t) => {
            if (!q) return true;
            const hay = [t.title, ...(t.speakers || []).map((p) => p.name)].join(" ");
            return caseInsensitiveMatch(q, hay);
          }),
        })),
      }))
      .filter((ms) =>
        q
          ? caseInsensitiveMatch(q, [ms.title, ms.organizers.map((o) => o.name).join(" ")].join(" ")) ||
            ms.sessions.some((s) => s.talks.length > 0)
          : true
      );
  }, [query, day]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">UARK-SIAM-CSS-25 Conference Program</h1>
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
              to="/participants"
              className="ml-2 text-sm text-blue-700 hover:underline"
              aria-label="Go to Participants"
            >
              View Participants
            </Link>
            <Link
              to="/posters"
              className="ml-2 text-sm text-blue-700 hover:underline"
              aria-label="Go to Posters"
            >
              View Posters
            </Link>
          </div>
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4" />
              <select
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm shadow-sm"
                aria-label="Timezone selector"
              >
                <option value="America/Chicago">Central (CT)</option>
                <option value="America/New_York">Eastern (ET)</option>
                <option value="America/Los_Angeles">Pacific (PT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm shadow-sm"
                aria-label="Day filter"
              >
                {allDays.map((d) => (
                  <option key={d} value={d}>
                    {d === "all" ? "All days" : d}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 opacity-60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search talks, speakers, organizers… (case-insensitive)"
                className="pl-9 pr-3 py-2 rounded-xl border text-sm shadow-sm w-64"
                aria-label="Search"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {filtered.map((ms, idx) => (
            <motion.section
              key={ms.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="bg-white rounded-2xl shadow-sm border"
            >
              <div className="p-5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold">
                    <span className="inline-block rounded-full border px-2 py-0.5 text-sm mr-2 bg-neutral-50">
                      {ms.id}
                    </span>
                    {ms.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-600">
                    {ms.day && (
                      <span className="inline-flex items-center gap-1"><CalendarClock className="h-4 w-4" />{fmtDay(ms.day, tz)}</span>
                    )}
                    {ms.room && (
                      <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{ms.room}</span>
                    )}
                    {ms.timezone && (
                      <span className="inline-flex items-center gap-1"><Globe2 className="h-4 w-4" />{ms.timezone}</span>
                    )}
                    {ms.organizers?.length > 0 && (
                      <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />
                        Organizers: {ms.organizers.map((o) => `${o.name}${o.affiliation ? ` (${o.affiliation})` : ""}`).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadICS(`${ms.id}.ics`, createICS(ms))}
                    className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-sm hover:bg-neutral-50"
                    aria-label="Download calendar"
                  >
                    <Download className="h-4 w-4" /> Export .ics
                  </button>
                </div>
              </div>

              <div className="p-5 grid gap-4">
                {ms.sessions.map((s, si) => (
                  <div key={si} className="rounded-xl border bg-neutral-50">
                  <div className="p-4 flex flex-wrap items-center gap-4 border-b">
                    {(() => {
                      const { start, end } = inferSessionBounds(s);
                      if (!start && !end) return null;
                      const sameDay = start && end && (new Date(start).toDateString() === new Date(end).toDateString());
                      return (
                        <div className="inline-flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>
                            {start ? `${fmtDay(start, tz)} ${fmtTime(start, tz)}` : ""}
                            {(start && end) ? " – " : ""}
                            {end ? `${sameDay ? "" : fmtDay(end, tz) + " "}${fmtTime(end, tz)}` : ""}
                          </span>
                        </div>
                      );
                    })()}
                    {s.chair && (
                      <div className="text-sm text-neutral-600">Chair: {s.chair}</div>
                    )}
                    <div className="ml-auto">
                      <button
                        onClick={() => downloadICS(`${ms.id}-${s.id || 'session'}.ics`, createICSForSession(ms, s, si))}
                        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-sm hover:bg-neutral-100"
                        aria-label="Download session calendar"
                      >
                        <Download className="h-4 w-4" /> Session .ics
                      </button>
                    </div>
                  </div>
                    <ul className="divide-y">
                      {s.talks.map((t, ti) => {
                        const slugify = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                        const slug = slugify(t.title)
                        const msSlug = slugify(ms.title)
                        return (
                          <li key={ti} className="p-4 bg-white hover:bg-neutral-50 transition">
                            <Link to={`/talk/${slug}?ms=${msSlug}`} className="block">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div>
                                  {(t.start || t.end) && (
                                    <div className="text-sm text-neutral-600">
                                      {t.start ? fmtTime(t.start, tz) : ""}
                                      {(t.start && t.end) ? " – " : ""}
                                      {t.end ? fmtTime(t.end, tz) : ""}
                                    </div>
                                  )}
                                  <div className="font-medium text-blue-700 underline-offset-2 hover:underline">{t.title}</div>
                                  {t.speakers?.length > 0 && (
                                    <div className="text-sm text-neutral-700">
                                      {t.speakers.map((p, i) => (
                                        <span key={i}>
                                          {p.name}
                                          {p.affiliation ? ` (${p.affiliation})` : ""}
                                          {i < t.speakers.length - 1 ? ", " : ""}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.section>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-neutral-600 py-16">
              No results. Try a different day or search term.
            </div>
          )}
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

/* --------------------------------------------------------------------------
HOW TO USE THIS COMPONENT

1) Replace SAMPLE_DATA with your own data. A simple JSON export from your
   spreadsheet will work if you map columns to the fields in SAMPLE_DATA.
   Minimal required fields per talk: start, end, title, (optional speakers[])

2) Timezone handling: store times in ISO 8601 with offset (e.g., 2025-10-17T09:00:00-05:00).
   The selector lets attendees view in their own timezone (client side).

3) Export .ics: Each mini-symposium can be downloaded as a calendar file
   containing a VEVENT for the session and each talk. You can also add per-talk
   download buttons similarly if desired.

4) Accessibility: All interactive elements have labels. Headings are ordered.
   Ensure color contrast meets WCAG AA if you tweak styles.

5) Styling: Uses Tailwind utility classes for a clean, responsive layout.
   You can replace with your design system. Cards scale nicely on mobile.

6) Deployment: Place this component in your site/app. If you use plain HTML,
   I can provide a static HTML version with minimal JS—just ask.

7) Data at larger scale: If you have many mini-symposia over multiple days,
   consider grouping by day first, then by mini-symposium. The same component
   logic applies; use a top-level array per day.
-------------------------------------------------------------------------- */
