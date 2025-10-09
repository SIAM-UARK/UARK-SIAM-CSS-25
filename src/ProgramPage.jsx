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
        // Exclude talks that were moved into minisymposia sessions (avoid duplication)
        const movedTitles = new Set([
          'Physics-Informed Diffusion Models for Data Augmentation in Metal Additive Manufacturing',
          'Inf-Sup Neural Networks for Solving High-Dimensional PDE Problems',
          'A Generalized Energy-Based Adaptive Gradient Method for Optimization',
          'Fast and Positive fPINNs for Time-Fractional Convection-Diffusion Equations via MFL1 Schemes',
        ].map((t) => t.trim()))
        const movedSpeakers = new Set(['Yingli Li'].map((s) => s.trim()))
        const filteredRows = rows.filter((r) => {
          const title = (r.Title || '').trim()
          const name = [r['First Name'], r['Last Name']].filter(Boolean).join(' ').trim()
          if (movedTitles.has(title)) return false
          if (movedSpeakers.has(name)) return false
          return true
        })
        const msTitle = 'Contributed Talks'
        if (!existingTitles.has(slugify(msTitle))) {
          // Build 16 talks and split into 4 sessions with 20-minute slots
          const talks = filteredRows
            .map((r) => ({
              title: r.Title?.trim(),
              speakers: [
                { name: [r['First Name'], r['Last Name']].filter(Boolean).join(' ').trim(), affiliation: (r.Affiliation || '').trim() },
              ],
              start: null,
              end: null,
            }))
            .slice(0, 16)

          const slotTimes = [
            // Saturday morning 10:10–11:30
            [
              ['2025-10-11T10:10:00-05:00', '2025-10-11T10:30:00-05:00'],
              ['2025-10-11T10:30:00-05:00', '2025-10-11T10:50:00-05:00'],
              ['2025-10-11T10:50:00-05:00', '2025-10-11T11:10:00-05:00'],
              ['2025-10-11T11:10:00-05:00', '2025-10-11T11:30:00-05:00'],
            ],
            // Saturday 3:30–4:50 pm
            [
              ['2025-10-11T15:30:00-05:00', '2025-10-11T15:50:00-05:00'],
              ['2025-10-11T15:50:00-05:00', '2025-10-11T16:10:00-05:00'],
              ['2025-10-11T16:10:00-05:00', '2025-10-11T16:30:00-05:00'],
              ['2025-10-11T16:30:00-05:00', '2025-10-11T16:50:00-05:00'],
            ],
            // Saturday 5:00–6:20 pm
            [
              ['2025-10-11T17:00:00-05:00', '2025-10-11T17:20:00-05:00'],
              ['2025-10-11T17:20:00-05:00', '2025-10-11T17:40:00-05:00'],
              ['2025-10-11T17:40:00-05:00', '2025-10-11T18:00:00-05:00'],
              ['2025-10-11T18:00:00-05:00', '2025-10-11T18:20:00-05:00'],
            ],
            // Sunday 10:10–11:30 am
            [
              ['2025-10-12T10:10:00-05:00', '2025-10-12T10:30:00-05:00'],
              ['2025-10-12T10:30:00-05:00', '2025-10-12T10:50:00-05:00'],
              ['2025-10-12T10:50:00-05:00', '2025-10-12T11:10:00-05:00'],
              ['2025-10-12T11:10:00-05:00', '2025-10-12T11:30:00-05:00'],
            ],
          ]

          // Create three separate contributed talk sessions
          const ct1 = {
            id: 'CT1',
            title: 'Contributed Talks 1',
            organizers: [],
            day: '2025-10-11',
            room: 'SCEN 406',
            timezone: 'America/Chicago',
            sessions: [{
              id: 'CT1-S1',
              start: '2025-10-11T10:10:00-05:00',
              end: '2025-10-11T11:30:00-05:00',
              chair: null,
              room: 'SCEN 406',
              talks: talks.slice(0, 4).map((t, j) => ({
                ...t,
                start: slotTimes[0][j][0],
                end: slotTimes[0][j][1],
              })).filter((t) => t.title),
            }]
          }

          const ct2 = {
            id: 'CT2',
            title: 'Contributed Talks 2',
            organizers: [],
            day: '2025-10-11',
            room: 'SCEN 405',
            timezone: 'America/Chicago',
            sessions: [{
              id: 'CT2-S1',
              start: '2025-10-11T17:00:00-05:00',
              end: '2025-10-11T18:20:00-05:00',
              chair: null,
              room: 'SCEN 405',
              talks: talks.slice(4, 8).map((t, j) => ({
                ...t,
                start: slotTimes[2][j][0],
                end: slotTimes[2][j][1],
              })).filter((t) => t.title),
            }]
          }

          const ct3 = {
            id: 'CT3',
            title: 'Contributed Talks 3',
            organizers: [],
            day: '2025-10-11',
            room: 'SCEN 205',
            timezone: 'America/Chicago',
            sessions: [{
              id: 'CT3-S1',
              start: '2025-10-11T17:00:00-05:00',
              end: '2025-10-11T18:20:00-05:00',
              chair: null,
              room: 'SCEN 205',
              talks: talks.slice(8, 12).map((t, j) => ({
                ...t,
                start: slotTimes[2][j][0],
                end: slotTimes[2][j][1],
              })).filter((t) => t.title),
            }]
          }

          // Return array of three contributed talk sessions
          contributed = [ct1, ct2, ct3]
        }
      }
    }

    const combined = contributed ? [...fromSessions, ...fromAbstractsOnly, ...contributed] : [...fromSessions, ...fromAbstractsOnly]

    // Assign sequential codes MS1, MS2, ... to minisymposia; keep Contributed Talks as CT1, CT2, CT3
    let msCounter = 1
    return combined.map((ms) => {
      const isContrib = (ms.title || '').trim().toLowerCase().includes('contributed talks')
      const code = isContrib ? ms.id : `MS${msCounter++}`
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
        {/* Plenary Speakers Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Plenary Speakers</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {/* Saturday 8:30am - Beatrice Riviere */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-md border-2 border-blue-200 p-6"
            >
              <div className="flex items-center gap-2 text-blue-700 mb-3">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Saturday, 8:30 AM</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-900">Prof. Beatrice Riviere</h3>
              <p className="text-lg font-medium text-blue-900 mb-3">Computational Methods for Two-Phase Flows at the Pore Scale</p>
              <details className="text-sm text-neutral-700">
                <summary className="cursor-pointer font-medium text-blue-700 hover:text-blue-900">View Abstract</summary>
                <p className="mt-2 leading-relaxed">
                  Modeling multicomponent flows in porous media is important for many applications relevant to the energy and the environment. Advances in pore-scale imaging, increasing availability of computational resources, and developments in numerical algorithms have started rendering direct pore-scale numerical simulations of multiphase flow in pore structures feasible. This talk presents stable and convergent discretizations of coupled flow and phase-field models for systems of two-phase flows in digital rocks. The three-dimensional computational domain is the union of voxels, obtained from the micro-CT scanning of rock samples. The solid rock structure is fixed and fluid flows through the connected pores. The mathematical model is based on coupling the Cahn-Hilliard equations with the Navier-Stokes equations. Wettability on rock-fluid interfaces is accounted for via an energy-penalty based wetting (contact-angle) boundary condition. Spatial discretization is based on the interior penalty discontinuous Galerkin methods. Time discretization utilizes a decoupled splitting approach. Both theory and application of the proposed methods to model flows in porous structures are discussed. Extension of the diffuse interface method for a system of two-phase flows with soluble surfactant is introduced.
                </p>
              </details>
            </motion.div>

            {/* Saturday 1:30pm - Xiu Ye */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-md border-2 border-green-200 p-6"
            >
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Saturday, 1:30 PM</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-900">Prof. Xiu Ye</h3>
              <p className="text-lg font-medium text-green-900 mb-3">Development of Discontinuous Finite Element Methods with Applications</p>
              <details className="text-sm text-neutral-700">
                <summary className="cursor-pointer font-medium text-green-700 hover:text-green-900">View Abstract</summary>
                <p className="mt-2 leading-relaxed">
                  Finite element methods (FEM) based on discontinuous approximations have been an active area of research over the past few decades, offering increased flexibility and robustness for a variety of partial differential equations. In this talk, I will present an overview of key developments in discontinuous FEM, including their connections to classical continuous FEM. Several prominent discontinuous methods will be discussed, such as the Discontinuous Galerkin (DG) method, Hybridizable Discontinuous Galerkin (HDG) method, and the Weak Galerkin (WG) method. The presentation will also highlight applications of these methods to problems such as convection–diffusion equations, the Stokes problem, and Brinkman equations. In these examples, discontinuous FEMs demonstrate significant advantages in terms of accuracy, stability, and adaptability to complex geometries.
                </p>
              </details>
            </motion.div>

            {/* Sunday 9:00am - Irena Lasiecka */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 }}
              className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-md border-2 border-purple-200 p-6"
            >
              <div className="flex items-center gap-2 text-purple-700 mb-3">
                <Clock className="h-5 w-5" />
                <span className="font-semibold">Sunday, 9:00 AM</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-900">Prof. Irena Lasiecka</h3>
              <p className="text-lg font-medium text-purple-900 mb-3">Stability in Non-Dissipative Hyperbolic Systems with Nonlinear Feedback Control</p>
              <details className="text-sm text-neutral-700">
                <summary className="cursor-pointer font-medium text-purple-700 hover:text-purple-900">View Abstract</summary>
                <p className="mt-2 leading-relaxed">
                  Long time behavior of a nonlinear PDE system subject to non-linear and nonlocal damping and unstable, unrestricted perturbations is considered. The latter leads to non-dissipative and non-conservative character of the resulting dynamics. A case study may include Navier Stokes fluid in a neighborhood of unstable equilibrium or civil constructions such as bridges/buildings under unstable flow of gas. In order to forge long time coherent structure and resulting stability, nonlinear feedback control in a form of nonlinear damping is applied.
                  The important features-consequences of the model are: (i) the dynamical system does not have a gradient structure, (ii) the nonlinearity of the damping leads to an "overdamping" effect which than leads to the so called stability "paradox" where "more" is not "better". This prevents applicability of known methods for proving attractiveness [both weak and strong] properties of related dynamics.. In order to contend with the difficulties, new methodology based on barrier's method along with related optimization is developed. The ultimate results provide an existence of global attractor in a finite energy space which, under suitable conditions, is also smooth and finite dimensional. Thus, PDE hyperbolic unstable dynamics is reduced asymptotically to a finite dimensional system. In the case of unstable equilibria, methods of feedback control theory are applied to forge local stability.
                </p>
              </details>
            </motion.div>
          </div>
        </section>

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
