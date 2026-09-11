import type { ComponentType } from "react";
import { FileText, Home, MapPin, User } from "lucide-react";

export interface GuideStat {
  label: string;
  value: string;
}

export interface GuideSection {
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface GuideAuthor {
  name: string;
  role: string;
  credential?: string;
}

export interface GuidePageContent {
  slug: string;
  title: string;
  /** Optional second title line rendered in the brand amber (modfii.com hub style). */
  highlight?: string;
  eyebrow: string;
  /** Contextual icon for the eyebrow pill (source varies it per page; default Star). */
  eyebrowIcon?: ComponentType<{ className?: string }>;
  description: string;
  heroImage?: "/images/hero-prefab.jpg" | "/images/green-home.jpg" | "/images/adu-backyard.jpg" | "/images/tiny-home.jpg" | "/images/interior-living.jpg";
  stats?: GuideStat[];
  sections: GuideSection[];
  faqs?: Array<{ question: string; answer: string }>;
  related?: Array<{ href: string; title: string; description: string }>;
  cta: string;
  /** Extra hero CTAs (source renders a pair on hub + loan pages). Overrides the default single /get-started CTA when present. */
  ctas?: Array<{ label: string; href: string; variant?: "secondary" | "onPrimary" | "accent" | "outline" }>;
  /** Source renders "Last Updated: …" under the hero breadcrumbs (hub + loan pages). */
  updated?: string;
  /** Source hub "Here's the truth" glass callout paragraphs (lead phrase + body). */
  callout?: Array<{ lead: string; text: string }>;
  /** Source shows a written-by / reviewed-by strip directly under the hero. */
  author?: GuideAuthor;
  reviewedBy?: GuideAuthor;
}

export const GUIDES: Record<string, GuidePageContent> = {
  "modular-home-financing": {
    slug: "modular-home-financing",
    title: "Modular Home Financing",
    highlight: "Made Simple",
    eyebrow: "50+ Specialized Lenders",
    description:
      "Most banks don't understand prefab construction—leading to delays, denials, and lost deposits. ModFii connects you with lenders who specialize in modular home financing, so you close faster and save thousands.",
    heroImage: "/images/hero-prefab.jpg",
    updated: "January 2026",
    callout: [
      {
        lead: "Here's the truth:",
        text: "Modular homes are built in factories to the same building codes as site-built homes. They're real property. They appreciate like traditional homes. And they qualify for FHA, VA, USDA, and conventional mortgages—just like any other home.",
      },
      {
        lead: "But most lenders don't understand that.",
        text: "The result? Good buyers get rejected, overpay on rates, or wait months for approvals that should take days. Manufacturers lose sales. Deposits get forfeited.",
      },
      {
        lead: "ModFii exists to solve this.",
        text: "We match you with lenders who specialize in factory-built construction and close loans in days, not months—with a 94% approval rate.",
      },
    ],
    ctas: [
      { label: "Get Pre-Approved Now", href: "/get-started", variant: "secondary" },
      { label: "Compare Loan Options", href: "/modular-home-financing/loan-options", variant: "onPrimary" },
    ],
    stats: [
      { label: "Approval rate", value: "94%" },
      { label: "Typical approval", value: "7 days" },
      { label: "Closing fee", value: "0.5%" },
      { label: "Avg. buyer savings", value: "$12K" },
    ],
    sections: [
      {
        heading: "Why modular financing is different",
        body: [
          "Modular homes are built to the same local building codes as site-built houses. Once set on a permanent foundation and titled as real estate, they generally qualify for the same mortgage products as any other home.",
          "The problem is operational, not legal: many loan officers have never seen a factory invoice, a crane-set draw, or a manufacturer packet. They stall, misclassify the home as chattel, or demand the wrong appraisal.",
        ],
      },
      {
        heading: "Loan paths that actually close",
        body: ["Most ModFii buyers land in one of five programs, depending on credit, location, military status, and whether land is already owned."],
        bullets: [
          "FHA — 3.5% down, 580 credit, permanent foundation required",
          "VA — 0% down for eligible veterans when the home is real property",
          "USDA — 0% down in eligible rural and suburban-edge census tracts",
          "Conventional / CrossMod — 3–20% down, often the lowest rate",
          "Construction-to-permanent — one closing from factory to forever home",
        ],
      },
      {
        heading: "What lenders need from you",
        body: [
          "Have your manufacturer, model, and site plan before full underwriting. Factory-built files close faster when the packet includes HUD or state modular labels, foundation engineering, and a delivery calendar.",
        ],
      },
    ],
    related: [
      { href: "/modular-home-financing/loan-options", title: "Loan options", description: "FHA, VA, USDA, conventional, and C2P compared." },
      { href: "/modular-home-financing/cost", title: "Cost breakdown", description: "Home, foundation, site work, and contingency." },
      { href: "/calculator", title: "Payment calculator", description: "Estimate PITI with PMI and taxes." },
    ],
    cta: "Get pre-qualified for modular financing",
  },
  financing: {
    slug: "financing",
    title: "Prefab & Modular Financing",
    eyebrow: "Programs",
    description:
      "A marketplace built only for factory-built housing. We introduce you to lenders who already understand modular, panelized, ADU, and HUD-code homes.",
    heroImage: "/images/green-home.jpg",
    sections: [
      {
        heading: "A specialist desk, not a generic marketplace",
        body: [
          "LendingTree-style shops send prefab files into the same queue as condos and tract homes. ModFii only works with desks that have closed factory-built loans in the last 12 months.",
        ],
      },
      {
        heading: "Green mortgage discounts",
        body: [
          "Many modular lines ship with ENERGY STAR, HERS, or Passive House credentials. Those ratings can buy 10–50 basis points off rate when documented correctly—something traditional banks rarely request.",
        ],
      },
    ],
    related: [
      { href: "/modular-home-financing", title: "Modular financing hub", description: "Start here if you already picked a builder." },
      { href: "/mortgage", title: "Mortgage overview", description: "How prefab mortgages are underwritten." },
    ],
    cta: "See your financing options",
  },
  mortgage: {
    slug: "mortgage",
    title: "Prefab Home Mortgages",
    eyebrow: "Real property lending",
    description:
      "When a factory-built home is permanently affixed and titled as real estate, it can be mortgaged like a site-built house—if the lender, appraiser, and insurer all treat it that way.",
    heroImage: "/images/interior-living.jpg",
    sections: [
      {
        heading: "Mortgage vs. chattel",
        body: [
          "A mortgage is secured by real property: land plus a home on a permanent foundation. Chattel (personal property) loans are for homes that can be moved, including many HUD-code units still on axles. Mortgage money is cheaper. Classification is the whole game.",
        ],
      },
      {
        heading: "What a prefab-fluent underwriter looks for",
        body: ["Underwriters want a clean chain from factory to foundation."],
        bullets: [
          "State modular insignia or HUD certification label",
          "Engineered foundation designed for the exact model",
          "Real-property title and, if needed, an affidavit of affixation",
          "Appraiser with factory-built comps, not only stick-built sales",
        ],
      },
    ],
    related: [
      { href: "/modular-home-financing/chattel-vs-mortgage", title: "Chattel vs. mortgage", description: "Which structure you actually want." },
      { href: "/modular-home-financing/rates", title: "Current rate ranges", description: "What prefab buyers are seeing." },
    ],
    cta: "Get a prefab mortgage quote",
  },
  "construction-loans": {
    slug: "construction-loans",
    title: "Construction Loans for Modular Homes",
    eyebrow: "Factory to finish",
    description:
      "Finance factory production, delivery, crane-set, and site work with a construction loan that converts to a permanent mortgage—ideally in a single closing.",
    heroImage: "/images/hero-prefab.jpg",
    stats: [
      { label: "Typical build", value: "4–7 months" },
      { label: "Down payment", value: "3.5–20%" },
      { label: "Interest during build", value: "Interest-only" },
    ],
    sections: [
      {
        heading: "Why construction loans exist for modular",
        body: [
          "You are buying a product that does not exist yet. Lenders advance money in draws: deposit to the factory, delivery, set, utilities, and certificate of occupancy. A lender who uses site-built inspection calendars will stall a modular project that is already 80% complete when it leaves the plant.",
        ],
      },
      {
        heading: "One-time close vs. two-time close",
        body: [
          "One-time close (construction-to-permanent) locks your rate at the start, uses a single set of closing costs, and converts automatically. Two-time close is two loans: a construction facility and a later refinance. Most ModFii buyers prefer one close unless their credit will improve dramatically during the build.",
        ],
      },
      {
        heading: "Timeline",
        body: ["Modular is faster than stick-built, but only if draws match the factory."],
        bullets: [
          "Month 1 — pre-qualification, manufacturer, and floor plan",
          "Month 2 — full application, plans, and appraisal",
          "Month 3 — close and first factory draw",
          "Months 3–5 — production and milestone draws",
          "Months 5–6 — delivery, set, utilities",
          "Month 6–7 — CO and conversion to principal and interest",
        ],
      },
    ],
    faqs: [
      {
        question: "Can I use FHA, VA, or USDA for construction?",
        answer:
          "Yes. FHA 203(b) with construction, VA construction-to-perm, and USDA construction loans all exist. They require lenders who actually run those programs for modular files.",
      },
    ],
    related: [
      { href: "/construction-loans/fha", title: "FHA construction", description: "3.5% down construction-to-perm." },
      { href: "/construction-loans/va", title: "VA construction", description: "0% down for eligible veterans." },
      { href: "/construction-loans/usda", title: "USDA construction", description: "Rural zero-down builds." },
    ],
    cta: "Start construction pre-approval",
  },
  "construction-loans-fha": {
    slug: "construction-loans/fha",
    title: "FHA Construction Loans for Modular Homes",
    eyebrow: "FHA",
    description: "Use an FHA construction-to-permanent loan to build a modular home with 3.5% down and more flexible credit than conventional construction products.",
    sections: [
      {
        heading: "How FHA construction works",
        body: [
          "FHA does not itself build houses. Approved lenders originate a construction loan that converts to an FHA mortgage when the home receives a certificate of occupancy. The home must meet HUD minimum property standards and sit on a permanent foundation.",
        ],
        bullets: [
          "3.5% down with 580+ credit in most cases",
          "Mortgage insurance (UFMIP + annual MIP) applies",
          "Modular and certain manufactured homes on permanent foundations are eligible",
          "Draws and inspections must be scheduled around factory production, not a 12-month stick-built calendar",
        ],
      },
    ],
    related: [
      { href: "/modular-home-financing/loan-options/fha", title: "FHA purchase loans", description: "If the home is already built." },
      { href: "/construction-loans", title: "Construction hub", description: "All construction programs." },
    ],
    cta: "Check FHA construction eligibility",
  },
  "construction-loans-va": {
    slug: "construction-loans/va",
    title: "VA Construction Loans for Prefab Homes",
    eyebrow: "VA",
    description: "Eligible veterans can finance a modular or prefab build with $0 down when a VA-experienced lender will run construction-to-permanent.",
    sections: [
      {
        heading: "VA and factory-built homes",
        body: [
          "VA loans require the home to be real property. Modular homes built to local code and HUD-code homes that meet VA foundation and title rules can qualify. The bottleneck is finding a lender whose construction desk has closed VA modular files.",
        ],
      },
    ],
    related: [{ href: "/modular-home-financing/loan-options/va", title: "VA purchase loans", description: "For completed homes." }],
    cta: "Get a VA construction match",
  },
  "construction-loans-usda": {
    slug: "construction-loans/usda",
    title: "USDA Construction Loans for Modular Homes",
    eyebrow: "USDA",
    description: "Zero-down USDA construction financing for income-eligible buyers building modular homes in qualifying rural and suburban-edge areas.",
    sections: [
      {
        heading: "Map first, then the factory",
        body: [
          "USDA eligibility is geographic and income-based. Confirm the land is in a USDA-eligible area and that household income is under the local limit before you put a deposit with a manufacturer.",
        ],
      },
    ],
    related: [{ href: "/modular-home-financing/loan-options/usda", title: "USDA purchase loans", description: "If you are buying an existing modular." }],
    cta: "Check USDA construction options",
  },
  "adu-financing": {
    slug: "adu-financing",
    title: "ADU Financing",
    eyebrow: "Backyard homes",
    description:
      "Finance a factory-built accessory dwelling unit—guest house, in-law suite, or rental cottage—with lenders who understand ADU appraisals, setback rules, and construction draws.",
    heroImage: "/images/adu-backyard.jpg",
    sections: [
      {
        heading: "How ADUs get paid for",
        body: ["Most backyard cottages are not purchased with a standalone 30-year mortgage on the ADU alone. Capital usually comes from the primary property."],
        bullets: [
          "Cash-out refinance of the primary home",
          "HELOC or home equity loan",
          "Renovation / construction-to-perm on the lot",
          "Occasionally a second mortgage if local ADU lending desks exist",
        ],
      },
      {
        heading: "What changes the file",
        body: [
          "Zoning, utility capacity, and whether the ADU can be rented legally all affect underwriting. Factory ADUs with engineered plans close faster than site-built additions because cost and energy numbers are known up front.",
        ],
      },
    ],
    related: [
      { href: "/tiny-home-financing", title: "Tiny home financing", description: "If the unit is the primary residence." },
      { href: "/construction-loans", title: "Construction loans", description: "For ground-up backyard builds." },
    ],
    cta: "Get ADU financing options",
  },
  "tiny-home-financing": {
    slug: "tiny-home-financing",
    title: "Tiny Home Financing",
    eyebrow: "Small homes, real loans",
    description:
      "Tiny homes on a permanent foundation can be mortgaged as real property. Tiny homes on wheels are usually personal property (chattel) with higher rates and shorter terms.",
    heroImage: "/images/tiny-home.jpg",
    sections: [
      {
        heading: "Foundation vs. wheels",
        body: [
          "If you want mortgage rates, take the axles off. A tiny home permanently affixed to a foundation, connected to utilities, and titled with the land is a house. A tiny home that can be towed is an RV in most lenders' eyes.",
        ],
      },
      {
        heading: "Practical loan paths",
        body: [
          "Foundation tiny homes: FHA, VA, USDA, or conventional if square footage and habitability standards are met. Some investors still impose minimum size overlays—ModFii screens for lenders who will actually close sub-400 sq ft files.",
          "Wheeled tiny homes: personal-property / RV / chattel loans, typically 8–15 years, higher APR, and no mortgage-interest deduction in most cases.",
        ],
      },
    ],
    related: [
      { href: "/modular-home-financing/chattel-vs-mortgage", title: "Chattel vs. mortgage", description: "The classification that decides your rate." },
      { href: "/adu-financing", title: "ADU financing", description: "If the tiny home sits behind a primary house." },
    ],
    cta: "See tiny home loan matches",
  },
  "loan-options": {
    slug: "modular-home-financing/loan-options",
    title: "Modular Home",
    highlight: "Loan Options",
    eyebrow: "Compare programs",
    description:
      "Compare financing options for your modular home. From government-backed FHA and VA loans to construction-to-permanent financing—find the right fit for your situation.",
    heroImage: "/images/hero-prefab.jpg",
    stats: [
      { label: "Lowest down payment", value: "VA/USDA: $0" },
      { label: "Lowest credit score", value: "FHA: 580+" },
      { label: "Fastest approval", value: "7–14 days avg." },
      { label: "No PMI", value: "VA Loans" },
    ],
    sections: [
      {
        heading: "Pick the program, then the lender",
        body: [
          "The program sets down payment, mortgage insurance, and property rules. The lender determines whether your factory-built file actually survives underwriting. ModFii matches both.",
        ],
      },
    ],
    related: [
      { href: "/modular-home-financing/loan-options/fha", title: "FHA", description: "3.5% down." },
      { href: "/modular-home-financing/loan-options/va", title: "VA", description: "0% down for eligible veterans." },
      { href: "/modular-home-financing/loan-options/usda", title: "USDA", description: "0% down in eligible areas." },
      { href: "/modular-home-financing/loan-options/construction-loan", title: "Construction-to-perm", description: "One closing for a new build." },
    ],
    cta: "Get matched to a program",
  },
  "loan-options-fha": {
    slug: "modular-home-financing/loan-options/fha",
    title: "FHA Loans for",
    highlight: "Modular Homes",
    eyebrow: "Government-Backed Financing",
    eyebrowIcon: Home,
    description:
      "Get into your modular home with just 3.5% down. FHA loans offer flexible credit requirements and competitive rates—but you need a lender who understands prefab construction.",
    updated: "January 2026",
    ctas: [
      { label: "Check FHA Eligibility", href: "/get-started", variant: "accent" },
      { label: "View Requirements", href: "/modular-home-financing/fha-modular-manufactured", variant: "onPrimary" },
    ],
    author: { name: "Jane Morrison", role: "Senior Mortgage Analyst", credential: "NMLS Licensed" },
    reviewedBy: { name: "Sarah Williams", role: "Government Loan Specialist", credential: "VA Loan Expert" },
    sections: [
      {
        heading: "FHA property rules that matter",
        body: [
          "Modular homes built to local codes are treated like site-built homes. Manufactured homes must be HUD-code, installed on a permanent foundation, and have an appropriate title conversion in many states.",
        ],
      },
    ],
    related: [{ href: "/modular-home-financing/fha-modular-manufactured", title: "FHA modular vs manufactured", description: "Classification details." }],
    cta: "Check FHA eligibility",
  },
  "loan-options-va": {
    slug: "modular-home-financing/loan-options/va",
    title: "VA Loans for",
    highlight: "Modular Homes",
    eyebrow: "Exclusive Veteran Benefits",
    eyebrowIcon: User,
    description:
      "You served your country—now get the home financing benefits you've earned. VA loans offer $0 down, no PMI, and the best rates available for modular home buyers.",
    updated: "January 2026",
    ctas: [
      { label: "Check VA Eligibility", href: "/get-started", variant: "accent" },
      { label: "View Requirements", href: "/modular-home-financing/va-modular-prefab", variant: "onPrimary" },
    ],
    author: { name: "Sarah Williams", role: "Government Loan Specialist", credential: "VA Loan Expert" },
    reviewedBy: { name: "ModFii Editorial Team", role: "Content Team" },
    sections: [
      {
        heading: "Eligibility in brief",
        body: [
          "You need a Certificate of Eligibility, a VA-approved lender, and a home that meets VA minimum property requirements. Factory-built is fine. Wheels and a temporary hitch are not.",
        ],
      },
    ],
    related: [{ href: "/modular-home-financing/va-modular-prefab", title: "VA prefab deep dive", description: "What appraisers look for." }],
    cta: "Start a VA prefab match",
  },
  "loan-options-usda": {
    slug: "modular-home-financing/loan-options/usda",
    title: "USDA Loans for",
    highlight: "Modular Homes",
    eyebrow: "Rural Development Financing",
    eyebrowIcon: MapPin,
    description:
      "Building in a rural area? USDA loans offer $0 down payment for eligible buyers. More areas qualify than you might think—even many suburban locations.",
    updated: "January 2026",
    ctas: [
      { label: "Check USDA Eligibility", href: "/get-started", variant: "accent" },
      { label: "View Requirements", href: "/modular-home-financing/loan-options", variant: "onPrimary" },
    ],
    author: { name: "Sarah Williams", role: "Government Loan Specialist", credential: "VA Loan Expert" },
    reviewedBy: { name: "ModFii Editorial Team", role: "Content Team" },
    sections: [
      {
        heading: "Two gates",
        body: [
          "The property must sit in a USDA-eligible area and the household must be under the area income limit. Modular construction is explicitly allowed. Confirm both gates before you pay a factory deposit.",
        ],
      },
    ],
    cta: "See if USDA fits your land",
  },
  "loan-options-construction": {
    slug: "modular-home-financing/loan-options/construction-loan",
    title: "Construction-to-Permanent",
    highlight: "Modular Loans",
    eyebrow: "Single-Close Financing",
    eyebrowIcon: FileText,
    description:
      "Building a custom modular home? Get one loan that covers factory production, delivery, site work, and automatically converts to your permanent mortgage. One closing. One loan.",
    heroImage: "/images/hero-prefab.jpg",
    updated: "January 2026",
    ctas: [
      { label: "Get Pre-Approved", href: "/get-started", variant: "accent" },
      { label: "How It Works", href: "/construction-loans", variant: "onPrimary" },
    ],
    author: { name: "Michael Chen", role: "Construction Finance Specialist", credential: "MBA" },
    reviewedBy: { name: "ModFii Editorial Team", role: "Content Team" },
    sections: [
      {
        heading: "What's in the total project cost",
        body: ["Lenders underwrite the whole stack, not just the invoice from the plant."],
        bullets: [
          "Land (if not already owned): $30,000–$150,000",
          "Modular home delivered: $150,000–$350,000",
          "Foundation: $15,000–$40,000",
          "Site work and utilities: $20,000–$60,000",
          "Permits and fees: $3,000–$15,000",
          "Contingency (~10%): $20,000–$60,000",
        ],
      },
      {
        heading: "Finding a lender who understands modular",
        body: [
          "Look for experience with manufacturers in your region, draw schedules aligned to factory milestones, and local or regional banks that will actually inspect a crane-set.",
        ],
      },
    ],
    related: [
      { href: "/construction-loans", title: "Construction loans hub", description: "FHA, VA, and USDA construction." },
      { href: "/modular-home-financing/construction-loans-modular", title: "Modular C2P guide", description: "Factory-specific draws." },
    ],
    cta: "Get construction-to-perm pre-approval",
  },
  rates: {
    slug: "modular-home-financing/rates",
    title: "Modular Home Mortgage Rates",
    eyebrow: "Rates",
    description:
      "Modular homes titled as real property generally receive the same rate sheet as site-built homes. Manufactured and chattel loans price higher. Classification drives the quote.",
    sections: [
      {
        heading: "What buyers are seeing",
        body: [
          "Well-qualified modular files (680+ credit, real property, full documentation) price in the same band as conventional 30-year mortgages. Energy-efficient homes can earn a 10–50 bps green discount from specialist desks.",
          "HUD-code homes on chattel notes often price 150–400 bps higher with 15–20 year terms. That is why ModFii pushes foundation, title, and CrossMod paths whenever they are available.",
        ],
      },
    ],
    related: [{ href: "/calculator", title: "Payment calculator", description: "Model rate, PMI, tax, and insurance." }],
    cta: "Get a personalized rate range",
  },
  cost: {
    slug: "modular-home-financing/cost",
    title: "How Much Does a Modular Home Cost?",
    eyebrow: "Costs",
    description: "A complete 2026 breakdown of factory invoice, delivery, foundation, site work, and the soft costs lenders actually underwrite.",
    heroImage: "/images/green-home.jpg",
    sections: [
      {
        heading: "The invoice is not the project",
        body: [
          "Manufacturer marketing prices rarely include land, foundation, crane, utility taps, or permits. Construction lenders will not close on an invoice-only budget. Build a total project cost with a 10% contingency.",
        ],
      },
      {
        heading: "Typical ranges",
        body: ["National mid-range for a delivered modular home plus site work often lands between $238,000 and $675,000 depending on land."],
      },
    ],
    related: [{ href: "/compare/prefab-vs-site-built-costs", title: "Prefab vs site-built", description: "Where the 10–20% savings shows up." }],
    cta: "Estimate your monthly payment",
  },
  "down-payment": {
    slug: "modular-home-financing/down-payment",
    title: "Down Payment Requirements for Modular Homes",
    eyebrow: "Down payment",
    description: "FHA 3.5%, conventional 3–20%, VA 0%, USDA 0%. Construction loans often want 5–20% of total project cost.",
    sections: [
      {
        heading: "Program minimums",
        body: [
          "Down payment is a program rule, not a factory rule. Your manufacturer cannot 'require 20%' unless they are also the lender. Ask ModFii to match the program to your cash.",
        ],
        bullets: [
          "FHA: 3.5% (580+ credit)",
          "Conventional first-time: as low as 3% with PMI",
          "VA: 0% with entitlement",
          "USDA: 0% if income and map eligible",
          "Construction-to-perm: commonly 5–20% of total project",
        ],
      },
    ],
    cta: "Find a low-down-payment match",
  },
  "with-land": {
    slug: "modular-home-financing/with-land",
    title: "Financing a Modular Home With Land",
    eyebrow: "Land owned or buying together",
    description: "If you already own land—or will buy it in the same transaction—you can often roll lot and home into one construction-to-permanent mortgage.",
    sections: [
      {
        heading: "Owned land is equity",
        body: [
          "Lenders can count unencumbered land as part of your down payment. A $80,000 lot against a $320,000 total project can satisfy a 20% conventional requirement without writing a large check.",
        ],
      },
      {
        heading: "Buying land with the home",
        body: [
          "Purchase the lot and fund the factory in one closing when the seller, manufacturer, and lender will coordinate. This is the cleanest path for buyers who do not yet own property.",
        ],
      },
    ],
    related: [{ href: "/modular-home-financing/without-land", title: "Financing without land", description: "If you still need a lot." }],
    cta: "Finance home and land together",
  },
  "without-land": {
    slug: "modular-home-financing/without-land",
    title: "Financing a Modular Home Without Land",
    eyebrow: "No lot yet",
    description: "You cannot get a traditional mortgage on a house with nowhere to put it. Sequence the lot, then the factory—or buy into a builder community.",
    sections: [
      {
        heading: "Three workable paths",
        body: ["Do not pay a full factory deposit before you control land."],
        bullets: [
          "Buy land first (cash, lot loan, or land contract), then construction-to-perm",
          "Purchase a packaged lot-and-home from a dealer or community",
          "Use a builder-owned development where the lender already has the plat",
        ],
      },
    ],
    related: [{ href: "/modular-home-financing/with-land", title: "With land", description: "If you already control a lot." }],
    cta: "Talk through a no-land plan",
  },
  "fha-modular-manufactured": {
    slug: "modular-home-financing/fha-modular-manufactured",
    title: "FHA Loans for Modular & Manufactured Homes",
    eyebrow: "FHA property types",
    description: "FHA finances both modular (local code) and manufactured (HUD code) homes, with different foundation and title rules.",
    sections: [
      {
        heading: "Do not mix up the labels",
        body: [
          "Modular homes are built in a factory to the same codes as site-built homes and are typically real property from day one. Manufactured homes are built to the HUD Code. FHA will finance manufactured homes only with the right foundation, title, and age/label conditions.",
        ],
      },
    ],
    cta: "Get an FHA property-type match",
  },
  "va-modular-prefab": {
    slug: "modular-home-financing/va-modular-prefab",
    title: "VA Loans for Modular & Prefab Homes",
    eyebrow: "Veterans",
    description: "A veteran's complete guide to using VA entitlement on factory-built housing.",
    sections: [
      {
        heading: "MPRs and factory packets",
        body: [
          "VA minimum property requirements still apply: safe, sound, sanitary. Factory packets that include energy ratings, snow/wind loads, and foundation engineering reduce appraisal conditions.",
        ],
      },
    ],
    cta: "Use your VA entitlement on a prefab home",
  },
  "construction-loans-modular": {
    slug: "modular-home-financing/construction-loans-modular",
    title: "Construction Loans for Modular Homes",
    eyebrow: "Factory draws",
    description: "How modular construction loans differ from stick-built: fewer inspections, larger factory deposits, and a crane-set day that is the biggest single draw.",
    sections: [
      {
        heading: "Draw schedule that matches the plant",
        body: [
          "A typical modular draw: 10–30% factory deposit, 40–60% on delivery, remainder on set, utilities, and CO. Lenders who insist on monthly stick-built inspections add weeks for no underwriting benefit.",
        ],
      },
    ],
    cta: "Match a modular construction lender",
  },
  "chattel-vs-mortgage": {
    slug: "modular-home-financing/chattel-vs-mortgage",
    title: "Chattel vs. Mortgage Loans",
    eyebrow: "Classification",
    description: "Chattel loans are personal-property notes. Mortgages are real-estate notes. The cheaper money is almost always the mortgage—if your home can qualify.",
    sections: [
      {
        heading: "Why this choice is expensive",
        body: [
          "Chattel rates are higher, terms are shorter, consumer protections are weaker, and you typically cannot deduct interest. Convert title, affix the home, and finance as real property whenever the home and land allow it.",
        ],
      },
    ],
    related: [{ href: "/compare/modular-vs-manufactured-financing", title: "Modular vs manufactured", description: "Which box your home is in." }],
    cta: "See if you can use a mortgage",
  },
  "compare-modular-manufactured": {
    slug: "compare/modular-vs-manufactured-financing",
    title: "Modular vs. Manufactured Financing",
    eyebrow: "Compare",
    description: "Modular homes follow local building codes. Manufactured homes follow the HUD Code. Lenders, rates, and down payments split along that line.",
    sections: [
      {
        heading: "The practical difference",
        body: [
          "Modular: typically conventional, FHA, VA, USDA with standard mortgage pricing. Manufactured: FHA Title II, VA, and some conventional CrossMod if appearance and foundation standards are met; otherwise chattel.",
        ],
      },
    ],
    cta: "Get the right classification match",
  },
  "compare-fha-conventional": {
    slug: "compare/fha-vs-conventional-prefab",
    title: "FHA vs. Conventional for Prefab",
    eyebrow: "Compare",
    description: "FHA wins on credit flexibility and 3.5% down. Conventional wins on mortgage insurance and long-term cost if your credit and appraisal can support it.",
    sections: [
      {
        heading: "How to choose",
        body: [
          "If credit is 580–660 or down payment is thin, start FHA. If credit is 680+ and you can put 5–20% down on a real-property modular, conventional is often cheaper after year five because you can drop PMI at 80% LTV. FHA MIP is harder to remove.",
        ],
      },
    ],
    cta: "Compare FHA and conventional quotes",
  },
  "compare-prefab-sitebuilt": {
    slug: "compare/prefab-vs-site-built-costs",
    title: "Prefab vs. Site-Built Costs",
    eyebrow: "Compare",
    description: "Modular homes typically cost 10–20% less than comparable site-built houses because weather delays, waste, and field labor shrink. Financing should reflect that—not punish it.",
    heroImage: "/images/hero-prefab.jpg",
    sections: [
      {
        heading: "Where the savings come from",
        body: [
          "Factory labor, bulk material purchasing, and parallel site work (foundation while the house is being built) cut calendar time and interest during construction. Buyers still must budget crane, transportation, and a real contingency.",
        ],
      },
    ],
    cta: "Model prefab vs site-built payments",
  },
};

export function getGuide(key: string): GuidePageContent | undefined {
  return GUIDES[key];
}
