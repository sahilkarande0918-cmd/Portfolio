// The project manifest. One record per project; a project can sit in several rooms but has
// one detail page (/projects/<slug>). Claims here are scoped to what each repository's own
// README / status documents establish — see docs/content-audit.md for the evidence trail.

export type Category = "ai-agents" | "products-web" | "ml-impact" | "tamrivo";
export type Device = "browser" | "phone" | "terminal" | "none";

export type Media = {
  src: string;
  alt: string;
  width: number;
  height: number;
  source: string; // provenance
  captured: string; // date
};

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  kind: string; // mono label, e.g. "Web app · Hackathon"
  categories: Category[];
  featured?: boolean;
  archive?: boolean;
  status: string;
  year: string;
  problem: string;
  solution: string;
  decisions: string[];
  features: string[];
  stack: string[];
  contribution: string;
  team?: string[];
  repo?: string;
  demo?: { url: string; note?: string };
  device: Device;
  media: Media[];
  terminal?: string; // verified CLI output, quoted from the repository's own results
  limitations: string[];
  evidence: string[];
};

const gh = (r: string) => `https://github.com/sahilkarande0918-cmd/${r}`;
const shot = (slug: string, file: string, alt: string, source: string, captured: string, width = 1600, height = 900): Media => ({
  src: `/media/${slug}/${file}.webp`,
  alt,
  width,
  height,
  source,
  captured,
});

