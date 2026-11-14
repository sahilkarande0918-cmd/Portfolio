// Certificate descriptions, keyed by the original filename. The files themselves are indexed by
// scripts/certificates.py into certificates.generated.json; a new file shows up in the gallery
// on its own (flagged for review) until it is described here. Dates are only those printed on
// the document; verification links only those printed on it.
import generated from "./certificates.generated.json";

export type CertType = "Course" | "Accreditation" | "Internship" | "Prize" | "Finalist" | "Participation";

// `added`: when the owner handed it over, for ordering only (never shown) — for documents with no printed date
type Meta = { title: string; issuer: string; type: CertType; date?: string; added?: string; verify?: string; note?: string };

const meta: Record<string, Meta> = {
  "Brand battle 1st prize certificate .pdf": { title: "Brand Battle 2026 — Winner", issuer: "MIT AOE E-Cell", type: "Prize", added: "2026-11-14", note: "1st prize, with team Straw-Hats. Run by the MIT AOE E-Cell and Entrepreneurial Development Foundation with industry partners." },
  "Hack4Humanity 3rd prize.pdf": { title: "Hack4Humanity 2026 — 3rd Prize", issuer: "IEEE Pune Section", type: "Prize", date: "2026-08-08", note: "Awarded for KisaanRaksha." },
  "DY patil Hackathon certificate .pdf": { title: "Kurukshetra — War Led by Strategies", issuer: "CSI DIT × Team DevKraft, DYP DPU", type: "Participation", added: "2026-11-08", note: "Certificate of appreciation for participating and contributing at the Kurukshetra hackathon." },
  "E-summit certificate.pdf": { title: "Top Finalist, Innoventure 2026 (E-Summit'26)", issuer: "MIT AOE E-Cell", type: "Finalist", date: "2026-02" },
  "Cisco Internship Certificate .pdf": {
    title: "Virtual Internship Program in Artificial Intelligence",
    issuer: "Cisco",
    type: "Internship",
    date: "2026-08",
    note: "Cisco Networking Academy × AICTE, June–August 2026. Student ID masked in this preview.",
  },
  "sarthi internship.pdf": { title: "Sarthi — Social Outreach Internship 2026", issuer: "MIT Academy of Engineering", type: "Internship", date: "2026-06-28", note: "5 weeks, 28 May – 28 June 2026." },
  "Sahil_Karande_Sarthi_2026.pdf": { title: "Sarthi 2026 — Participation", issuer: "MIT Academy of Engineering", type: "Participation" },
  "Sahil_Karande_GyanUtsav.pdf": { title: "Gyan Utsav 2026 — Inclusive education model", issuer: "MIT Academy of Engineering", type: "Participation", date: "2026-06-14" },
  "generative AI gigs for gigs.pdf": { title: "Workshop: Generative AI — Creativity & Productivity", issuer: "GFG Campus Body, MIT AOE", type: "Participation", date: "2026-03-21" },
  "claude 101 certificate.pdf": { title: "Claude 101", issuer: "Anthropic", type: "Course" },
  "AI fluency-framework & foundation certificate.pdf": { title: "AI Fluency: Framework & Foundations", issuer: "Anthropic", type: "Course" },
  "AI fluency for students certificate.pdf": { title: "AI Fluency for Students", issuer: "Anthropic", type: "Course" },
  "AI fluency-for non profits certificate.pdf": { title: "AI Fluency for Nonprofits", issuer: "Anthropic", type: "Course" },
  "Intro to MCP certificate.pdf": { title: "Introduction to Model Context Protocol", issuer: "Anthropic", type: "Course", date: "2026-03-30", verify: "https://verify.skilljar.com/c/thuymintbnri" },
  "Intro to Agent-Skills certificate.pdf": { title: "Introduction to Agent Skills", issuer: "Anthropic", type: "Course" },
  "Intro to Sub-Agents certificate.pdf": { title: "Introduction to Subagents", issuer: "Anthropic", type: "Course" },
  "Intro to cloud cowork certificate.pdf": { title: "Introduction to Claude Cowork", issuer: "Anthropic", type: "Course" },
  "Claude with Google VertexAI certificate.pdf": { title: "Claude with Google Vertex AI", issuer: "Anthropic", type: "Course", date: "2026-03-30", verify: "https://verify.skilljar.com/c/v9864x87kdx9" },
  "IBM Agentic-AI.pdf": { title: "Make Agentic AI Work for You", issuer: "IBM SkillsBuild", type: "Course", date: "2026-03-31", verify: "https://www.credly.com/go/RYlO0Eic" },
  "IBM Get start with Gen-AI certificate.pdf": { title: "Getting Started with Generative AI", issuer: "IBM SkillsBuild", type: "Course", date: "2026-03-31", verify: "https://www.credly.com/go/tsDsbLbA" },
  "IBM AIFundamentalsFoundationsforUnderstandingAI.pdf": { title: "AI Fundamentals: Foundations for Understanding AI", issuer: "IBM SkillsBuild", type: "Course", date: "2026-04-06", verify: "https://www.credly.com/go/ARAlt6l4" },
  "IBM AI language and vision certificate.pdf": { title: "AI Fundamentals: Language and Vision in AI", issuer: "IBM SkillsBuild", type: "Course", date: "2026-04-07", verify: "https://www.credly.com/go/DoHptJRX" },
  "IBMDesign_certificate.pdf": { title: "Career Management Essentials", issuer: "IBM SkillsBuild", type: "Course", date: "2026-03-30", verify: "https://www.credly.com/badges/4ebcd03e-0e25-4a6e-9526-4c138d8b60cc" },
  "CISCO Introduction_to_Modern_AI_certificate.pdf": { title: "Introduction to Modern AI", issuer: "Cisco Networking Academy", type: "Course", date: "2026-06-10" },
  "CISCO Apply_AI-_Analyze_Customer_Reviews_certificate.pdf": { title: "Apply AI: Analyze Customer Reviews", issuer: "Cisco Networking Academy", type: "Course", date: "2026-06-09" },
  "CISCO Data_Analytics_Essentials_certificate.pdf": { title: "Data Analytics Essentials", issuer: "Cisco Networking Academy", type: "Course", date: "2026-06-09" },
  "python-1 certificate.pdf": { title: "Python Essentials 1", issuer: "Cisco Networking Academy", type: "Course", date: "2026-03-31" },
  "python-2 certificate.pdf": { title: "Python Essentials 2", issuer: "Cisco Networking Academy", type: "Course", date: "2026-03-31" },
  "HubSpot Digital Marketing certificate.png": {
    title: "Digital Marketing Certified",
    issuer: "HubSpot Academy",
    type: "Accreditation",
    date: "2026-09-30",
    note: "Valid 30 Sep 2026 – 29 Oct 2028. SEO-friendly content, website optimisation, social media strategy, video, advertising and measuring results.",
  },
  "databricks Gen-AI certificate.pdf": { title: "Generative AI Fundamentals", issuer: "Databricks Academy", type: "Accreditation", date: "2026-03-31" },
  "NASSCOM CERTIFICATE.pdf": { title: "Digital 101 (30 hours)", issuer: "NASSCOM FutureSkills Prime", type: "Course", date: "2026-03-22" },
};

