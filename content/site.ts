// Everything a visitor reads outside the project and certificate records lives here.

export const site = {
  name: "Sahil Karande",
  short: "Sahil",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://thesahilkarande.is-a.dev",
  title: "Sahil Karande — AI Systems, Agents & Product Engineering",
  description:
    "Second-year CSE (AI & ML) student at MIT Academy of Engineering, Pune, building AI systems, agents, developer tools and full-stack products — and building Tamrivo.",
  eyebrow: "CSE (AI & ML) · MIT AOE, Pune",
  roles: ["AI Systems Builder", "Agent Developer", "Product Engineer", "Startup Founder"],
  building: { label: "Building Tamrivo", href: "/tamrivo" },
  timeZone: "Asia/Kolkata",
  // assembled at runtime so the address is not sitting in the HTML for scrapers
  email: ["sahilkarande0918", "gmail.com"] as const,
  github: "https://github.com/sahilkarande0918-cmd",
  linkedin: "https://linkedin.com/in/sahil-karande-a4722b386",
  status: ["Open to internships & collaborations", "Pune, India · remote-friendly"],
};

export type Door = {
  slug: string;
  name: string;
  plate: string;
  href: string;
  color: string;
  dark: string;
  tagline: string;
  points: string[];
  intro: string;
};

export const doors: Door[] = [
  {
    slug: "ai-agents",
    name: "AI & Agents",
    plate: "AI & Agents",
    href: "/work/ai-agents",
    color: "#22304a",
    dark: "#1c2840",
    tagline: "Agents that can be checked",
    points: ["Multi-agent orchestration", "MCP servers & red-teaming", "Grounded, cited LLM output", "n8n workflow automation", "Developer tooling"],
    intro:
      "Agents, MCP tooling and automation, built so that the deterministic parts stay deterministic and every model call has a job it can be judged on.",
  },
  {
    slug: "products-web",
    name: "Products & Web",
    plate: "Products & Web",
    href: "/work/products-web",
    color: "#4a3540",
    dark: "#3f2d37",
    tagline: "From the schema to the screen",
    points: ["Next.js & React front ends", "FastAPI & Node back ends", "Postgres, Supabase & RLS", "Editors, dashboards, queues", "Deployed on Vercel"],
    intro:
      "Full-stack products with real routes, real databases and real deployments: studios, dashboards, portals and the editors inside them.",
  },
  {
    slug: "ml-impact",
    name: "ML & Impact",
    plate: "ML & Impact",
    href: "/work/ml-impact",
    color: "#7a8670",
    dark: "#66705d",
    tagline: "Models with their limits written down",
    points: ["Gradient boosting & conformal intervals", "On-device computer vision", "Deterministic rule engines", "Geospatial risk mapping", "Confidence gating & audits"],
    intro:
      "Machine learning pointed at agriculture, accessibility, aviation, fraud and heat — each project states what its data is, and what it is not.",
  },
  {
    slug: "tamrivo",
    name: "Tamrivo",
    plate: "Tamrivo",
    href: "/tamrivo",
    color: "#a4552c",
    dark: "#8c4826",
    tagline: "The startup I'm building",
    points: ["AI-search visibility for brands", "Measure → Compare", "Diagnose → Generate fix", "Built for SEO & content agencies"],
    intro: "",
  },
  {
    slug: "certificates",
    name: "Certificates",
    plate: "Certificates",
    href: "/certificates",
    color: "#2b3a3a",
    dark: "#223030",
    tagline: "Courses, internships & prizes",
    points: ["Anthropic, IBM, Cisco, Databricks", "Cisco AICTE AI internship", "Hack4Humanity 2026 · 3rd prize", "Every original, viewable"],
    intro: "",
  },
];

export type Chapter = { year: number; when: string; title: string; org: string; points: string[]; now?: boolean; tint: [string, string] };

// newest first: the year rolls back as you scroll
export const story: Chapter[] = [
  {
    year: 2026,
    when: "Sep 2026 — Now",
    title: "Building Tamrivo",
    org: "Founder · AI-search visibility",
    points: [
      "Measuring how brands and their competitors appear inside AI search answers, then generating evidence-based fixes.",
      "Building it alongside my degree.",
    ],
    now: true,
    tint: ["226,122,58", "92,132,202"],
  },
  {
    year: 2026,
    when: "Through 2026",
    title: "Hackathon builds that shipped",
    org: "Terrier Cyber Quest · SIH 2026 · Hack4Humanity · Hacktoberfest",
    points: [
      "Hemostat, AeroPulse AI, Veris, KisaanRaksha, Agent Fleet and OSS-Forge: each with a README that says what was tested, and on what data.",
      "KisaanRaksha won 3rd prize at Hack4Humanity 2026 (IEEE Pune Section) in August 2026.",
    ],
    tint: ["178,106,148", "226,122,58"],
  },
  {
    year: 2026,
    when: "Jun 2026 — Aug 2026",
    title: "Virtual internship in AI",
    org: "Cisco Networking Academy × AICTE",
    points: [
      "Built FaultLine: network-fault diagnosis where a Python rule engine and an AI model read the same evidence and a human reviews every fix.",
      "Also completed the 5-week Sarthi social-outreach internship at MIT AOE (May–June 2026).",
    ],
    tint: ["132,174,104", "92,132,202"],
  },
  {
    year: 2026,
    when: "Feb 2026 — Mar 2026",
    title: "First agents and automations",
    org: "Experiments that turned into products",
    points: [
      "REVA, an n8n real-estate agent; ExamPrepAI; the first Drishti accessibility prototype.",
      "Top finalist at Innoventure, E-Summit'26 (MIT AOE E-Cell); courses from Anthropic, IBM and Cisco.",
    ],
    tint: ["226,178,70", "178,142,132"],
  },
  {
    year: 2025,
    when: "2025 — Now",
    title: "B.Tech, CSE (AI & ML)",
    org: "MIT Academy of Engineering, Pune",
    points: [
      "Second year of computer science with a focus on AI and machine learning.",
      "Where the coursework started — operating systems, data structures, ML — and the side projects took over the evenings.",
    ],
    tint: ["92,132,202", "196,176,176"],
  },
];

// the ability card: real skill areas, each tied to the projects that show it (no invented percentages)
export const abilities = [
  { name: "Agents & MCP", proof: "Agent Fleet · OSS-Forge" },
  { name: "Applied ML", proof: "AeroPulse · KisaanRaksha" },
  { name: "Full-stack products", proof: "Reel Studio · Veridex" },
  { name: "Systems & security", proof: "Hemostat · Veris" },
];

export const tools = ["Python", "TypeScript", "Next.js", "FastAPI", "Postgres", "Kotlin", "LightGBM", "MCP", "n8n", "Docker"];
