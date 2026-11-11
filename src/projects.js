/**
 * Project pages — one entry per project, in the order of the Selected Work list.
 * Copy is rewritten from the portfolio deck (Figma "Page 5" / "Page 6"); the pictures
 * are the deck's own assets, pulled out of the slides (public/assets/work/<project>/).
 *
 *  facts: [label, value] rows under the summary (value may contain line breaks)
 *  blocks: what the page is made of, top to bottom (rendered by src/detail.js):
 *    media     one picture / video, settles from a slight zoom    { src, poster?, ratio, fit?, bg? }
 *    text      label + heading + paragraph and/or list           { label, title, body?, list? }
 *    columns   short texts side by side                          { items: [{ label, text }] }
 *    browsers  long pages scrolling inside browser windows       { items: [{ src, name }] }
 *    phones    screens in phones (long ones scroll inside)       { items, layout?: "row" | "track" | "split" }
 *    cards     feature cards (text, list and/or picture)         { cols, items: [{ title, text?, list?, img? }] }
 *    steps     a process, connected by a line that fills         { items: [{ title, text }] }
 *    flow      screens in order, with a caption each (src may     { items: [{ src, title, text }] }
 *              be a list: a small stack of screens per step)
 *    diagram   how the pieces connect                            { items: [{ title, text }] }
 *    stage     pictures floating at different depths            { ratio, bg?, kit?, items: [{ src, x, y, w, d, phone?, card?, rot? }] }
 *              (card: a UI card with the deck's blue shadow, rot: its tilt in degrees; d: 0 = still;
 *              kit: a tidy board whose pieces rise in one after another)
 *    pair      two pictures drifting apart                       { items: [{ src, browser?, name? }] }
 *    wall      SHOWCASE wall (pages / screens drifting up, down) { key }
 *    marquee   SHOWCASE rows of posts gliding sideways           { key }
 *    grid      pictures in a grid, columns at different speeds   { cols, items }
 *    reel      SHOWCASE phone video + two browser videos (as on the home page)
 *  Any block can carry label / title / text for a heading.
 */
const W = "/assets/work";

/** walls + marquees, shared with the home gallery (data-wall / data-marquee) */
export const SHOWCASE = {
  reel: {
    kind: "reel",
    phone: { src: `${W}/landing/taptasy-iphone.mp4`, poster: `${W}/landing/taptasy-iphone.webp` },
    browsers: [
      { src: `${W}/web3/reel-feline.mp4`, poster: `${W}/web3/reel-feline.webp`, name: "Feline" },
      { src: `${W}/web3/reel-content.mp4`, poster: `${W}/web3/reel-content.webp`, name: "Web3 Content" },
    ],
  },
  web3: {
    kind: "wall",
    cols: 6,
    front: `${W}/web3/tablets.webp`,
    pages: ["sentient", "aifin", "content", "metapulse", "python", "virtuepay", "feline", "miro", "zenith", "playmind", "taptasy", "aibat"].map(
      (n) => `${W}/web3/lp-${n}.webp`
    ),
  },
  // screen galleries of the two LMS projects: tiles in columns, the hero screen in front
  learnxpert: {
    kind: "wall",
    tiles: true,
    cols: 5,
    per: 4,
    dur: 40,
    bg: "#eef1f8",
    front: `${W}/learnxpert/upskill.webp`,
    pages: [...Array(20)].map((_, i) => `${W}/learnxpert/g-${String(i + 1).padStart(2, "0")}.webp`),
  },
  garuda: {
    kind: "wall",
    tiles: true,
    cols: 5,
    per: 4,
    dur: 40,
    bg: "#f7eeee",
    front: `${W}/garuda/overview.webp`,
    pages: [...Array(20)].map((_, i) => `${W}/garuda/g-${String(i + 1).padStart(2, "0")}.webp`),
  },
  social: {
    kind: "marquee",
    rows: [
      { label: "Accomy", logo: `${W}/visual/logo-accomy.svg`, items: [...Array(11)].map((_, i) => `${W}/visual/acc-${String(i + 1).padStart(2, "0")}.webp`), dur: 110 },
      { label: "Ruangguru", logo: `${W}/visual/logo-ruangguru.svg`, items: [...Array(10)].map((_, i) => `${W}/visual/rg-${String(i + 1).padStart(2, "0")}.webp`), dur: 100 },
      { label: "Ajari", logo: `${W}/visual/logo-ajari.svg`, items: [...Array(16)].map((_, i) => `${W}/visual/aj-${String(i + 1).padStart(2, "0")}.webp`), dur: 130 },
    ],
  },
};

