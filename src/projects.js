/**
 * Project pages — one entry per project, in the order of the Selected Work list.
 * Copy is rewritten from the portfolio deck (Figma "Page 5"); the pictures are the
 * deck's own assets, pulled out of the slides (public/assets/work/<project>/).
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
 *    flow      phone screens in order, with a caption each       { items: [{ src, title, text }] }
 *    diagram   how the pieces connect                            { items: [{ title, text }] }
 *    stage     pictures floating at different depths            { ratio, bg?, items: [{ src, x, y, w, d, phone? }] }
 *    pair      two pictures drifting apart                       { items: [{ src, browser?, name? }] }
 *    spread    print pieces fanning out of a pile                 { items: [{ src, label }] }
 *    wall      SHOWCASE wall (long pages drifting up / down)     { key }
 *    marquee   SHOWCASE rows of posters gliding sideways         { key }
 *    grid      pictures in a grid, columns at different speeds   { cols, items }
 *    palette   brand colours                                     { items: [{ hex, name }] }
 *    logos     logo tiles that pop in                            { items }
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
  posters: {
    kind: "marquee",
    rows: [
      { items: [1, 2, 3, 4, 5, 6, 7].map((i) => `${W}/visual/p-0${i}.webp`).concat(`${W}/visual/p-tall.webp`), dur: 90 },
      { items: [8, 9, 10, 11, 12, 13, 14].map((i) => `${W}/visual/p-${String(i).padStart(2, "0")}.webp`), dur: 80 },
    ],
  },
  social: {
    kind: "marquee",
    rows: [
      { label: "Accomy", logo: `${W}/visual/logo-accomy.svg`, items: [...Array(11)].map((_, i) => `${W}/visual/acc-${String(i + 1).padStart(2, "0")}.webp`), dur: 110 },
      { label: "Ruangguru", logo: `${W}/visual/logo-ruangguru.svg`, items: [...Array(10)].map((_, i) => `${W}/visual/rg-${String(i + 1).padStart(2, "0")}.webp`), dur: 100 },
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
      {
        type: "pair",
        bg: "linear-gradient(160deg, #efeaff 0%, #f7f4ff 60%, #fdf2f8 100%)",
        items: [{ src: `${W}/miro/phones-duo.webp` }, { src: `${W}/miro/phones-iso.webp` }],
      },
    ],
  },
  {
    slug: "codexfield",
    title: "CodexField",
    tags: "UI/UX · Web3 · AI",
    summary:
      "A Web3 creator platform that brings AI generation tools, a crypto wallet and on-chain quests together in one interface — for managing assets and keeping users engaged.",
    facts: [
      ["Role", "UI/UX Designer"],
      ["Team", "Veronica Stevany — Creative Lead"],
      ["Tools", "Figma"],
    ],
    blocks: [
      {
        type: "stage",
        ratio: "16/9",
        bg: "linear-gradient(160deg, #efeaff 0%, #f7f4ff 60%, #fdf2f8 100%)",
        items: [
          { src: `${W}/codexfield/ipad.webp`, x: 17, y: 6, w: 39, d: 0.5 },
          { src: `${W}/codexfield/iphone.webp`, x: 50, y: 20, w: 33, d: 1.3 },
        ],
      },
      {
        type: "text",
        label: "My role",
        title: "From client wireframes to one consistent product.",
        list: [
          "Built the design system and kept the visuals consistent across every product module.",
          "Created UI assets, illustrations and icons with AI tools, based on the client’s wireframes.",
          "Refined interactions and visual hierarchy to match the product’s technical flow.",
        ],
      },
      {
        type: "cards",
        label: "Key features",
        title: "Four modules, one ecosystem.",
        cols: 4,
        items: [
          { title: "Token transfer", text: "Send, receive and bridge tokens between networks without leaving the dashboard.", img: `${W}/codexfield/f-transfer.webp` },
          { title: "Marketplace", text: "Publish, trade and deploy AI-generated code, templates and assets.", img: `${W}/codexfield/f-market.webp` },
          { title: "AI Playground", text: "An interactive workspace to build, test and generate AI-driven code and assets.", img: `${W}/codexfield/f-playground.webp` },
          { title: "Quests & ranks", text: "On-chain quests reward points for completed tasks — progression that keeps users coming back.", img: `${W}/codexfield/f-quest.webp` },
        ],
      },
      { type: "media", src: `${W}/codexfield/overview.webp`, ratio: "16/9" },
      {
        type: "phones",
        layout: "split",
        label: "Also designed",
        title: "AiBat",
        text: "An AI-driven DeFi platform combining liquidity mining, cross-chain trading and a multi-level node reward system.",
        items: [1, 2, 3].map((i) => `${W}/codexfield/aibat-${i}.webp`),
      },
      {
        type: "phones",
        layout: "split",
        flip: true,
        title: "Sentient PCDN",
        text: "A DeFi and AI earning platform that pairs a staking-task system with a multi-level agent network.",
        items: [1, 2, 3].map((i) => `${W}/codexfield/sentient-${i}.webp`),
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
        ratio: "16/10",
        bg: "linear-gradient(160deg, #f1f2f6 0%, #f7f7fa 100%)",
        items: [
          { src: `${W}/accomy/c-card-grid.webp`, x: 3, y: 6, w: 23, d: 0.7 },
          { src: `${W}/accomy/c-card-list.webp`, x: 31, y: 4, w: 35, d: 1.2 },
          { src: `${W}/accomy/c-modal.webp`, x: 72, y: 8, w: 24, d: 0.5 },
          { src: `${W}/accomy/c-progress.webp`, x: 6, y: 52, w: 36, d: 1.4 },
          { src: `${W}/accomy/c-details.webp`, x: 47, y: 42, w: 22, d: 0.8 },
          { src: `${W}/accomy/c-brands.webp`, x: 74, y: 52, w: 21, d: 1.1 },
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
    tags: "Graphic Design · Marketing · Campaign",
    summary:
      "Digital visuals for Web3 brands — campaign posters for X, one-pagers, decks and print — many made with AI-assisted tools, plus five years of social media imaging for brands from corporate travel to edutech for kids.",
    facts: [
      ["Role", "Graphic Designer"],
      ["Team", "Veronica Stevany — Creative Lead\nIna Suwarni — Creative Lead"],
      ["Pace", "1–3 hours per poster"],
      ["Tools", "Figma · Photoshop · Illustrator · AI tools"],
    ],
    blocks: [
      { type: "marquee", key: "posters" },
      {
        type: "text",
        label: "My role",
        title: "A new brand every hour, the same care every time.",
        list: [
          "Set the key visual direction and creative concept for each campaign.",
          "Generated imagery with AI to build the visual foundation and the storytelling.",
          "Kept layouts and design systems cohesive across every digital asset.",
        ],
      },
      {
        type: "steps",
        label: "Process",
        title: "From brief to poster in one to three hours.",
        items: [
          { title: "Key visual", text: "Define the key visual and layout direction from the content or campaign." },
          { title: "Make the parts", text: "Generate supporting visuals with AI — 3D objects, textures — or illustrate them in Illustrator." },
          { title: "Compose & refine", text: "Arrange the elements, set the lighting and typography, then polish the final poster." },
        ],
      },
      {
        type: "text",
        label: "Challenge",
        title: "Switching styles without losing the thread.",
        body:
          "Changing brand styles almost every hour is exhausting, but rewarding. It trained me to stay flexible and lean on clear design logic — so I can jump between styles without losing direction or quality.",
      },
      {
        type: "spread",
        label: "Print & presentation",
        title: "Long-form, print-ready, multilingual.",
        text: "One-pagers, whitepapers, brand decks and Google Slides — built for clear structure, readability and one consistent identity across digital and print, translated into multiple languages.",
        items: [
          { src: `${W}/visual/onepager-1.webp`, label: "One pager" },
          { src: `${W}/visual/paper-1.webp`, label: "White paper" },
          { src: `${W}/visual/trifold-1.webp`, label: "Trifold brochure" },
          { src: `${W}/visual/slides-1.webp`, label: "Google Slides deck" },
          { src: `${W}/visual/paper-3.webp`, label: "White paper" },
          { src: `${W}/visual/onepager-3.webp`, label: "One pager · Korean" },
        ],
      },
      {
        type: "text",
        label: "Digital imaging",
        title: "Five years of feeds.",
        body:
          "Instagram posts designed between 2020 and 2025, from corporate travel to edutech for children. Figma for the layout, Photoshop for the imaging — and AI or stock images when they serve the idea.",
      },
      { type: "marquee", key: "social" },
    ],
  },
  {
    slug: "branding-projects",
    title: "Branding Projects",
    tags: "Brand Guideline · Logo",
    summary:
      "A brand identity for English Academy Juniors — Ruangguru’s English course for children aged 3–12 — with advertising posters for its online and offline launch, plus a collection of logos for Web3 projects.",
    facts: [
      ["Role", "Graphic Designer"],
      ["Team", "Vostino Thanod — Creative Lead\nIna Suwarni — Creative Lead"],
      ["Tools", "Illustrator · Photoshop"],
    ],
    blocks: [
      { type: "media", src: `${W}/branding/ea-kv.webp`, ratio: "16/9" },
      {
        type: "text",
        label: "English Academy Juniors",
        title: "A brand kids want to play with — and parents trust.",
        body:
          "To launch its newest product, Ruangguru needed an identity that fits a young audience, plus posters to promote it online and offline. I created the brand guideline, the logo and the visual direction — a fresh, colourful palette that keeps everything playful and engaging for children.",
      },
      {
        type: "palette",
        items: [
          { hex: "#724CF9", name: "Majorelle Blue" },
          { hex: "#FF5C59", name: "Orange Red Crayola" },
          { hex: "#C7EF00", name: "Arctic Lime", dark: true },
          { hex: "#1AAF9E", name: "Keppel" },
          { hex: "#F3FAF9", name: "Baby Powder", dark: true },
          { hex: "#282828", name: "Eerie Black" },
        ],
      },
      { type: "media", src: `${W}/branding/ea-board.webp`, ratio: "4001/3049", fit: "contain", bg: "#ffffff" },
      { type: "grid", cols: 3, items: [...Array(9)].map((_, i) => `${W}/branding/ea-${i + 1}.webp`) },
      {
        type: "text",
        label: "Web3 logo collection",
        title: "Concept first, shapes second.",
        body:
          "Every logo starts with understanding the brand — its concept and purpose — before it becomes a visual form. I sketch several directions, then refine them in Illustrator, exploring shapes, meanings and colour. Timelines vary, so iterations stay quick while the final marks stay polished.",
      },
      { type: "logos", items: [...Array(14)].map((_, i) => `${W}/branding/logo-${String(i + 1).padStart(2, "0")}.webp`) },
    ],
  },
];