export type Certificate = Meta & (typeof generated)[number] & { needsReview: boolean };

export const certificates: Certificate[] = generated
  .map((g) => {
    const m = meta[g.file];
    return m
      ? { ...g, ...m, needsReview: false }
      : { ...g, title: g.file.replace(/\.[a-z]+$/i, ""), issuer: "Other", type: "Course" as CertType, needsReview: true };
  })
  // newest first, on every line (owner's rule): the printed date, else when it was added; undated ones last
  .sort((a, b) => (b.date ?? b.added ?? "").localeCompare(a.date ?? a.added ?? ""));


// The Certificates room hangs each group on its own line, in its own colours.
export type World = { key: string; name: string; em: string; kicker: string; desc: string; tags: string[]; bg: string; fg: string; acc: string; items: Certificate[] };

const groups: (Omit<World, "items"> & { match: (c: Certificate) => boolean })[] = [
  {
    key: "recognition", name: "Prizes &", em: "Internships", kicker: "Recognition · Hackathons & programmes",
    desc: "A Brand Battle win, a hackathon prize, a finalist place, two internships and the campus programmes around them.",
    tags: ["Brand Battle 2026", "Hack4Humanity 2026", "Kurukshetra", "Cisco × AICTE", "MIT AOE"], bg: "#1c1a19", fg: "#ede6dc", acc: "#d6b26e",
    match: (c) => ["Prize", "Finalist", "Internship", "Participation"].includes(c.type),
  },
  {
    key: "anthropic", name: "Anthropic", em: "Academy", kicker: "Courses · Claude, MCP & agents",
    desc: "Claude, the Model Context Protocol, agent skills and subagents — the toolkit most of my agent work is built with.",
    tags: ["MCP", "Agent skills", "AI fluency"], bg: "#efe8de", fg: "#1a1818", acc: "#b5582d",
    match: (c) => c.issuer === "Anthropic",
  },
  {
    key: "ibm", name: "IBM", em: "SkillsBuild", kicker: "Courses · AI fundamentals",
    desc: "Foundations of AI, language and vision models, generative AI and agentic AI.",
    tags: ["Credly-verified"], bg: "#c4b0b2", fg: "#1a1818", acc: "#5c4242",
    match: (c) => c.issuer === "IBM SkillsBuild",
  },
  {
    key: "cisco", name: "Cisco", em: "NetAcad", kicker: "Courses · Python, data & AI",
    desc: "Python Essentials 1 and 2, data analytics and applied AI, through MIT AOE's Cisco Networking Academy.",
    tags: ["Python", "Data analytics", "Modern AI"], bg: "#6e6363", fg: "#f3eeec", acc: "#ead8c8",
    match: (c) => c.issuer === "Cisco Networking Academy",
  },
  {
    key: "more", name: "More", em: "learning", kicker: "Accreditation & courses",
    desc: "Everything else: a digital-marketing certification, an accreditation, national skills programmes and anything newly added.",
    tags: ["HubSpot", "Databricks", "NASSCOM"], bg: "#26302f", fg: "#e6ece9", acc: "#a9c7b8",
    match: () => true,
  },
];

export const worlds: World[] = (() => {
  const left = new Set(certificates);
  return groups
    .map(({ match, ...g }) => {
      const items = [...left].filter(match);
      items.forEach((c) => left.delete(c));
      return { ...g, items };
    })
    .filter((w) => w.items.length);
})();