export const PROJECTS = [
  {
    slug: "accomy-landing-page",
    title: "Accomy Landing Page",
    tags: "UI/UX · Landing Page",
    summary:
      "A landing page introducing Accomy as a digital-first platform for corporate travel — one place where companies, hotels and airlines meet, with transparent booking and expense management.",
    facts: [
      ["Role", "UI/UX Designer"],
      ["Team", "Veronica Stevany — Design Lead\nCrystal Wong — Content Strategist\nErvin Loke — Content Strategist"],
      ["Skills", "UI/UX Design · Visual Assets"],
    ],
    blocks: [
      { type: "media", src: `${W}/landing/accomy-macbook.mp4`, poster: `${W}/landing/accomy-macbook.webp`, ratio: "16/9" },
      {
        type: "text",
        label: "My role",
        title: "Turning a content strategy into a page you get at a glance.",
        list: [
          "Translated the copywriting and content strategy into clear, structured layouts.",
          "Designed the page composition, visual hierarchy and UI elements, so Accomy’s value and brand message land right away.",
        ],
      },
      {
        type: "browsers",
        label: "Inside the pages",
        items: [
          { src: `${W}/accomy-lp/homepage.webp`, name: "Accomy — Home" },
          { src: `${W}/accomy-lp/operations.webp`, name: "Accomy — Operations" },
          { src: `${W}/accomy-lp/hotel-content.webp`, name: "Accomy — Hotels" },
        ],
      },
      {
        type: "text",
        label: "Challenge",
        title: "Say more with less.",
        body:
          "Accomy’s product is dense — rates, policies, APIs, live inventory. The copy had to become visual layouts that show the real UI while every message stays short and technically clear. So each complex screen was simplified down to the one idea it needed to sell.",
      },
      {
        type: "stage",
        ratio: "16/10",
        bg: "linear-gradient(160deg, #eef0ff 0%, #f6f4ff 55%, #fdf6fb 100%)",
        items: [
          { src: `${W}/accomy-lp/snip-1.webp`, x: 2, y: 5, w: 31, d: 0.5 },
          { src: `${W}/accomy-lp/snip-2.webp`, x: 69, y: 3, w: 27, d: 1 },
          { src: `${W}/accomy-lp/snip-3.webp`, x: 35, y: 17, w: 31, d: 1.5 },
          { src: `${W}/accomy-lp/snip-4.webp`, x: 4, y: 57, w: 27, d: 0.9 },
          { src: `${W}/accomy-lp/snip-5.webp`, x: 70, y: 47, w: 25, d: 0.6 },
          { src: `${W}/accomy-lp/snip-6.webp`, x: 38, y: 60, w: 23, d: 1.2 },
        ],
      },
      {
        type: "cards",
        label: "Key messages",
        title: "Nine selling points, each with its own visual.",
        cols: 3,
        items: [
          { title: "Unlock high-value corporate demand", text: "Fill rooms through Accomy’s curated network of enterprises, TMCs and OTAs." },
          { title: "Stay in charge", text: "Manage rules, blackout dates and policies, with full control over rate plans and content." },
          { title: "Real-time inventory", text: "The best rates and normalised content across flights, hotels and more." },
          { title: "Direct API connectivity", text: "B2B APIs that let TMCs and OTAs bring Accomy’s inventory into their own systems." },
          { title: "Instant access, no code", text: "A friendly B2B booking platform partners can start using from day one." },
          { title: "Centralised rate management", text: "Every negotiated rate in one place, always up to date." },
          { title: "Real-time booking", text: "Trained consultants help travellers book or change plans on the fly." },
          { title: "VIP concierge", text: "Tailored services and concierge access for leadership teams." },
          { title: "White-label booking", text: "Hotel booking under your own brand, powered by Accomy’s content, tech and reliability." },
        ],
      },
      {
        type: "phones",
        layout: "split",
        label: "On mobile",
        title: "The same story, one thumb away.",
        text: "The mobile version keeps the narrative intact — every section stacks into a single, easy scroll.",
        items: [`${W}/accomy-lp/mobile-finance.webp`],
      },
      { type: "media", src: `${W}/accomy-lp/showcase.webp`, ratio: "16/9" },
    ],
  },
  {
    slug: "learnxpert",
    title: "LearnXpert",
    tags: "UI/UX · LMS · Design System",
    summary:
      "A learning & development platform where companies plan, build and run employee training — courses, learning journeys, assessments and analytics — with a workspace of its own for Admins, Trainers, Trainees and HR.",
    facts: [
      ["Role", "Sole designer — UI/UX & front-end"],
      ["Timeline", "March – November 2026 (8 months)"],
      ["Scope", "200+ screens · 4 roles"],
      ["Tools", "Figma · Dyad · Claude Code"],
    ],
    blocks: [
      { type: "media", src: `${W}/learnxpert/laptop.mp4`, poster: `${W}/learnxpert/laptop.webp`, ratio: "16/9" },
      {
        type: "text",
        label: "Objective",
        title: "One system for four very different roles.",
        body:
          "Design LearnXpert and build its front end: one consistent system for every role, with NISA, the AI assistant, working inside the daily flow instead of sitting beside it. The hard part was giving Admins, Trainers, Trainees and HR a workspace of their own while 200+ screens stay on one system.",
      },
      {
        type: "stage",
        ratio: "16/10",
        bg: "linear-gradient(160deg, #eaf0fd 0%, #f4f7fe 55%, #fdfdff 100%)",
        items: [
          { src: `${W}/learnxpert/ipad.webp`, x: 10, y: 4, w: 70, d: 0.4 },
          { src: `${W}/learnxpert/funnel.webp`, x: 8, y: 34, w: 19, d: 1.3, card: true, rot: -3 },
          { src: `${W}/learnxpert/insights.webp`, x: 55, y: 15, w: 22, d: 1, card: true, rot: -3 },
        ],
      },
      {
        type: "steps",
        label: "How I built it",
        title: "From references to running code.",
        items: [
          { title: "Research", text: "Studied how 30 products handle course building and quizzes, from 50+ Mobbin references — Udemy, Teachable, Kajabi, Duolingo." },
          { title: "Directions", text: "Explored four visual directions on three key pages — Home, Analytics and Upskill Studio — then picked one." },
          { title: "One system", text: "Turned it into one design system, documented inside the product: tokens, components, charts and motion, in light and dark." },
          { title: "Built with AI", text: "Built the screens in code with AI, in small scoped steps, with checklists and QA passes in the browser." },
        ],
      },
      {
        type: "cards",
        label: "Key features",
        title: "Everything a training team runs on.",
        cols: 4,
        items: [
          { title: "Role-based dashboards", text: "Admin, Trainer, Trainee and HR each get their own, built from the same cards, charts and insights." },
          { title: "NISA, the AI assistant", text: "Flags courses at risk and drafts courses, quizzes and assignments from one prompt." },
          { title: "Upskill Studio", text: "Build courses as Topic → Module → Activity, with review, versions and a trainee preview." },
          { title: "Journeys & analytics", text: "Learning journeys, quiz and assessment libraries, and analytics for courses, trainers and trainees." },
          { title: "Quiz player", text: "A timer and progress while you answer, then results with the pass mark, NISA feedback and an answer review." },
          { title: "Agenda & Circle", text: "A week view for every role, plus Circle for direct messages and course channels." },
          { title: "People", text: "Add, edit and deactivate employees, upload them in bulk, and assign trainers, admins and roles." },
          { title: "Reading material editor", text: "Block-based writing with AI menus and an employee preview, in English and Arabic." },
        ],
      },
      {
        type: "stage",
        label: "Upskill Studio",
        title: "A course from one prompt — checked before it goes live.",
        text: "NISA drafts courses, quizzes and assignments from a single prompt; the trainer builds on it as Topic → Module → Activity and reviews everything before publishing.",
        ratio: "16/10",
        bg: "linear-gradient(160deg, #eaf0fd 0%, #f4f7fe 55%, #fdfdff 100%)",
        items: [
          { src: `${W}/learnxpert/create.webp`, x: 6, y: 9, w: 74, d: 0.4, card: true },
          { src: `${W}/learnxpert/generating.webp`, x: 58, y: 52, w: 21, d: 1.3, card: true },
        ],
      },
      { type: "wall", key: "learnxpert", label: "Screens", title: "200+ screens, one system." },
    ],
  },
  {
    slug: "sekolah-garuda",
    title: "Sekolah Garuda",
    tags: "UI/UX · EdTech · AI",
    summary:
      "A learning platform for Indonesian government secondary schools (LearnXpert Edu). One product serves students, teachers, school admins, the platform team and the government — from daily classes, assignments and grading to talent mapping.",
    facts: [
      ["Role", "Sole UI/UX Designer"],
      ["Team", "Front-end team for API integration"],
      ["Skills", "UI/UX Design · Design System"],
      ["Tools", "Figma · Claude Code"],
    ],
    blocks: [
      { type: "media", src: `${W}/garuda/recording.mp4`, poster: `${W}/garuda/recording.webp`, ratio: "16/10" },
      {
        type: "text",
        label: "NISA, built in",
        title: "An assistant for every seat in the system.",
        body:
          "NISA, the AI assistant, is part of the product rather than an add-on: it ranks each student’s priorities, helps teachers prepare material in NISA Lab and turns data from 38 provinces into insights for the government.",
      },
      {
        type: "text",
        label: "My role",
        title: "Five roles, one design language.",
        list: [
          "Designed the experience for every role — Siswa, Guru, Admin, Superadmin and Pemerintah — on one design system.",
          "Wrote the design language every screen follows (trustworthy, warm, calm and clear, targeting WCAG AA) and turned it into tokens.",
          "Researched each flow with Mobbin references and wrote user scenarios, from school onboarding and Dapodik provisioning to empty states.",
          "Designed NISA Lab, the AI workspace where teachers turn their own sources into ready-to-teach material.",
          "Built 100+ pages as production-grade front end with Claude Code, ready for developers to connect the APIs.",
        ],
      },
      {
        type: "flow",
        label: "NISA Lab",
        title: "From one question to a ready-to-teach lesson.",
        text: "How a teacher prepares material in NISA Lab, the AI workspace of Sekolah Garuda — from a single question to the format students meet in class.",
        items: [
          {
            src: [`${W}/garuda/lab-home.webp`, `${W}/garuda/lab-materi.webp`],
            title: "Start from a question",
            text: "Ask NISA on the Lab home, or open the Ruang Materi of the chapter you are teaching.",
          },
          {
            src: [`${W}/garuda/lab-room.webp`, `${W}/garuda/lab-library.webp`],
            title: "Bring your own sources",
            text: "Add textbooks, notes, videos and PDFs, or copy material from the Library. NISA answers only from what you tick.",
          },
          {
            src: [`${W}/garuda/lab-slide.webp`, `${W}/garuda/lab-latihan.webp`],
            title: "Pick how students meet it",
            text: "Bacaan, Interaktif, Slide, Cetak or Refleksi — the same content in every format, so nothing gets rebuilt.",
          },
        ],
      },
      { type: "wall", key: "garuda", label: "Screens", title: "100+ pages, ready for the APIs." },
    ],
  },
  {
    slug: "web3-landing-pages",
    title: "Web3 Landing Pages",
    tags: "UI/UX · Web3 · Responsive",
    summary:
      "A series of landing pages for Web3 products, NFT drops and crypto platforms. Every launch told a different story — from playful meme campaigns to enterprise blockchain releases — so each page got its own layout, visual language and mini design system.",
    facts: [
      ["Role", "UI/UX Designer"],
      ["Team", "Veronica Stevany — Creative Lead"],
      ["Timeline", "1–2 days per page"],
      ["Tools", "Figma · Photoshop · Midjourney · Sora · Hailuo"],
    ],
    blocks: [
      { type: "reel", key: "reel" },
      {
        type: "text",
        label: "My role",
        title: "One brief in, a whole brand world out.",
        list: [
          "Designed layouts and interfaces from each campaign’s copy and creative direction.",
          "Generated AI imagery and short motion pieces to give every page its own atmosphere.",
          "Built a mini design system for each launch — type, components and colour tokens — to keep visuals consistent and quick to produce.",
        ],
      },
      { type: "wall", key: "web3" },
      {
        type: "steps",
        label: "Process",
        title: "Fast, without looking fast.",
        items: [
          { title: "Wireframe first", text: "Quick wireframes settle the structure, content hierarchy and layout direction before any visuals." },
          { title: "Generate with AI", text: "Midjourney and Sora for key visuals, Hailuo for motion — production keeps up with launch dates." },
          { title: "System in parallel", text: "While the visuals render, I set up the design system: typography, components and colour tokens." },
          { title: "Never the same twice", text: "The goal for every page: no two brands share a visual tone or storytelling approach." },
        ],
      },
      {
        type: "text",
        label: "Storytelling",
        title: "Letting each brand play.",
        body:
          "Beside corporate and protocol sites, many launches were pure fun — meme coins, GameFi worlds, AI agents. I leaned into the story of each one, while keeping the visuals tailored to the brand behind it.",
      },
      {
        type: "browsers",
        items: [
          { src: `${W}/web3/lp-python.webp`, name: "Python" },
          { src: `${W}/web3/lp-feline.webp`, name: "Feline" },
          { src: `${W}/web3/lp-taptasy.webp`, name: "Final Taptasy" },
        ],
      },
      {
        type: "pair",
        items: [
          { src: `${W}/web3/diviverse.webp`, browser: true, name: "Diviverse" },
          { src: `${W}/web3/squadverse.webp`, browser: true, name: "SquadVerse" },
        ],
      },
    ],
  },
  {
    slug: "miro-mcard",
    title: "MIRO M-Card",
    tags: "Mobile App · Crypto Payment",
    summary:
      "A crypto payment app that bridges digital assets and everyday money — multi-currency cards, Web3 deposits and peer-to-peer remittance, wrapped in a sleek, futuristic interface.",
    facts: [
      ["Role", "UI/UX Designer"],
      ["Team", "Veronica Stevany — Creative Lead"],
      ["Platform", "Mobile app"],
      ["Tools", "Figma"],
    ],
    blocks: [
      { type: "media", src: `${W}/miro/mcard-phone.mp4`, poster: `${W}/miro/mcard-phone.webp`, ratio: "16/9" },
      {
        type: "text",
        label: "My role",
        title: "Making money moves feel effortless — and safe.",
        list: [
          "Defined the layout, wireframes and design system, so every screen speaks the same language.",
          "Designed the end-to-end transaction flows: add deposit, transfer and withdrawal.",
          "Built the complete authentication and KYC verification experience.",
        ],
      },
      {
        type: "phones",
        layout: "track",
        label: "Screens",
        title: "From first launch to first payment.",
        items: ["onboarding", "home", "my-card", "card-details", "deposit", "transfer", "card-shop", "kyc"].map((n) => `${W}/miro/s-${n}.webp`),
      },
      {
        type: "cards",
        label: "Key features",
        cols: 4,
        items: [
          { title: "Multi-currency", text: "USD, CNY and HKD side by side with assets on multiple chains." },
          { title: "Deposit, withdraw, transfer", text: "Step-by-step flows, each one protected by PIN and verification." },
          { title: "Card management", text: "Apply for a card, add money, check card details and earn referral rewards." },
          { title: "Identity, verified", text: "KYC with document upload and a PIN keeps every account secure." },
        ],
      },
    ],
  },
  {
    slug: "accomy-booking-platform",
    title: "Accomy Booking Platform",
    tags: "UI/UX · Web App · Booking",
    summary:
      "A white-label hotel and flight booking platform for corporate teams — reservations, payments and invoices in one streamlined system, designed to build trust and turn visitors into users through a clear structure.",
    facts: [
      ["Role", "UI/UX Designer"],
      ["Team", "Veronica Stevany — Creative Lead\nZhu Zheng Wen — Product Manager"],
      ["Scope", "MVP booking flow"],
      ["Tools", "Figma · Photoshop"],
    ],
    blocks: [
      {
        type: "stage",
        ratio: "16/9",
        bg: "#eae9ee", // (the MacBook render’s own backdrop)
        items: [
          { src: `${W}/accomy/macbook.webp`, x: 8, y: 4, w: 64, d: 0.4 },
          { src: `${W}/accomy/phone.webp`, x: 72, y: 22, w: 16, d: 1.2, phone: true },
        ],
      },
      {
        type: "text",
        label: "My role",
        title: "Booking travel for work should be the easy part.",
        list: [
          "Designed the booking dashboard and the end-to-end booking flow.",
          "Shaped the information hierarchy and filter system, so travellers decide faster.",
          "Worked with the design lead and copywriter to keep tone and usability aligned for corporate users.",
        ],
      },
      {
        type: "diagram",
        label: "How it works",
        title: "One platform between companies and suppliers.",
        items: [
          { title: "Company", text: "Books hotels and flights, and handles corporate travel admin." },
          { title: "Accomy", text: "Bridges companies and partners with transparent data and billing." },
          { title: "Hotel & flight chains", text: "Receive bookings and payments in real time through an integrated system." },
        ],
      },
      {
        type: "columns",
        items: [
          {
            label: "Appeal point",
            text: "Accomy digitalises and centralises corporate travel — aggregating global hotel rates and automating bookings, payments and invoices for faster, transparent and compliant operations.",
          },
          {
            label: "Goal",
            text: "Design the first booking flow for the MVP — hotel search, payment and cancellation — as the foundation of the platform’s core booking experience.",
          },
        ],
      },
      {
        type: "steps",
        label: "Design process",
        title: "From scope to handoff.",
        items: [
          { title: "Requirement analysis", text: "Defined the MVP scope and features together with the PM and business team." },
          { title: "Flow mapping", text: "Mapped the booking flow and wireframes, from search to payment and cancellation." },
          { title: "UI design", text: "Designed high-fidelity screens and reusable components in Figma." },
          { title: "Developer handoff", text: "Delivered an annotated design file and walked the developers through it." },
        ],
      },
      {
        type: "flow",
        label: "Booking flow",
        title: "From search to confirmed, in five screens.",
        items: [
          { src: `${W}/accomy/flow-1.webp`, title: "Search & filter", text: "Find hotels by city, dates and filters." },
          { src: `${W}/accomy/flow-2.webp`, title: "Search results", text: "Listings with policy flags and corporate rates." },
          { src: `${W}/accomy/flow-3.webp`, title: "Hotel details", text: "Rooms, prices and booking information." },
          { src: `${W}/accomy/flow-4.webp`, title: "Guest details", text: "Traveller details for corporate records." },
          { src: `${W}/accomy/flow-5.webp`, title: "Payment", text: "Pay, then get an instant confirmation." },
        ],
      },
      {
        type: "cards",
        label: "MVP core features",
        cols: 3,
        items: [
          { title: "Dashboard", list: ["Overview of active bookings", "Summary of total expenses"] },
          { title: "Hotel booking", list: ["Search by location, dates and guests", "Filter by price and star rating", "List → detail → room → booking → confirmation"] },
          { title: "Flight booking", list: ["Search by origin, destination, date and passengers", "Flight list → seats → passengers → confirmation"] },
          { title: "My bookings", list: ["Past and current bookings", "Status, invoice, modify or cancel"] },
          { title: "Invoices & payment", list: ["Centralised payment summary", "Invoice download per booking", "Monthly billing for the company"] },
          { title: "Profile & settings", list: ["Employee ID and department", "Company travel policy", "Linked payment method"] },
        ],
      },
      {
        type: "stage",
        label: "Components",
        title: "A kit of reusable pieces behind every screen.",
        // (the deck's "Accomy App · Screens" board, straightened: same columns, same crop)
        ratio: "16/9",
        kit: true,
        bg: "radial-gradient(36% 42% at 18% 90%, rgba(196, 181, 253, 0.5), transparent 70%), radial-gradient(30% 32% at 55% 50%, rgba(187, 247, 208, 0.5), transparent 70%), radial-gradient(34% 40% at 95% 5%, rgba(251, 207, 232, 0.55), transparent 70%), #f6f6f9",
        items: [
          { src: `${W}/accomy/kit/room-guests.webp`, x: -6.8, y: -4.32, w: 17.5, d: 0 },
          { src: `${W}/accomy/kit/hotel-list.webp`, x: -1.6, y: 16.8, w: 32.36, d: 0 },
          { src: `${W}/accomy/kit/refund-timeline.webp`, x: -1.66, y: 41.11, w: 32.54, d: 0 },
          { src: `${W}/accomy/kit/gallery.webp`, x: -1.66, y: 54.59, w: 32.54, d: 0 },
          { src: `${W}/accomy/kit/search-currency.webp`, x: -2.62, y: 85.06, w: 34.63, d: 0 },
          { src: `${W}/accomy/kit/main-guest.webp`, x: -1.57, y: 94.1, w: 17.7, d: 0 },
          { src: `${W}/accomy/kit/date-picker-top.webp`, x: 11.77, y: -24.92, w: 19.11, d: 0 },
          { src: `${W}/accomy/kit/stay-dates.webp`, x: 16.77, y: 95.39, w: 14.16, d: 0 },
          { src: `${W}/accomy/kit/fee-breakdown.webp`, x: 32.63, y: -1.91, w: 21.02, d: 0 },
          { src: `${W}/accomy/kit/stay-bar.webp`, x: 32.63, y: 34.61, w: 45.93, d: 0 },
          { src: `${W}/accomy/kit/price-change.webp`, x: 32.63, y: 45.82, w: 22.99, d: 0 },
          { src: `${W}/accomy/kit/date-picker.webp`, x: 32.94, y: 77.42, w: 19.11, d: 0 },
          { src: `${W}/accomy/kit/hotel-brands.webp`, x: 53.18, y: 77.42, w: 25.32, d: 0 },
          { src: `${W}/accomy/kit/hotel-grid.webp`, x: 54.48, y: -9.44, w: 14.15, d: 0 },
          { src: `${W}/accomy/kit/add-guest.webp`, x: 54.48, y: 24.63, w: 14.15, d: 0 },
          { src: `${W}/accomy/kit/hotel-card.webp`, x: 56.99, y: 45.86, w: 21.56, d: 0 },
          { src: `${W}/accomy/kit/room-photo.webp`, x: 70.07, y: -5.83, w: 17.79, d: 0 },
          { src: `${W}/accomy/kit/btn-apply.webp`, x: 69.47, y: 24.74, w: 10.3, d: 0 },
          { src: `${W}/accomy/kit/inputs.webp`, x: 89.47, y: -3.4, w: 17.53, d: 0 },
          { src: `${W}/accomy/kit/search-results.webp`, x: 80.97, y: 21.92, w: 22.63, d: 0 },
          { src: `${W}/accomy/kit/btn-add-account.webp`, x: 79.5, y: 93.32, w: 11.05, d: 0 },
          { src: `${W}/accomy/kit/btn-cancel.webp`, x: 91.62, y: 93.32, w: 12.54, d: 0 },
        ],
      },
      {
        type: "pair",
        items: [
          { src: `${W}/accomy/home.webp`, browser: true, name: "Accomy — Home" },
          { src: `${W}/accomy/search.webp`, browser: true, name: "Accomy — Search results" },
        ],
      },
    ],
  },
  {
    slug: "visual-content-design",
    title: "Visual Content Design",
    tags: "Graphic Design · Social Media",
    summary:
      "Instagram posts for brands from corporate travel and edutech for children to AI in education — laid out in Figma, brought to life with digital imaging in Photoshop, with AI-generated assets or stock photos when they serve the idea.",
    facts: [
      ["Role", "Graphic Designer"],
      ["Brands", "Accomy · Ruangguru · Ajari"],
      ["Team", "Veronica Stevany — Creative Lead\nIna Suwarni — Creative Lead"],
      ["Tools", "Figma · Photoshop · Illustrator · ChatGPT · Midjourney"],
    ],
    blocks: [
      { type: "marquee", key: "social" },
      {
        type: "text",
        label: "Digital imaging",
        title: "Posts made to stop the scroll.",
        body:
          "A collection of Instagram posts designed since 2020 — from corporate travel visuals to edutech content for children and pieces on AI in education. I usually lay them out in Figma, build the digital imaging in Photoshop, and bring in AI-generated assets or stock photos when they support the idea.",
      },
      {
        type: "grid",
        label: "Accomy",
        title: "Corporate travel, made friendly.",
        cols: 4,
        items: [...Array(11)].map((_, i) => `${W}/visual/acc-${String(i + 1).padStart(2, "0")}.webp`),
      },
      {
        type: "grid",
        label: "Ruangguru",
        title: "Edutech for kids, bright and playful.",
        cols: 4,
        items: [...Array(10)].map((_, i) => `${W}/visual/rg-${String(i + 1).padStart(2, "0")}.webp`),
      },
      {
        type: "grid",
        label: "Ajari",
        title: "AI in education, explained.",
        cols: 4,
        items: [...Array(16)].map((_, i) => `${W}/visual/aj-${String(i + 1).padStart(2, "0")}.webp`),
      },
    ],
  },
];
