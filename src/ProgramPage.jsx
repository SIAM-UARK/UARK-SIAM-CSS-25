import React from "react";
import { CalendarDays, Clock3, MapPin, NotebookText } from "lucide-react";
import participantsData from "./data/participants.json";

const eventFacts = [
  { label: "Date", value: "8:30 AM April 4, 2026" },
  { label: "Venue", value: "SECN 408, University of Arkansas, Fayetteville" },
  { label: "Registration", value: "Details will be posted here once confirmed" },
];

const scheduleSections = [
  {
    title: "Opening",
    rows: [
      { time: "7:30 - 8:00 AM", session: "Registration" },
      { time: "8:00 - 8:10 AM", session: "Opening Remarks" },
    ],
  },
  {
    title: "Morning Session",
    rows: [
      {
        time: "8:10 - 9:10 AM",
        session: "Plenary Talk 1",
        speaker: "Xu Zhang",
        affiliation: "Oklahoma State University",
        href: "https://math.okstate.edu/people/xzhang/",
      },
      {
        time: "9:10 - 9:35 AM",
        session: "Student Talk 1",
        speaker: "Joie Lea Murorunkwere",
        affiliation: "University of Arkansas at Little Rock",
        talkTitle: "A MODEL OF AN ONLINE SOCIAL NETWORK (OSN)",
        abstract:
          "We introduce a new epidemic framework to model the adoption and abandonment dynamics of users (SPIR) on online social networks (OSN), with special emphasis on the novel compartment pauci-engaged. Pauci-engaged individuals have been exposed to an invitation to OSN, but remain undecided about joining, reflecting real-world hesitation and trial behaviors. Building on the infectious-recovery dynamics studied by Chen, Kong, and Wang (2021), we derive the basic reproduction number R0 and establish threshold conditions for the stability of both the information-free (user-free) equilibrium and a unique endemic equilibrium. Local stability analysis using the Jacobian and global stability via Lyapunov functions show that when R0 < 1, the OSN fails to attract a self-sustaining user base, while for R0 > 1, sustained network engagement emerges. Our findings highlight the pivotal role of the decision-making phase in the growth of the digital platform and offer actionable insights to optimize user recruitment and retention strategies in coexisting OSNs.",
      },
      {
        time: "9:35 - 10:00 AM",
        session: "Student Talk 2",
        speaker: "James Burton",
        affiliation: "University of Arkansas",
        talkTitle:
          "Simulations of two-dimensional single-mode Rayleigh-Taylor Instability using front-tracking/ghost-fluid method: comparison to experiments and theory",
        abstract:
          "The Rayleigh-Taylor Instability (RTI) is a ubiquitous fluid-flow process that occurs across a wide range of scales and applications, from geological changes unfolding over years and spanning miles, to events lasting only a few nanoseconds in millimeter-scale regions during Inertial Confinement Fusion. The importance of RTI in a wide range of fields has made capturing features such as interface profiles, bubble/spike penetration and velocity fields a subject of study in experiments, numerical simulations, and theory. In the present work, two-dimensional single-mode RTI is simulated using an accurate and robust front-tracking/ghost-fluid method (FT/GFM) with high-order weighted essentially non-oscillatory (WENO) scheme. We compare our numerical results with the single-mode RTI experiments of Renoult, Rosenblatt and Carles (2015). We further show the velocity vector fields for the bubble and spike in the linear and nonlinear regimes are consistent with the theory for the single wavelength perturbation.",
      },
      { time: "10:00 - 10:30 AM", session: "Break / Rest" },
      {
        time: "10:30 AM - 11:30 AM",
        session: "Plenary Talk 2",
        speaker: "Zhuoran Wang",
        affiliation: "University of Kansas",
        href: "https://mathematics.ku.edu/people/zhuoran-wang",
        talkTitle: "Poroelastic fluid-solid coupling: Numerical methods and applications",
        abstract:
          "Biot’s theory of poroelasticity provides a fundamental framework for modeling the mechanical behavior of fluid-solid interaction in porous media. This theory is central to diverse fields, including geomechanics, biomechanics, petroleum engineering, and hydrology. Despite its broad applicability, several major challenges persist in numerical modeling, including the design of stable finite element spaces, the treatment of heterogeneous physical parameters, and the efficient numerical solution of large, indefinite algebraic systems. In this talk, we present recent advances in numerical methods that address these challenges through the development of stable, parameter-free finite element methods and parameter-robust preconditioning strategies. We introduce flexible finite element spaces that are stable, locking-free and penalty-free, while achieving optimal-order convergence. In addition, we develop parameter-robust and efficient inexact block Schur complement preconditioners for efficient solution of fluid-solid interaction problems. Finally, we verify the effectiveness of the developed methods through real-world applications, including biomechanical simulations of spinal cord dynamics relevant to the study of syringomyelia. These results demonstrate the potential of advanced poroelastic modeling techniques to provide reliable and computationally scalable tools for complex multiphysics systems.",
      },
      {
        time: "11:30 - 11:55 AM",
        session: "Student Talk 3",
        speaker: "Bryan Haris",
        affiliation: "University of Missouri-Kansas City",
        talkTitle:
          "Leveraging NCBI Genomic Metadata for Epidemiological Insights: Example of Enterobacterales",
        abstract:
          "Numerous studies have utilized NCBI data for genomic analysis, gene annotation, and identifying disease-associated variants, yet NCBI's epidemiological potential remains underexplored. This study demonstrates how NCBI datasets can be systematically leveraged to extract and interpret infectious disease patterns across spatial and temporal dimensions. Using Enterobacterales as a case study, we analyzed over 477,000 genomic records and metadata, including collection date, location, host species, and isolation source. We compared trends of Escherichia coli and Salmonella in NCBI data with CDC's National Outbreak Reporting System (NORS). While both datasets showed consistent seasonal peaks and foodborne sources, NCBI data revealed broader host species (e.g., wildlife, environmental reservoirs), greater isolate diversity, and finer spatial-temporal resolution. These insights were enabled by our open-source Python package, EpiNCBI_V1, developed for real-time downloading, filtering, and cleaning of pathogen genomic metadata from NCBI. This work highlights the value of integrating genomic repositories into public health analytics to enhance surveillance, outbreak detection, and cross-species transmission tracking globally.",
      },
      {
        time: "11:55 AM - 12:20 PM",
        session: "Student Talk 4",
        speaker: "Priscilla Owusu Sekyere",
        affiliation: "University of Missouri-Kansas City",
        talkTitle:
          "A Comparative Study of Machine Learning and Physics-Informed Neural Networks for Tumor Growth Modeling",
        abstract:
          "Classical mathematical models, such as reaction-diffusion systems and ordinary differential equations (ODEs), provide strong mechanistic insight into tumor progression but often struggle with predictive accuracy. On the other hand, purely data-driven machine learning approaches achieve high predictive performance but often lack biological interpretability and consistency. Our work proposes a Physics-Informed Neural Network (PINN) framework that integrates mechanistic tumor growth models with data-driven learning to address these limitations in vascular and lung cancer modeling. The approach embeds tumor-immune interaction dynamics, governed by nonlinear ODEs, directly into the neural network's loss function. This enables the model to learn both the underlying biological mechanisms and tumor growth trajectories from data while keeping high predictive performance. Our results show that the proposed PINN framework achieves competitive predictive accuracy compared to standard machine learning models, such as NN and XGBoost, while providing enhanced interpretability through biologically meaningful parameters, such as tumor growth rates and interaction coefficients.",
      },
    ],
  },
  {
    title: "Lunch",
    rows: [{ time: "12:20 - 1:10 PM", session: "Lunch (50 min)" }],
  },
  {
    title: "Afternoon Session",
    rows: [
      {
        time: "1:10 - 2:10 PM",
        session: "Plenary Talk 3",
        speaker: "Shuang Liu",
        affiliation: "University of North Texas",
        href: "https://sites.math.unt.edu/~shuangliu/",
      },
      {
        time: "2:10 - 2:35 PM",
        session: "Student Talk 5",
        speaker: "Maria Fernanda Mayorga Echeverria",
        affiliation: "University of Arkansas",
        talkTitle: "A graph-aided electrostatic solver",
        abstract:
          "The purpose of this project is to develop an alternative model for electrostatic analyses that matches the accuracy of the Poisson-Boltzmann (PB) equation but offers significantly lower computational costs, faster execution, and greater adaptability. While the generalized Born (GB) model provides a faster alternative to PB, it often sacrifices accuracy. Graph networks, which can model atomic structures, have shown promise in bridging this gap. This project aims to advance this concept by leveraging deep learning techniques such as graph neural networks (GNNs) to deliver accurate, efficient, and scalable predictions of molecular electrostatics. The topology of a protein's atomic structure naturally mirrors the structure of nodes and edges in a GNN. Feature vectors in this framework can store key physical properties such as Born radii, and a message-passing mechanism within the GNN can facilitate the propagation of information through the network, allowing for more accurate approximations of electrostatic behavior. With this implementation the project aims to create a powerful and innovative model for electrostatics, capable of improving accuracy while maintaining speed and scalability. Preliminary results compared the relative error between the calculated PB values (MIBPB) and GB values with the relative error between MIBPB and the predictions added to the GB values. This work contributes to advancements in molecular electrostatic modeling and the development of new computational tools in molecular biology and related fields.",
      },
      {
        time: "2:35 - 3:00 PM",
        session: "Student Talk 6",
        speaker: "Mohammad Rubayet Rahman",
        affiliation: "Oklahoma State University",
        talkTitle:
          "Oscillatory Regimes in a Game-Theoretic Model for Mosquito Population Dynamics under Breeding Site Control",
        abstract:
          "Mosquito-borne diseases remain a major public-health threat, and the effective control of mosquito populations requires sustained household participation in removing breeding sites. While environmental drivers of mosquito oscillations have been extensively studied, the influence of spontaneous household decision-making on the dynamics of mosquito populations remains poorly understood. We introduce a game-theoretic model in which the fraction of households performing breeding site control evolves through imitation dynamics driven by perceived risks. Household behavior regulates the carrying capacity of the aquatic mosquito stage, creating a feedback between control actions and mosquito population growth. For a simplified model with constant payoffs, we characterize four locally stable equilibria, corresponding to full or no household control and the presence or absence of mosquito populations. When the perceived risk of not controlling breeding sites depends on mosquito prevalence, the system admits an additional equilibrium with partial household engagement. We derive conditions under which this equilibrium undergoes a Hopf bifurcation, yielding sustained oscillations arising solely from the interaction between mosquito abundance and household behavior. Numerical simulations and parameter explorations further describe the amplitude and phase properties of these oscillatory regimes.",
      },
      { time: "3:00 - 3:10 PM", session: "Break" },
      {
        time: "3:10 - 3:35 PM",
        session: "Student Talk 7",
        speaker: "Haridas Kumar Das",
        affiliation: "Oklahoma State University",
        talkTitle:
          "From Mechanistic to Stochastic Transitions in Metapopulation Modeling: Assessing the Impact of Network Structure and Vaccinations",
        abstract:
          "Human behavior, including mobility patterns and vaccination decisions, strongly influences the spatial spread and persistence of infectious diseases. We develop deterministic and stochastic metapopulation models to examine how adaptive behavior, coupled with mobility and heterogeneous vaccination strategies, shapes epidemic thresholds, outbreak trajectories, and disease persistence. Our approach accounts for variability in transmission, recovery, and mortality arising from demographic heterogeneity and spatial connectivity. Using illustrative examples, we show that stochastic fluctuations and non-uniform vaccination can shift epidemic thresholds in nontrivial ways, while uniform vaccination enhances robustness against perturbations. These results highlight the critical roles of network structure, mobility, and adaptive behavior in shaping outbreak dynamics and guiding targeted interventions under uncertainty.",
      },
      {
        time: "3:35 - 4:00 PM",
        session: "Student Talk 8",
        speaker: "Prince Osei Affi",
        affiliation: "Wichita State University",
        talkTitle: "Robust and High-Order Numerical Simulation for Phase Field Modeling",
        abstract:
          "We develop robust and high-order time integration schemes for phase-field modeling, using the Allen-Cahn equation as a prototype. Our approach leverages the Scalar Auxiliary Variable (SAV) framework to construct energy-stable numerical methods while achieving high-order temporal accuracy. By combining SAV reformulation with advanced Runge-Kutta techniques, the proposed schemes ensure unconditional energy dissipation and improved computational efficiency. Numerical experiments demonstrate the accuracy, stability, and effectiveness of the methods for simulating phase separation dynamics.",
      },
      { time: "4:00 - 4:25 PM", session: "Student Talk 9" },
    ],
  },
];

