import React from "react";
import { CalendarDays, Clock3, Home, MapPin, NotebookText } from "lucide-react";
import { Link } from "react-router-dom";

const eventFacts = [
  { label: "Date", value: "To be announced" },
  { label: "Venue", value: "To be announced" },
  { label: "Registration", value: "Details will be posted here once confirmed" },
];

const scheduleSections = [
  {
    title: "Opening",
    rows: [
      { time: "8:20 - 8:30 AM", session: "Registration" },
      { time: "8:30 - 8:40 AM", session: "Opening Remarks" },
    ],
  },
  {
    title: "Morning Session",
    rows: [
      {
        time: "8:40 - 9:40 AM",
        session: "Plenary Talk 1",
        speaker: "Xu Zhang",
        affiliation: "Oklahoma State University",
        href: "https://math.okstate.edu/people/xzhang/",
      },
      { time: "9:40 - 9:50 AM", session: "Break / Transition" },
      { time: "9:50 - 10:20 AM", session: "Student Talk 1" },
      { time: "10:20 - 10:50 AM", session: "Student Talk 2" },
      { time: "10:50 - 11:00 AM", session: "Break" },
      { time: "11:00 - 11:30 AM", session: "Student Talk 3" },
      {
        time: "11:30 AM - 12:30 PM",
        session: "Plenary Talk 2",
        speaker: "Zhuoran Wang",
        affiliation: "University of Kansas",
        href: "https://mathematics.ku.edu/people/zhuoran-wang",
        talkTitle: "Poroelastic fluid-solid coupling: Numerical methods and applications",
        abstract:
          "Biot’s theory of poroelasticity provides a fundamental framework for modeling the mechanical behavior of fluid-solid interaction in porous media. This theory is central to diverse fields, including geomechanics, biomechanics, petroleum engineering, and hydrology. Despite its broad applicability, several major challenges persist in numerical modeling, including the design of stable finite element spaces, the treatment of heterogeneous physical parameters, and the efficient numerical solution of large, indefinite algebraic systems. In this talk, we present recent advances in numerical methods that address these challenges through the development of stable, parameter-free finite element methods and parameter-robust preconditioning strategies. We introduce flexible finite element spaces that are stable, locking-free and penalty-free, while achieving optimal-order convergence. In addition, we develop parameter-robust and efficient inexact block Schur complement preconditioners for efficient solution of fluid-solid interaction problems. Finally, we verify the effectiveness of the developed methods through real-world applications, including biomechanical simulations of spinal cord dynamics relevant to the study of syringomyelia. These results demonstrate the potential of advanced poroelastic modeling techniques to provide reliable and computationally scalable tools for complex multiphysics systems.",
      },
    ],
  },
  {
    title: "Lunch",
    rows: [{ time: "12:30 - 2:00 PM", session: "Lunch (1.5 hr)" }],
  },
  {
    title: "Afternoon Session",
    rows: [
      { time: "2:00 - 2:30 PM", session: "Student Talk 4" },
      { time: "2:30 - 3:00 PM", session: "Student Talk 5" },
      { time: "3:00 - 3:10 PM", session: "Break" },
      {
        time: "3:10 - 4:10 PM",
        session: "Plenary Talk 3",
        speaker: "Shuang Liu",
        affiliation: "University of North Texas",
        href: "https://sites.math.unt.edu/~shuangliu/",
      },
      { time: "4:10 - 4:30 PM", session: "Student Talk 6" },
    ],
  },
];

const summaryItems = [
  "Plenary talks: 3",
  "Student talks: 6",
  "Opening remarks included",
  "Lunch break: 1.5 hours",
  "Conference end time: 4:30 PM",
];

function SectionTable({ title, rows }) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-neutral-200 bg-neutral-100 px-6 py-4">
        <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="divide-y divide-neutral-200">
        {rows.map((row) => (
          <div
            key={`${title}-${row.time}-${row.session}`}
            className="grid gap-2 px-6 py-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-center"
          >
            <div className="text-sm font-medium text-neutral-600">{row.time}</div>
            <div>
              <div className="text-base text-neutral-900">{row.session}</div>
              {row.speaker && (
                <div className="mt-1 text-sm text-neutral-600">
                  <a
                    href={row.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {row.speaker}
                  </a>
                  {row.affiliation ? `, ${row.affiliation}` : ""}
                </div>
              )}
              {row.talkTitle && (
                <div className="mt-2 text-sm font-medium text-neutral-800">{row.talkTitle}</div>
              )}
              {row.abstract && (
                <details className="mt-2 text-sm text-neutral-700">
                  <summary className="cursor-pointer font-medium text-blue-700 hover:text-blue-900">
                    View Abstract
                  </summary>
                  <p className="mt-3 leading-7">{row.abstract}</p>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProgramPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">SIAM-CSS Student Conference 2026</h1>
            <a
              href="https://siam.uark.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 transition-colors duration-200 hover:bg-blue-200"
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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8 rounded-[2rem] border border-neutral-200 bg-white px-6 py-8 shadow-sm md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Student Meeting Overview
              </p>
              <h2 className="mb-4 text-4xl font-semibold tracking-tight text-neutral-950">
                A focused day of student talks, plenary lectures, and community building.
              </h2>
              <p className="text-lg leading-8 text-neutral-700">
                The student conference homepage is now centered on a single-day program with a clear schedule,
                minimal navigation, and room to add final venue and registration details later.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:max-w-xl lg:grid-cols-1 lg:min-w-[320px]">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-800">
                  <Clock3 className="h-4 w-4" />
                  Time Window
                </div>
                <div className="text-base font-semibold text-blue-950">8:20 AM - 4:30 PM</div>
              </div>
              {eventFacts.map((fact) => (
                <div key={fact.label} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4">
                  <div className="mb-1 flex items-center gap-2 text-sm font-medium text-neutral-700">
                    {fact.label === "Date" && <CalendarDays className="h-4 w-4" />}
                    {fact.label === "Venue" && <MapPin className="h-4 w-4" />}
                    {fact.label === "Registration" && <NotebookText className="h-4 w-4" />}
                    {fact.label}
                  </div>
                  <div className="text-sm leading-6 text-neutral-900">{fact.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-neutral-950">Full Schedule</h2>
              <p className="mt-2 text-neutral-600">A simple agenda for the upcoming student conference.</p>
            </div>
          </div>
          <div className="grid gap-6">
            {scheduleSections.map((section) => (
              <SectionTable key={section.title} title={section.title} rows={section.rows} />
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white px-6 py-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-semibold text-neutral-950">Summary</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {summaryItems.map((item) => (
              <div key={item} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm font-medium text-neutral-800">
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-500">
        <div className="space-y-2 text-center">
          <div className="text-base font-medium text-neutral-700">
            SIAM-CSS Student Conference 2026 at the University of Arkansas
          </div>
          <div>© {new Date().getFullYear()} The Department of Mathematical Sciences at the University of Arkansas.</div>
        </div>
      </footer>
    </div>
  );
}