export const projects: Project[] = [
  {
    slug: "tamrivo",
    title: "Tamrivo",
    tagline: "AI-search visibility for brands and agencies",
    kind: "B2B SaaS · Startup",
    categories: ["tamrivo"],
    featured: true,
    status: "Building",
    year: "2026",
    problem:
      "Buyers increasingly ask AI assistants instead of search engines, and brands have no reliable way to see whether they — or their competitors — appear in those answers.",
    solution:
      "Tamrivo samples AI search answers for the prompts a brand cares about, measures who shows up, compares against competitors, diagnoses the gaps and generates evidence-based fixes.",
    decisions: ["Results are reported as observed visibility from sampled answers — never as promised rankings, traffic or revenue."],
    features: ["Measure", "Compare", "Diagnose", "Generate fix"],
    stack: [],
    contribution: "Founder — I'm building the product.",
    device: "none",
    media: [],
    limitations: ["Being built; no public launch, customers or revenue are claimed."],
    evidence: ["Tamrivo README (public product name)"],
  },
  {
    slug: "hemostat",
    title: "Hemostat",
    tagline: "Repair a binary you have no source for — offline — and prove the repair",
    kind: "Security tooling · Hackathon",
    categories: ["ai-agents", "ml-impact"],
    featured: true,
    status: "Hackathon prototype",
    year: "2026",
    problem:
      "Air-gapped Linux machines run vendor binaries without source. When one has a memory-safety bug, online AI tools, source-level linters and antivirus can't fix it.",
    solution:
      "The Sanjeevani pipeline takes a stripped ELF binary and nothing else: fuzz it to a crash, lift the faulting function back to C, write a fix, splice it into the binary, and prove the bug is gone while behaviour elsewhere is unchanged.",
    decisions: [
      "Fully offline after a one-time model download; zero remote connections, verified with strace.",
      "Template repairs first, a local Qwen2.5-Coder model only when a template doesn't fit.",
      "Symbolic verification with angr + Z3 reports PROVEN or BOUNDED — it never overstates.",
    ],
    features: ["FIND · AFL++ (QEMU mode)", "READ · gdb + Ghidra", "WRITE · templates / local Qwen", "SPLICE · Patcherex2", "PROVE · angr + Z3"],
    stack: ["Python", "AFL++", "Ghidra", "Patcherex2", "angr", "Z3", "llama.cpp"],
    contribution: "Built with Purvesh Mhatre and Pranav Shripannavar for Terrier Cyber Quest 2026 (AI Kavach track); 14 of 16 commits are mine.",
    team: ["Sahil Karande", "Purvesh Mhatre", "Pranav Shripannavar"],
    repo: gh("Hemostat"),
    device: "terminal",
    media: [],
    terminal: `$ ./demo.sh
stack_overflow   unbounded strcpy  (CWE-121)   PROVEN    0x401190
off_by_one       i <= n loop bound (CWE-193)   PROVEN    0x401228
format_string    printf(user_input)(CWE-134)   BOUNDED   —

FIND+READ 13.9s   WRITE 0.1s   SPLICE 3.2s   PROVE 2.9s   TOTAL 20.2s
remote connections: 0 (strace-verified)   disk: 8.6 GB`,
    limitations: [
      "Demonstrated on three planted bug classes in demo binaries, on one machine without a GPU.",
      "The format-string case is bounded verification, not a full proof.",
    ],
    evidence: ["Hemostat README: results table and per-binary timings"],
  },
  {
    slug: "reel-studio",
    title: "Reel Studio",
    tagline: "Turn class recordings and one-line topics into publish-ready reels",
    kind: "Web app · AI video",
    categories: ["products-web", "ai-agents"],
    featured: true,
    status: "Live demo",
    year: "2026",
    problem:
      "Technical educators record hours of class but can't cut it into short vertical videos — and generic tools mangle Hinglish speech and crop away the code.",
    solution:
      "Two pipelines feed one timeline: long recordings become ranked 30–60 s highlights with code-following 9:16 framing and word-synced Hinglish captions; topics become short explainers with a script, code cards and voiceover.",
    decisions: [
      "One canonical timeline schema (Zod → JSON Schema) produced by both AI pipelines, edited in the editor and rendered by a single compiler.",
      "Open-source models on our own GPU machine, so it runs at ₹0 on free tiers.",
      "Every claim in docs/TEST_STATUS.md is marked synthetic, real class recording, or production.",
    ],
    features: ["Hinglish-aware transcription", "Context-aware clipping", "Multitrack editor with undo", "Instagram publishing & insights", "Style presets & brand kits"],
    stack: ["Next.js 16", "React 19", "FastAPI", "Supabase", "faster-whisper", "OpenCV", "Ollama", "Hyperframes", "FFmpeg"],
    contribution: "Team project with three teammates; 153 commits in the repository are mine.",
    team: ["Sahil Karande", "Sahil Lokhande", "Atharva Dherange", "SK999CodingWorld"],
    repo: gh("Reel-Studio"),
    demo: { url: "https://reel-studio-taupe.vercel.app", note: "The rendering worker runs on our own GPU machine, so generation needs it to be online." },
    device: "browser",
    media: [
      shot("reel-studio", "landing", "Reel Studio landing page on the live deployment", "Live deployment, captured read-only with Playwright", "2026-11-07", 1440, 900),
      shot("reel-studio", "dashboard", "Reel Studio home: recent projects and a published-reel summary", "Reel-Studio repository, apps/web/public/landing", "2026-11-07"),
      shot("reel-studio", "highlights", "Highlights view ranking clips from a class recording, with the reason for each", "Reel-Studio repository, apps/web/public/landing", "2026-11-07"),
      shot("reel-studio", "editor", "The multitrack editor with captions, code card and text layers", "Reel-Studio repository, apps/web/public/landing", "2026-11-07"),
    ],
    limitations: ["Instagram publishing and insights are not claimed as verified until real authorised accounts are connected (per TEST_STATUS)."],
    evidence: ["Reel-Studio README", "docs/TEST_STATUS.md"],
  },
  {
    slug: "drishti",
    title: "Drishti 2.0",
    tagline: "A voice-first Android assistant for blind and low-vision users",
    kind: "Android app · Accessibility",
    categories: ["ml-impact"],
    featured: true,
    status: "Prototype",
    year: "2026",
    problem: "Screen readers make phones usable, but they don't describe the room, the obstacle ahead or the bus stop across the road.",
    solution:
      "A native Android app with a conversational, screen-reader-free dashboard: on-device object detection, questions about the camera feed, outdoor routing, and an SOS that shares GPS location.",
    decisions: [
      "Object detection runs on-device (MediaPipe EfficientDet-Lite0), so the core feature works offline.",
      "Voice first: every feature is reachable without looking at the screen.",
      "Earlier React prototypes (drishti-web-app, drishti-ai-frontend) are kept as history, not counted as separate projects.",
    ],
    features: ["On-device object detection", "Scene question answering", "OSRM outdoor navigation", "SOS with GPS via Firestore & email"],
    stack: ["Kotlin", "Jetpack Compose", "MediaPipe Tasks Vision", "Room", "Firebase", "Retrofit"],
    contribution: "Repository owner; all commits in the Android repository are mine.",
    repo: gh("Drishti-2.0-app"),
    device: "phone",
    media: [],
    limitations: ["Assistive technology prototype — not a guarantee of safe navigation.", "Scene Q&A needs a network connection and an API key."],
    evidence: ["Drishti-2.0-app README", "drishti-web-app README (earlier prototype)"],
  },
  {
    slug: "kisaanraksha",
    title: "KisaanRaksha",
    tagline: "An early warning for farmer financial distress, in Marathi on WhatsApp",
    kind: "AI agent · Social good",
    categories: ["ml-impact", "ai-agents"],
    featured: true,
    status: "Hackathon prototype",
    year: "2026",
    problem: "Support for distressed farmers in Vidarbha and Marathwada arrives after the crisis. The warning signs — drought, prices, crop health, loan dates — are public data no one combines in time.",
    solution:
      "A Financial Stress Index per district from four grounded signals, a Marathi voice agent on WhatsApp whose every fact comes from an MCP tool, and an officer dashboard that raises an alert above a critical threshold.",
    decisions: [
      "No bare LLM calls: weather, mandi prices, NDVI and the FSI score all come from MCP tools backed by named datasets.",
      "Offline-first fallbacks for every signal when connectivity drops.",
      "A Fairlearn audit checks error parity across regions and crop groups.",
    ],
    features: ["LightGBM Financial Stress Index", "Marathi voice via WhatsApp", "Officer alerts above FSI 75", "District heatmap dashboard"],
    stack: ["Python", "FastAPI", "FastMCP", "LightGBM", "Whisper", "Twilio", "Streamlit", "React"],
    contribution: "Built for Hack4Humanity 2026, Track C; all 23 commits in the repository are mine.",
    repo: gh("Kisan-Raksha-project"),
    device: "phone",
    media: [shot("kisaanraksha", "alert", "A Marathi WhatsApp conversation showing a simulated critical FSI alert for Amravati", "Kisan-Raksha-project repository, docs/assets", "2026-11-07", 1128, 826)],
    limitations: [
      "The FSI model is trained on a synthetic dataset built from public signals; the WhatsApp alert shown is a simulation replaying a past pattern.",
      "Reported metrics (MAE 3.75, R² 0.94) are on held-out talukas of that synthetic data.",
    ],
    evidence: ["Kisan-Raksha-project README", "model/training_metrics.json", "model/fairlearn_report.md"],
  },
  {
    slug: "agent-fleet",
    title: "Agent Fleet",
    tagline: "A generated swarm of test agents that red-teams MCP servers",
    kind: "Developer tool · Security",
    categories: ["ai-agents"],
    featured: true,
    status: "Live demo",
    year: "2026",
    problem: "Every MCP tool exposed to an agent is an API untrusted input can reach, and nobody hand-writes hundreds of adversarial tests for ten tools.",
    solution:
      "Agent Fleet reads a server's live tool manifest, generates 305 single-purpose worker specs from 12 squad templates, runs them with bounded concurrency, has a judge grade every failure, and files tickets for the real bugs.",
    decisions: [
      "Worker prompts are generated from templates, never hand-written — the design is 322 roles (305 workers plus orchestration), dispatched through a semaphore pool, not 322 models running at once.",
      "The judge re-reviews failures and a sample of passes to catch false negatives.",
      "Ships with a deliberately vulnerable demo server whose three planted bugs it finds without hints.",
    ],
    features: ["Manifest-driven agent factory", "Streamed dashboard over SSE", "Severity judging with rationale", "GitHub issues & Slack summary"],
    stack: ["Python", "FastAPI", "asyncio", "MCP", "Gemini", "SQLite"],
    contribution: "All 24 commits in the repository are mine.",
    repo: gh("Agent-Fleet"),
    demo: { url: "https://agent-fleet-redteam.onrender.com", note: "Free host: the first load takes about a minute to wake." },
    device: "browser",
    media: [shot("agent-fleet", "landing", "Agent Fleet's live landing page", "Live deployment, captured read-only with Playwright", "2026-11-07", 1440, 900)],
    limitations: ["Demonstrated against the bundled ShopFlow demo server.", "Free hosting has a cold start."],
    evidence: ["Agent-Fleet README"],
  },
  {
    slug: "aeropulse-ai",
    title: "AeroPulse AI",
    tagline: "Predictive maintenance that says when not to trust the prediction",
    kind: "Decision support · SIH 2026",
    categories: ["ml-impact", "products-web"],
    featured: true,
    status: "Live demo",
    year: "2026",
    problem:
      "A remaining-useful-life number alone is not a maintenance decision. Planners need to know whether the prediction can be trusted and what is feasible with the people and parts they actually have.",
    solution:
      "TrustTwin checks the sensor data first, gates the model's output (valid, degraded or unavailable), attaches calibrated intervals and exact SHAP explanations, then plans maintenance with OR-Tools — with an officer approving every decision.",
    decisions: [
      "When data quality fails, no RUL is produced at all — a verification task is created instead.",
      "Split-conformal 90% intervals with coverage measured on unseen engines.",
      "Prediction, recommendation, decision and work order are separate records in a hash-chained audit log.",
    ],
    features: ["Sensor reliability checks", "Calibrated RUL intervals", "What-if digital twin", "CP-SAT maintenance planner"],
    stack: ["Python", "FastAPI", "LightGBM", "SHAP", "OR-Tools", "React", "PostgreSQL"],
    contribution: "Built for Smart India Hackathon 2026 (SIH26249); all 17 commits in the repository are mine.",
    repo: gh("AeroPulse-AI"),
    demo: { url: "https://aero-pulse-ai-kohl.vercel.app" },
    device: "browser",
    media: [
      shot("aeropulse-ai", "overview", "AeroPulse command overview with fleet status and latest predictions", "AeroPulse-AI repository, docs/screenshots", "2026-11-07", 1440, 900),
      shot("aeropulse-ai", "trusttwin", "TrustTwin scenario comparing plans when sensors, parts or technicians drop out", "AeroPulse-AI repository, docs/screenshots", "2026-11-07", 1440, 900),
      shot("aeropulse-ai", "planner", "The maintenance planner's proposed schedule across technicians", "AeroPulse-AI repository, docs/screenshots", "2026-11-07", 1440, 900),
    ],
    limitations: [
      "Advisory only: it never authorises flight or airworthiness and has not been validated on military aircraft.",
      "Trained on NASA's public C-MAPSS (simulated commercial turbofans); fleet, people and parts are synthetic and labelled so.",
    ],
    evidence: ["AeroPulse-AI README", "docs/model-training.md"],
  },
  {
    slug: "veris",
    title: "Veris",
    tagline: "Fraud checks that cite their evidence, and a ledger that can't be quietly edited",
    kind: "Android + engine · SIH 2026",
    categories: ["ml-impact", "ai-agents"],
    featured: true,
    status: "Hackathon prototype",
    year: "2026",
    problem: "Most scam detectors give a verdict without saying how they know, and incident reports are easy to alter after the fact.",
    solution:
      "Deterministic checks against named sources produce every verdict, each signal with its citation; a language model only explains the evidence in plain English or a regional language. Incidents go into a tamper-evident ledger and an NCRP-ready packet.",
    decisions: [
      "The rules module is the only writer of a verdict; the explanation type has no verdict field.",
      "Never accuses definitively and never contacts an officer automatically — every portal link is user-tapped.",
      "Release build requests only network permissions.",
    ],
    features: ["Share-sheet intake on Android", "Cited evidence panel", "Hash-chained incident ledger", "APK static analysis"],
    stack: ["Python", "FastAPI", "Expo / React Native", "Groq"],
    contribution: "All 66 commits in the repository are mine.",
    repo: gh("Veris"),
    device: "terminal",
    media: [],
    terminal: `$ python scripts/demo_all.py
homoglyph lookalike domain ........ caught, cited
Marathi explanation ............... generated (explains only)
fake-loan APK manifest ............ flagged
ledger tamper ..................... detected
adversarial set ................... Veris 9/9 · naive detector 5/9
91 tests + 4/4 demos pass on a clean machine, no keys`,
    limitations: ["Prototype evaluated on its own adversarial demo set, not field data."],
    evidence: ["Veris README: status table and definition of done", "STATE.md"],
  },
  // ---- supporting work ----
  {
    slug: "oss-forge",
    title: "OSS-Forge",
    tagline: "Issue to verified patch, with a proof-of-fix capsule",
    kind: "Agent skill · CLI",
    categories: ["ai-agents"],
    status: "Prototype",
    year: "2026",
    problem: "Maintainers don't need more AI patches; they need patches they can trust quickly.",
    solution:
      "Maps the repository, packs only the definitions that matter into a token budget, has Gemma 4 write a regression test and a minimal patch, and marks a fix VERIFIED only when the test fails before and passes after in a fresh worktree.",
    decisions: ["Unclear issues end as INCONCLUSIVE with the missing information listed, not a speculative patch.", "Python does everything deterministic; the model makes only the judgement calls."],
    features: ["AST repo map & context ranking", "Isolated reproduction", "Guarded patching", "Draft PR only with --approve"],
    stack: ["Python", "Gemma 4", "git worktrees", "Docker sandbox"],
    contribution: "All commits in the repository are mine. Built for MLH Hacktoberfest 2026; the prize categories it targeted are not claimed as won.",
    repo: gh("OSS-Forge"),
    device: "terminal",
    media: [],
    terminal: `$ oss-forge solve <repo> --issue <n>
map → context → hypotheses → reproduce → patch → verify
verdict: VERIFIED   (test fails on base, passes with patch, no new suite failures)
capsule: proof-of-fix.json + proof-of-fix.md`,
    limitations: ["Python and JS/TS repositories; typical runs make 3–5 model calls."],
    evidence: ["OSS-Forge README"],
  },
  {
    slug: "reva",
    title: "REVA",
    tagline: "An n8n real-estate agent for property search and lead follow-up",
    kind: "Automation · n8n",
    categories: ["ai-agents"],
    status: "Automation project",
    year: "2026",
    problem: "Property enquiries wait hours for a reply, and leads are tracked by hand.",
    solution: "A webhook-driven n8n workflow where AI agents answer property queries, recommend listings by budget and location, estimate affordability, capture leads to Google Sheets and send follow-ups by email.",
    decisions: ["Workflows in n8n so the business logic stays visible and editable without code."],
    features: ["Chat-based property assistant", "Preference-based recommendations", "Lead capture & follow-up", "Affordability / EMI answers"],
    stack: ["n8n", "Groq", "Gemini", "Google Sheets", "Gmail", "Webhooks"],
    contribution: "Designed the agent workflow and built the automation pipelines.",
    device: "none",
    media: [shot("reva", "workflow", "The REVA n8n workflow: webhook, AI agents, Google Sheets and automated replies", "My-Portfolio repository, reva-workflow.jpg", "2026-11-07", 1024, 622)],
    limitations: ["No public repository or live demo."],
    evidence: ["Previous portfolio's REVA case study and workflow image"],
  },
  {
    slug: "faultline",
    title: "FaultLine",
    tagline: "Network-fault diagnosis: a rule engine and an AI, judged by a human",
    kind: "Internship project",
    categories: ["ai-agents", "ml-impact"],
    status: "Internship project",
    year: "2026",
    problem: "Manual network troubleshooting is slow and inconsistent.",
    solution: "A deterministic Python rule engine and an AI model read identical evidence from a Packet Tracer topology; findings are shown side by side and a human accepts, edits or rejects each AI recommendation before the fix is applied and re-tested.",
    decisions: ["Human-in-the-loop review is logged as evidence of governance."],
    features: ["Six fault types", "Parallel rule vs AI diagnosis", "Accept / edit / reject review", "Verification by re-test"],
    stack: ["Python", "Gemini / Grok", "Cisco Packet Tracer", "Next.js"],
    contribution: "Built during the Cisco × AICTE virtual internship in AI; 13 of 15 commits are mine. This was an internship programme, not employment at Cisco.",
    repo: gh("CISCO-Project"),
    demo: { url: "https://cisco-project-a1jk.vercel.app" },
    device: "browser",
    media: [shot("faultline", "landing", "FaultLine running the full pipeline: rule engine and AI agreement on injected faults", "Live deployment, captured read-only with Playwright", "2026-11-07", 1440, 900), shot("faultline", "dashboard", "FaultLine dashboard comparing rule-engine and AI diagnoses across cases", "CISCO-Project repository, report/assets", "2026-11-07", 1600, 1871)],
    limitations: ["Evaluated on injected faults in a simulated topology."],
    evidence: ["CISCO-Project README", "Cisco AICTE internship certificate"],
  },
  {
    slug: "janyojana",
    title: "JanYojana",
    tagline: "Welfare schemes a household actually qualifies for",
    kind: "Web app · Civic tech",
    categories: ["products-web", "ml-impact"],
    status: "Live demo",
    year: "2026",
    problem: "Millions of eligible households never claim welfare benefits because they don't know a scheme exists or whether they qualify.",
    solution: "About fifteen questions, then a deterministic rule engine evaluates every scheme's machine-readable eligibility and explains each pass or fail. No model decides who qualifies.",
    decisions: ["No PII stored: results are computed and returned, nothing is saved.", "An urban salaried control household is included to show the engine discriminates."],
    features: ["Multilingual questionnaire", "Explainable eligibility", "One-tap sample families", "Documented data gaps"],
    stack: ["Next.js", "TypeScript", "Rule engine"],
    contribution: "All 10 commits in the repository are mine.",
    repo: gh("JanYojna"),
    demo: { url: "https://jan-yojna.vercel.app" },
    device: "browser",
    media: [shot("janyojana", "landing", "JanYojana's landing page with a sample family's matched schemes", "Live deployment, captured read-only with Playwright", "2026-11-07", 1440, 900)],
    limitations: ["Scheme coverage and source data have documented gaps."],
    evidence: ["JanYojna README"],
  },
  {
    slug: "heatshield",
    title: "HeatShield",
    tagline: "Where to put cooling relief when the city is 42 °C and one lane is 48",
    kind: "Web app · Climate",
    categories: ["ml-impact", "products-web"],
    status: "Live demo",
    year: "2026",
    problem: "Heat maps exist; heat action doesn't. A ward officer has four tankers and two halls and needs to know where they go.",
    solution: "A ~1 km vulnerability layer from open data, fused with live 24–72 h forecasts, and a greedy coverage optimiser that proposes relief points and drafts a ward advisory. Covers Pune and Ahmedabad.",
    decisions: ["Vulnerability is an OSM-derived proxy (building density, green cover, water), weighted by population."],
    features: ["Grid-cell vulnerability map", "Live forecast fusion", "Relief-site optimiser", "Drafted advisories"],
    stack: ["Next.js", "TypeScript", "Neon Postgres", "Open-Meteo", "Gemini"],
    contribution: "All 12 commits in the repository are mine.",
    repo: gh("HeatShield"),
    demo: { url: "https://heat-shield-gules.vercel.app" },
    device: "browser",
    media: [shot("heatshield", "landing", "HeatShield's live landing page", "Live deployment, captured read-only with Playwright", "2026-11-07", 1440, 900)],
    limitations: ["The vulnerability proxy is not satellite land-surface temperature."],
    evidence: ["HeatShield README"],
  },
  {
    slug: "veridex",
    title: "Veridex",
    tagline: "Indian stock analysis you can verify",
    kind: "Web app · Fintech",
    categories: ["products-web"],
    status: "Live demo",
    year: "2026",
    problem: "Retail investors get scores without formulas and chatbots that answer from memory.",
    solution: "Live Upstox data, a screener with the formula next to every score, volume/price anomaly and headline-tone signals, and a chat that answers only from data the backend just fetched.",
    decisions: ["Never places orders: analysis and tracking only, no promised returns."],
    features: ["Live candlesticks", "Transparent screener", "Anomaly & sentiment signals", "Data-grounded chat"],
    stack: ["Next.js", "TypeScript", "Upstox API", "RSS"],
    contribution: "All 33 commits in the repository are mine.",
    repo: gh("Veridex"),
    demo: { url: "https://veridex-lake.vercel.app" },
    device: "browser",
    media: [shot("veridex", "landing", "Veridex's live landing page", "Live deployment, captured read-only with Playwright", "2026-11-07", 1440, 900)],
    limitations: ["Not investment advice; no automated trading."],
    evidence: ["Veridex README"],
  },
  {
    slug: "docutrack",
    title: "DocuTrack",
    tagline: "College document requests, tracked from submission to download",
    kind: "Web app · Academic",
    categories: ["products-web"],
    status: "Academic prototype",
    year: "2026",
    problem: "Students make repeated office visits to request and collect official documents.",
    solution: "Students submit requests with supporting files; staff verify, ask for corrections, approve and upload the final document, which is delivered through an auth-guarded route.",
    decisions: ["Files are never public: served only through an authorised route."],
    features: ["Student & staff roles", "Controlled workflow", "Notifications", "Protected delivery"],
    stack: ["Next.js 16", "Auth.js", "Prisma", "Neon Postgres", "Zod"],
    contribution: "All 11 commits in the repository are mine. An SDLC course project, not an officially adopted college system.",
    repo: gh("DocuTrack"),
    demo: { url: "https://docutrack-zeta.vercel.app" },
    device: "browser",
    media: [shot("docutrack", "landing", "DocuTrack's sign-in portal for students and staff", "Live deployment, captured read-only with Playwright", "2026-11-07", 1440, 900)],
    limitations: ["Prototype; not in official use."],
    evidence: ["DocuTrack README"],
  },
  {
    slug: "assignment-studio",
    title: "Assignment Studio",
    tagline: "Edit documents and compose pages in a handwriting style learned from your own samples",
    kind: "Web app · Tooling",
    categories: ["products-web"],
    status: "Private beta (owner sign-in)",
    year: "2026",
    problem: "Editing a scanned or typed assignment usually means retyping it.",
    solution: "Document import, precise digital edits with versioning and export, and new notebook pages in a handwriting style learned from the owner's authorised references.",
    decisions: ["Generated handwriting is an approximation of a style, never an identical copy; scanned edits are reconstructions."],
    features: ["Imports & versioning", "Font-preserving edits", "Handwriting-style pages", "Owner-only access"],
    stack: ["Next.js", "TypeScript", "Neon Postgres", "Python worker", "Playwright"],
    contribution: "All 35 commits in the repository are mine.",
    repo: gh("Assignment-writer-cloner"),
    device: "none",
    media: [],
    limitations: ["Live app requires the owner's sign-in."],
    evidence: ["Assignment-writer-cloner README"],
  },
  {
    slug: "examprep-ai",
    title: "ExamPrepAI",
    tagline: "Study material in, quizzes and weak areas out",
    kind: "AI agents · Edtech",
    categories: ["ai-agents"],
    status: "In development",
    year: "2026",
    problem: "Exam aspirants spend more time organising material than practising it.",
    solution: "Agents extract topics from study material and generate JEE-pattern quizzes and flashcards, then track weak areas.",
    decisions: ["Separate agents for extraction, quiz generation and analytics."],
    features: ["Topic extraction", "Quiz & flashcard agents", "Weak-area tracking"],
    stack: ["Node.js", "Express", "Python", "Vertex AI Agent Builder"],
    contribution: "My project; source is private.",
    device: "none",
    media: [],
    limitations: ["In development; repository is private."],
    evidence: ["exam-prep-ai README (private)"],
  },
  {
    slug: "sahvoraos",
    title: "SahvoraOS",
    tagline: "Local-first lead tracking for a solo automation agency",
    kind: "Web app · Agency tool",
    categories: ["products-web"],
    status: "In use (private)",
    year: "2026",
    problem: "Cold outreach by call and WhatsApp needs a follow-up queue, not a spreadsheet.",
    solution: "Isolated niche workspaces, CSV import, a Today queue of due and overdue follow-ups with the last note inline, and optional Gemini assistance — all in the browser, backed up to CSV.",
    decisions: ["No backend and no database: leads live in the browser and the export is the backup."],
    features: ["Niche workspaces", "Follow-up queue", "CSV import / export", "Optional AI assistance"],
    stack: ["Vue", "localStorage", "Gemini (optional)"],
    contribution: "Built for Sahvora, my WhatsApp-automation agency work (separate from Tamrivo). Source is private.",
    device: "none",
    media: [],
    limitations: ["Private repository; supporting work."],
    evidence: ["SahvoraOS README (private)"],
  },
  {
    slug: "cpu-scheduler",
    title: "CPU Scheduling Simulator",
    tagline: "FCFS, SJF, Round Robin and Priority, compared on one workload",
    kind: "Coursework · Operating systems",
    categories: ["products-web"],
    archive: true,
    status: "Coursework",
    year: "2026",
    problem: "Compare scheduling policies for an AI task server with one CPU.",
    solution: "Runs four policies over the same workload, draws Gantt charts and reports per-task and average metrics side by side.",
    decisions: ["Tasks modelled as the subset of a PCB a short-term scheduler reads and writes."],
    features: ["Four policies", "Gantt charts", "Metrics comparison"],
    stack: ["TypeScript", "Python"],
    contribution: "Coursework assignment.",
    repo: gh("CPU-scheduler"),
    demo: { url: "https://cpu-scheduler-sand-rho.vercel.app" },
    device: "browser",
    media: [shot("cpu-scheduler", "landing", "The scheduler's comparison view on the live deployment", "Live deployment, captured read-only with Playwright", "2026-11-07", 1440, 900)],
    limitations: ["Learning project."],
    evidence: ["CPU-scheduler README"],
  },
  {
    slug: "ai-data-processing",
    title: "Multithreaded Data Processing",
    tagline: "Where threads help, where the GIL stops them",
    kind: "Coursework · Operating systems",
    categories: ["products-web"],
    archive: true,
    status: "Coursework",
    year: "2026",
    problem: "Measure single- versus multi-threaded preprocessing for CPU- and I/O-bound work.",
    solution: "Splits 10,000 records across threads, measures speedup, efficiency and thread overhead, and shows diminishing returns across a thread sweep.",
    decisions: ["Verifies both versions produce identical output before comparing time."],
    features: ["CPU vs I/O modes", "Thread sweep", "Overhead measurement"],
    stack: ["Python", "React"],
    contribution: "Coursework assignment.",
    repo: gh("AI-Data-Processing-System"),
    demo: { url: "https://ai-data-processing-system.vercel.app" },
    device: "browser",
    media: [shot("ai-data-processing", "landing", "Threadlab, the live multithreading benchmark", "Live deployment, captured read-only with Playwright", "2026-11-07", 1440, 900)],
    limitations: ["Learning project."],
    evidence: ["AI-Data-Processing-System README"],
  },
];

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug);
export const inCategory = (c: Category) => projects.filter((p) => p.categories.includes(c));