const summaryItems = [
  "Plenary talks: 3",
  "Student talks: 9",
  "Opening remarks included",
  "Lunch break: 50 minutes",
  "Conference end time: 4:25 PM",
];

const studentPresenterNames = [
  "Joie Lea Murorunkwere",
  "James Burton",
  "Bryan Haris",
  "Priscilla Owusu Sekyere",
  "Maria Fernanda \"fer\" Mayorga Echeverria",
  "Mohammad Rubayet Rahman",
  "Haridas Das",
  "Prince Osei Affi",
];

const nonPresentingStudentNames = [
  "Daniel Kwame Okyere",
  "Soheil Jamali",
  "Fang Liu",
  "Luan Fabricio Lopes",
];

const studentParticipants = participantsData.filter((participant) =>
  [...studentPresenterNames, ...nonPresentingStudentNames].includes(participant.name),
);

const allStudentParticipants = studentParticipants.sort(
  (a, b) =>
    [...studentPresenterNames, ...nonPresentingStudentNames].indexOf(a.name) -
    [...studentPresenterNames, ...nonPresentingStudentNames].indexOf(b.name),
);

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
        <div className="mx-auto flex max-w-6xl px-4 py-4">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">SIAM-CSS Student Conference 2026</h1>
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
                <div className="text-base font-semibold text-blue-950">7:30 AM - 4:25 PM</div>
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

        <section className="mt-8 rounded-3xl border border-neutral-200 bg-white px-6 py-6 shadow-sm">
          <h2 className="mb-2 text-2xl font-semibold text-neutral-950">Student Participants</h2>
          <p className="mb-6 text-neutral-600">
            Retrieved from the current participant updates for this student conference page.
          </p>

          <ul className="grid gap-3 md:grid-cols-2">
            {allStudentParticipants.map((participant) => (
              <li key={participant.name} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                <div className="font-medium text-neutral-900">{participant.name}</div>
                <div className="text-sm text-neutral-600">{participant.affiliation}</div>
              </li>
            ))}
          </ul>
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
