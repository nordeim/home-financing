import type { ComponentType } from "react";
import { FileText, Home, MapPin, User } from "lucide-react";

export interface GuideStat {
  label: string;
  value: string;
}

export interface GuideSubsection {
  heading: string;
  body?: string[];
  bullets?: string[];
  /** Bold lead-in rendered before bullets (source uses "Key Details:" H4s). */
  lead?: string;
}

export interface GuideSection {
  heading: string;
  body: string[];
  bullets?: string[];
  /** Bold lead-in rendered before the bullet list (source "Quick facts:" pattern). */
  lead?: string;
  /** Mirrors the source's H3 outline under each H2 (pass-5 content parity). */
  subsections?: GuideSubsection[];
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
        heading: "What Is Modular Home Financing?",
        body: [
          "Modular home financing is a mortgage that pays for a house built in a factory, shipped in modules, and assembled on a permanent foundation you own or are buying. Because the finished home is real property—deeded land, permanent foundation, local building code—the loan that fits best is usually the same mortgage your neighbors used for a site-built house.",
          "The money itself moves differently, though. The factory needs deposits while your home is on the production line, the setter and crew get paid at delivery, and the site contractor bills in stages. A modular-savvy lender sequences those payments instead of forcing a 12-month stick-built draw calendar onto a 6-week factory schedule.",
        ],
        subsections: [
          {
            heading: "Modular homes qualify for traditional mortgages",
            body: [
              "A true modular home is built to the same state and local building codes as site-built homes, inspected in the factory by third-party agencies, and titled as real estate once set. FHA, VA, USDA, Fannie Mae, and Freddie Mac all finance them as one-to-four family homes. Nothing about the factory makes the collateral second-class in underwriting.",
            ],
          },
          {
            heading: "Why modular home financing is different",
            body: [
              "The differences are operational. Your file includes a factory invoice instead of a builder contract, engineering certifications instead of progressive municipal inspections, and a delivery-and-set schedule that can compress the entire build into weeks. Loan officers who have never closed a modular file read those documents as exceptions, and exceptions get escalated, stalled, or declined.",
            ],
          },
          {
            heading: "What ModFii does differently",
            body: [
              "We match you with lenders whose teams close factory-built files every week—lenders who know which appraisal form to order, when to schedule the foundation inspection, and how to write draw schedules around production milestones. The result is a process that feels like a normal mortgage, because for these lenders it is.",
            ],
          },
        ],
      },
      {
        heading: "Types of Modular Home Financing",
        body: ["Most ModFii buyers land in one of six programs, depending on credit, location, military status, and whether land is already owned."],
        subsections: [
          {
            heading: "Construction-to-permanent loans (most common)",
            lead: "Key details:",
            bullets: [
              "One closing covers the build and the permanent mortgage",
              "3.5–20% down depending on the program layered underneath",
              "Interest-only payments during the build, then standard amortization",
              "Rate can be locked before production starts",
            ],
          },
          {
            heading: "FHA loans for modular homes",
            lead: "Key details:",
            bullets: [
              "3.5% down with a 580+ FICO in most cases",
              "Permanent foundation and HUD minimum property standards required",
              "Mortgage insurance applies: 1.75% upfront plus annual MIP",
            ],
          },
          {
            heading: "VA loans for modular homes",
            lead: "Eligibility:",
            bullets: [
              "$0 down for eligible veterans, service members, and surviving spouses",
              "No monthly mortgage insurance",
              "The home must be real property on a permanent foundation—wheels off, hitch off",
            ],
          },
          {
            heading: "USDA loans for modular homes",
            lead: "Eligibility:",
            bullets: [
              "$0 down in eligible rural and many suburban-edge census tracts",
              "Household income must sit under the local area limit",
              "Guarantee fee replaces mortgage insurance",
            ],
          },
          {
            heading: "Conventional loans for modular homes",
            lead: "PMI:",
            bullets: [
              "3–20% down with 620+ credit; strongest pricing at 740+",
              "PMI drops off at 20% equity—unlike FHA MIP in most cases",
              "CrossMod-eligible homes can access standard conventional pricing",
            ],
          },
          {
            heading: "Land-home packages",
            lead: "Best for:",
            bullets: [
              "Buyers who need the lot and the home in one transaction",
              "Land equity can serve as part or all of the down payment",
              "One closing for land, factory invoice, and site work",
            ],
          },
        ],
      },
      {
        heading: "Modular Home Financing Comparison",
        body: [
          "Program choice drives your down payment, monthly insurance cost, and how flexible the credit bar is. The comparison below reflects the ranges ModFii buyers actually see; your match depends on county limits, entitlement, and the lender's overlay.",
        ],
        bullets: [
          "FHA — 3.5% down, 580+ FICO typical, MIP for most of the loan, most flexible credit",
          "VA — $0 down, no monthly MI, funding fee one-time, entitlement required",
          "USDA — $0 down, income + area limits, guarantee fee, rural and suburban-edge",
          "Conventional — 3–20% down, 620+ FICO, PMI until 20% equity, best pricing at 740+",
          "Construction-to-permanent — one close, interest-only during build, converts automatically",
          "Chattel — home-only personal property loan, higher rates, for land you don't want to finance",
        ],
      },
      {
        heading: "The Modular Home Financing Process",
        body: ["From first form to keys, a financed modular build usually runs ten to sixteen weeks when the lender matches the factory calendar."],
        subsections: [
          {
            heading: "Get pre-qualified (no credit impact)",
            body: ["A 15-minute application scores you against prefab-specialist lenders and returns estimated rates and payments. Soft pull only—your score is untouched."],
          },
          {
            heading: "Choose your modular home and land",
            body: ["Pick the manufacturer, floor plan, and lot. The factory quote plus site-work estimate becomes the budget your lender underwrites."],
          },
          {
            heading: "Full loan application",
            body: ["Income, assets, credit, and the construction packet—engineering certs, foundation plan, delivery schedule—go to underwriting in one file."],
          },
          {
            heading: "Loan approval and closing",
            body: ["Clear-to-close triggers the single closing on a construction-to-permanent loan: one set of costs, one rate lock, one signature day."],
          },
          {
            heading: "Construction (if building new)",
            body: ["The factory builds in weeks while your site is prepared. Draws fund the deposit, production milestones, delivery, set, and utilities."],
          },
          {
            heading: "Move in",
            lead: "Total timeline:",
            bullets: [
              "Pre-qualification through closing: 3–5 weeks",
              "Factory production: 6–10 weeks (runs in parallel with site work)",
              "Delivery, set, and finish: 2–4 weeks",
              "Certificate of occupancy converts the loan to permanent financing automatically",
            ],
          },
        ],
      },
      {
        heading: "Why Most Banks Reject Modular Home Loans",
        body: ["The collateral is sound; the process is unfamiliar. Three failure patterns cause nearly every modular decline at traditional lenders."],
        subsections: [
          {
            heading: "The knowledge gap",
            body: ["Many loan officers have never seen a factory invoice or a state modular program label. Unknown documents become 'exceptions,' and exceptions sit in queues that expire rate locks and factory production slots."],
          },
          {
            heading: "The appraisal challenge",
            body: ["Appraising a modular home requires comparable site-built sales and the right form. An appraiser who treats the home as manufactured can lowball the value or kill the file—ModFii lenders order appraisals that classify the home correctly."],
          },
          {
            heading: "The construction complexity",
            body: ["Draw schedules written for stick-built timelines miss factory payment deadlines. Deposits come due at contract, not at drywall. Lenders who fund on production milestones keep your delivery slot alive."],
          },
        ],
      },
    ],
    faqs: [
      {
        question: "Can I finance a modular home with a regular mortgage?",
        answer:
          "Yes. Modular homes on permanent foundations are real property and qualify for FHA, VA, USDA, and conventional financing exactly like site-built homes. The key is a lender who processes factory invoices and draw schedules without treating them as exceptions.",
      },
      {
        question: "How much down payment do I need for a modular home?",
        answer:
          "It ranges from $0 (VA and USDA for eligible buyers) to 3.5% (FHA) to 3–20% (conventional). Land equity in a land-home package can cover part or all of the requirement.",
      },
      {
        question: "Is a modular home harder to finance than a manufactured home?",
        answer:
          "No—the opposite. Modular homes follow local building codes and are titled as real estate, so they get mainstream mortgage pricing. HUD-code manufactured homes have separate Title I programs and chattel options with different rates.",
      },
      {
        question: "How long does modular home financing take?",
        answer:
          "Pre-qualification takes minutes, approval typically 7 days with a prefab-specialist lender, and the full build-to-close timeline runs 3–4 months including factory production.",
      },
      {
        question: "Do I need a construction loan for a modular home?",
        answer:
          "If the home is being built for you, yes—but a construction-to-permanent loan folds both phases into one closing. If you are buying a completed modular home already set on its foundation, a standard purchase mortgage covers it.",
      },
      {
        question: "What credit score do I need for modular home financing?",
        answer:
          "580 opens FHA doors with 3.5% down, 620 opens conventional, and 740+ unlocks the best conventional pricing. VA and USDA weigh the whole file more heavily than the score alone.",
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
    title: "Construction Loans for",
    highlight: "Modular & Prefab Homes",
    eyebrow: "Factory to finish",
    description:
      "Finance factory production, delivery, crane-set, and site work with a construction loan that converts to a permanent mortgage—ideally in a single closing.",
    heroImage: "/images/hero-prefab.jpg",
    stats: [
      { label: "Typical build", value: "4–7 months" },
      { label: "Down payment", value: "3.5–20%" },
      { label: "Interest during build", value: "Interest-only" },
    ],
    updated: "January 2026",
    ctas: [
      { label: "Get Pre-Approved", href: "/get-started", variant: "accent" },
      { label: "How Construction Loans Work", href: "/modular-home-financing/loan-options/construction-loan", variant: "onPrimary" },
    ],
    author: { name: "Michael Chen", role: "Construction Finance Specialist", credential: "MBA" },
    reviewedBy: { name: "Jane Morrison", role: "Senior Mortgage Analyst", credential: "NMLS Licensed" },
    sections: [
      {
        heading: "What Is a Construction Loan?",
        body: [
          "A construction loan is short-term financing that pays for a home while it is being built. Instead of receiving the full amount at closing, the lender advances funds in draws matched to milestones: factory deposit, production, delivery, set, site work, and finish. When the home receives its certificate of occupancy, the balance either converts to a permanent mortgage (one-time close) or is refinanced (two-time close).",
          "For modular buyers the concept fits naturally. The factory already bills in stages, so the draw structure mirrors the real production calendar instead of an abstract site-built schedule. The right construction lender writes that schedule around factory milestones—keeping your production slot, delivery date, and rate lock alive.",
        ],
      },
      {
        heading: "Types of Construction Loans",
        body: ["Four programs dominate factory-built construction financing."],
        subsections: [
          { heading: "Construction-to-permanent (most common)", body: ["One closing, one rate lock, one set of fees. Interest-only payments during the build, then automatic conversion to a permanent mortgage at certificate of occupancy. Layer FHA, VA, USDA, or conventional terms underneath."] },
          { heading: "FHA construction loans", body: ["FHA one-time close with 3.5% down and flexible credit. Requires an FHA-approved lender willing to run construction draws—rare at banks, routine at the specialists in our network."] },
          { heading: "VA construction loans", body: ["$0 down construction-to-permanent for eligible veterans. No monthly mortgage insurance; the VA funding fee applies once. The bottleneck is lender appetite—ModFii screens for construction desks that close VA modular files."] },
          { heading: "USDA construction loans", body: ["$0 down for income-eligible buyers in eligible areas, with a single-close option. Confirm area and income eligibility before committing a factory deposit."] },
        ],
      },
      {
        heading: "How Construction Loans Work",
        body: ["The lifecycle of a financed modular build, from pre-qualification to move-in."],
        subsections: [
          { heading: "Pre-qualification", body: ["A 15-minute application scores you against construction lenders who finance factory builds. Soft pull only. Output: estimated rate, payment, and the maximum project budget."] },
          { heading: "Loan application & approval", body: ["Income, assets, credit plus the construction packet—factory invoice, foundation engineering, site plan, and cost breakdown. Underwriting issues a commitment contingent on plans and appraisal."] },
          { heading: "Construction closing", body: ["One closing (construction-to-permanent) funds the whole project: land payoff, factory payments, site work. Closing costs are paid once instead of twice."] },
          { heading: "Factory build & site work", body: ["Draws release as milestones complete—deposit, production, delivery. Inspections are documentation-light for factory stages because the plant's third-party inspections certify the work."] },
          { heading: "Delivery, set & completion", body: ["The crane set and finish-work draws fund the general contractor. Interest-only payments continue until the certificate of occupancy issues."] },
          { heading: "Understanding draw schedules", body: ["A draw schedule is the payment calendar. For modular, healthy schedules front-load the factory deposit, fund production at certified milestones, and reserve 10% for finish contingencies. Lenders using stick-built calendars (foundation→framing→drywall) miss factory deadlines and forfeit production slots."] },
        ],
      },
      {
        heading: "Construction Loan Requirements",
        body: ["What underwriting expects from you and the project."],
        bullets: [
          "620+ FICO conventional / 580+ FHA / flexible VA—program-dependent",
          "43% debt-to-income or better including the fully-converted payment",
          "Down payment: 3.5% (FHA) to 20% (conventional lowest MI); land equity counts",
          "Signed factory invoice, engineered foundation plan, and site-work bid in the file",
          "Licensed installer/GC for the set and finish phases",
          "Construction-to-permanent rate lock available before production starts",
        ],
      },
      {
        heading: "One-Time Close vs. Two-Time Close",
        body: [
          "One-time close (construction-to-permanent) locks your rate at the start, uses a single set of closing costs, and converts automatically at completion. Two-time close is two loans: a construction facility and a later refinance into permanence. Two-time close re-qualifies you after the build—useful if your credit or the rate market will improve materially, otherwise it is double the cost and risk.",
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
      {
        heading: "Estimate Your Construction Loan Payments",
        body: [
          "During the build you pay interest only on drawn funds. After conversion, the payment becomes standard PITI on the total project amount. Our calculator models both: enter the full project cost as home price, your program's down payment, and your county tax rate to see the permanent payment the loan converts into.",
        ],
      },
    ],
    faqs: [
      {
        question: "What is a construction-to-permanent loan?",
        answer:
          "A single loan that funds construction and then converts into your permanent mortgage at certificate of occupancy—one closing, one rate lock, one set of fees. It is the default structure for financed modular builds.",
      },
      {
        question: "How much down payment do I need for a construction loan?",
        answer:
          "3.5% with FHA one-time close, $0 with VA or USDA for eligible buyers, and 5–20% conventional depending on lender and loan size. Land you already own can be credited toward the requirement.",
      },
      {
        question: "How long does the construction loan process take?",
        answer:
          "Approval typically runs 3–5 weeks including plans and appraisal. The build itself adds 4–7 months for a factory-built home—about half the site-built equivalent.",
      },
      {
        question: "What credit score do I need for a construction loan?",
        answer:
          "580 opens FHA one-time close, 620 is the conventional floor, and 700+ unlocks the strongest conventional construction pricing. VA weighs the whole file more than the score.",
      },
      {
        question: "Can I use FHA, VA, or USDA for construction?",
        answer:
          "Yes. FHA 203(b) one-time close, VA construction-to-permanent, and USDA construction loans all exist. They require lenders who actually run those programs for modular files—exactly the screening ModFii does.",
      },
      {
        question: "What happens if the build goes over budget?",
        answer:
          "Construction-to-permanent loans carry a 5–10% contingency reserve precisely for this. Draws pause when the reserve is exhausted, so change orders need lender sign-off—another reason factory-fixed pricing protects modular buyers.",
      },
    ],
    related: [
      { href: "/construction-loans/fha", title: "FHA construction", description: "3.5% down construction-to-perm." },
      { href: "/construction-loans/va", title: "VA construction", description: "0% down for eligible veterans." },
      { href: "/construction-loans/usda", title: "USDA construction", description: "Rural zero-down builds." },
      { href: "/calculator", title: "Payment calculator", description: "Model the converted payment." },
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
    title: "ADU Financing:",
    highlight: "How to Finance an Accessory Dwelling Unit",
    eyebrow: "Backyard homes",
    description:
      "Finance a factory-built accessory dwelling unit—guest house, in-law suite, or rental cottage—with lenders who understand ADU appraisals, setback rules, and construction draws.",
    heroImage: "/images/adu-backyard.jpg",
    stats: [
      { label: "Typical ADU cost", value: "$90K–$200K" },
      { label: "Rent potential", value: "$1,200+/mo" },
      { label: "Value added", value: "25–34%" },
    ],
    updated: "January 2026",
    ctas: [
      { label: "Get ADU Financing Options", href: "/get-started", variant: "accent" },
      { label: "Explore Financing Programs", href: "/modular-home-financing/loan-options", variant: "onPrimary" },
    ],
    author: { name: "Jane Morrison", role: "Senior Mortgage Analyst", credential: "NMLS Licensed" },
    reviewedBy: { name: "Michael Chen", role: "Construction Finance Specialist", credential: "MBA" },
    sections: [
      {
        heading: "The ADU Opportunity: Why Backyard Homes Are Booming",
        body: [
          "An accessory dwelling unit is a self-contained home—kitchen, bath, sleeping area—on the same lot as your primary residence. Recent zoning reform in California, Oregon, Washington, and dozens of cities has legalized them broadly, and factory-built ADUs compress the timeline from over a year of site construction to as little as 90 days from order to occupancy.",
          "The financing logic is different from buying a house. You are adding an improvement to property you already own, so most ADU capital comes from the equity in your primary home rather than a standalone mortgage on the unit itself.",
        ],
      },
      {
        heading: "What Counts as an ADU? Types Explained",
        body: ["The type you build drives permits, cost, and which lenders will compete for the file."],
        subsections: [
          { heading: "Detached ADU (DADU)", body: ["A standalone backyard cottage—the classic image. Highest cost ($120K–$200K+ for factory-built), highest rent potential, and the type factory builders have productized best."] },
          { heading: "Attached ADU", body: ["An addition sharing a wall with the main house. Cheaper utilities connections, mid-range cost, ideal for in-law suites with an interior connection option."] },
          { heading: "Garage conversion", body: ["Existing structure, existing shell. Often the cheapest path ($80K–$120K) when the foundation and roof are sound—and the fastest to permit in many jurisdictions."] },
          { heading: "Basement/attic conversion", body: ["Turning existing conditioned space into a legal dwelling. Cost concentrates in egress, ceiling height, and separate entrance code compliance."] },
          { heading: "Junior ADU (JADU)", body: ["A ≤500 sq ft unit converted from existing space, sharing the main home's kitchen or with an efficiency kitchen. California's streamlined approval path with the lowest barrier to entry."] },
        ],
      },
      {
        heading: "ADU Financing Options: Complete Guide",
        body: ["Six funding paths cover the market. Most buyers combine one primary instrument with the factory's deposit schedule."],
        subsections: [
          {
            heading: "Home equity loan / HELOC",
            lead: "How it works:",
            body: ["Borrow against the difference between your home's value and your mortgage balance. A home equity loan is a fixed lump sum; a HELOC is a revolving line you draw during the build."],
            bullets: ["Typical terms: up to 80–85% combined loan-to-value, fixed or variable", "Pros: fastest close (2–3 weeks), no construction oversight, funds available on day one", "Cons: rate is typically higher than first-mortgage pricing; small lines may not cover full project cost"],
          },
          {
            heading: "Cash-out refinance",
            lead: "How it works:",
            body: ["Replace your existing first mortgage with a larger one and take the difference as cash for the ADU build."],
            bullets: ["Typical terms: today's first-mortgage rates, up to 80% LTV", "Pros: lowest available rate class, longest amortization (30 years), one payment", "Cons: only wins when your current rate is close to or above market; closing costs on the full balance"],
          },
          {
            heading: "Construction loan",
            lead: "How it works:",
            body: ["A short-term facility that funds the ADU project in draws and either converts to permanent financing or is paid off by a refinance at completion."],
            bullets: ["Typical terms: 12–18 months, interest-only during build", "Pros: sized to the full project cost including site work; draw inspections protect your budget", "Cons: two closings unless construction-to-permanent; requires contractor and plans up front"],
          },
          {
            heading: "Renovation loans (FHA 203k, HomeStyle, CHOICERenovation)",
            lead: "How it works:",
            body: ["Renovation mortgages fold the ADU cost into a single loan based on the home's after-improvement value—so today's equity is not the ceiling."],
            bullets: ["FHA 203(k): 3.5% down, HUD consultant required for structural work", "Fannie Mae HomeStyle: 5% down conventional, ADUs explicitly eligible, rental income from the ADU can help qualify", "Freddie Mac CHOICERenovation: comparable conventional option with flexible structural scopes"],
          },
          {
            heading: "Personal loan",
            lead: "How it works:",
            body: ["Unsecured installment financing through your bank or a marketplace lender."],
            bullets: ["Typical terms: $25K–$100K, 5–7 years, no collateral", "Pros: no appraisal, no equity requirement, funds in days", "Cons: highest rate class; payment size strains DTI; rarely covers a full detached build"],
          },
          {
            heading: "Manufacturer/builder financing",
            lead: "How it works:",
            body: ["Some factory ADU builders offer deposit-and-balance programs or partner lenders who understand their product line."],
            bullets: ["Typical terms: staged payments mirroring production milestones", "Pros: no equity needed, underwriting tuned to the exact product", "Cons: single-counterparty pricing; compare against bank options before signing"],
          },
        ],
      },
      {
        heading: "How to Choose Your ADU Financing Path",
        body: [
          "Start with three numbers: your current rate, your equity, and your total project cost. Strong equity plus an older low rate points to a HELOC that preserves the first mortgage. An above-market current rate points to a cash-out refinance. Little equity points to renovation-loan programs that lend on after-improvement value. Project costs under $100K with strong income can make a personal loan the fastest path.",
        ],
        bullets: [
          "Equity-rich, rate-protected → HELOC or home equity loan",
          "Current rate above market → cash-out refinance",
          "Equity-light, income-strong → HomeStyle/CHOICERenovation on after-improvement value",
          "Full ground-up build with contractor → construction-to-permanent",
          "Speed over rate, smaller project → personal loan or manufacturer program",
        ],
      },
      {
        heading: "ADU Financing Requirements",
        body: ["Lenders underwrite the ADU as an improvement to your primary residence, so the file centers on the property and the project—not a second borrower."],
        bullets: [
          "620+ FICO for conventional instruments; 580+ opens FHA renovation paths",
          "Debt-to-income typically needs to stay under 43% including the new payment",
          "Signed ADU plans, permits, and a builder contract for construction products",
          "Rental income from the ADU can offset the payment on some programs after seasoning or with a signed lease",
          "Appraisal uses after-improvement value on renovation/construction loans",
        ],
      },
      {
        heading: "The ADU Appraisal: Why It Trips Files",
        body: [
          "Appraising an ADU requires comparables that also have ADUs—or a defensible adjustment from the best available sales. In markets with few legalized ADU sales, an appraiser unfamiliar with the format can undervalue the improvement and shrink your lending base. ModFii lenders work with appraisers who handle ADU comps and factory-built specifications regularly, and the file we help you assemble documents the income potential explicitly.",
        ],
      },
      {
        heading: "ADU Financing FAQ Preview",
        body: ["The questions backyard-home buyers ask most—answered in full below."],
      },
    ],
    faqs: [
      { question: "Can I rent out my ADU to help qualify?", answer: "Often yes. Fannie Mae HomeStyle and several construction programs allow projected or lease-backed ADU rental income to offset the new payment. Rules vary by program and jurisdiction, so we confirm your city's rental legality during pre-qualification." },
      { question: "Is a factory-built ADU easier to finance than site-built?", answer: "Usually. Factory pricing is fixed and documented, energy performance is certified, and the production schedule fits draw structures cleanly—lenders see a knowable project instead of an open-ended site build." },
      { question: "How much equity do I need for a HELOC-funded ADU?", answer: "Lenders typically allow borrowing up to 80–85% of combined value. A $600,000 home with a $300,000 balance supports roughly $180K–$210K of additional debt—enough for most detached factory ADUs." },
      { question: "Do ADUs increase property taxes?", answer: "Yes—the improvement is assessed. In California, Prop 13 reassesses only the addition, not the whole property. Factor the increment into your monthly math alongside financing." },
      { question: "What is the cheapest way to finance an ADU?", answer: "A cash-out refinance delivers the lowest rate class when your current rate is near or above market. Otherwise a HELOC usually beats personal and manufacturer financing on cost." },
      { question: "Can I use an FHA 203(k) for an ADU?", answer: "Yes. FHA 203(k) Standard covers detached structures and structural work; the Limited variant caps smaller scopes. The ADU must be a legal permitted use of the lot." },
      { question: "How long does ADU financing take?", answer: "HELOCs close in 2–3 weeks; renovation and construction-to-permanent loans run 4–6 weeks including plans, permits, and appraisal; personal loans fund in days." },
      { question: "What if my ADU plans exceed the appraisal value?", answer: "You cover the gap in cash or re-scope. That is why we recommend pre-qualification before signing a factory order—the lending base sets the budget." },
    ],
    related: [
      { href: "/tiny-home-financing", title: "Tiny home financing", description: "If the unit is the primary residence." },
      { href: "/construction-loans", title: "Construction loans", description: "For ground-up backyard builds." },
      { href: "/calculator", title: "Payment calculator", description: "Model the new monthly payment." },
    ],
    cta: "Get ADU financing options",
  },
  "tiny-home-financing": {
    slug: "tiny-home-financing",
    title: "Tiny Home Financing:",
    highlight: "How to Finance a Tiny House",
    eyebrow: "Small homes, real loans",
    description:
      "Tiny homes on a permanent foundation can be mortgaged as real property. Tiny homes on wheels are usually personal property (chattel) with higher rates and shorter terms.",
    heroImage: "/images/tiny-home.jpg",
    stats: [
      { label: "THOF mortgage rates", value: "Mortgage-class" },
      { label: "THOW loan terms", value: "8–15 yrs" },
      { label: "Typical cost", value: "$30K–$150K" },
    ],
    updated: "January 2026",
    ctas: [
      { label: "Get Tiny Home Loan Matches", href: "/get-started", variant: "accent" },
      { label: "Compare Loan Options", href: "/modular-home-financing/loan-options", variant: "onPrimary" },
    ],
    author: { name: "Sarah Williams", role: "Government Loan Specialist", credential: "VA Loan Expert" },
    reviewedBy: { name: "ModFii Editorial Team", role: "Content Team" },
    sections: [
      {
        heading: "The Tiny Home Movement: Big Appeal, Complex Financing",
        body: [
          "Tiny houses promise financial freedom—a home you can own outright, with utilities that fit in an envelope. But the same compactness that makes them affordable makes them hard to classify, and classification is what mortgage underwriting runs on. The good news: done right, a tiny home is simply a very small house, and very small houses have financed for decades.",
          "The fork in the road is the chassis. Remove it and affix the home permanently to land you own, and every mainstream program opens up. Keep the wheels, and you are financing a titled vehicle or RV instead of real estate.",
        ],
      },
      {
        heading: "Why Tiny Homes Are Hard to Finance",
        body: ["Four structural obstacles explain nearly every tiny-home decline at a traditional bank."],
        subsections: [
          { heading: "The classification problem", body: ["Lenders bucket collateral as real property or personal property. A tiny home that is neither clearly—an RV-built shell on a trailer with residential finishes—falls between desks, and between-desk files get declined."] },
          { heading: "The size problem", body: ["Many conventional investors impose minimum square footage overlays (commonly 400–600 sq ft) that have nothing to do with FHA or agency rules. The agency guidelines allow small homes; lender overlays often don't."] },
          { heading: "The appraisal problem", body: ["Appraisers need closed comparable sales. Tiny homes on foundations have fewer comps than standard houses, so the appraiser must be willing to work with modest adjustments and documented cost data."] },
          { heading: "The lender unfamiliarity problem", body: ["A loan officer who has never closed a 400 sq ft file treats every document as an exception. Exceptions become escalations; escalations kill timelines and deposits."] },
        ],
      },
      {
        heading: "Tiny Home Types: What Each Means for Financing",
        body: ["Match the build type to the financing lane before you sign anything."],
        subsections: [
          {
            heading: "Tiny home on permanent foundation (THOF)",
            lead: "What it is:",
            body: ["A site-assembled or crane-set small home permanently affixed to an engineered foundation on land you own or are buying, titled as real estate."],
            bullets: ["Financing options: FHA, VA, USDA, conventional—full mortgage-class rates and 30-year amortization when agency and lender requirements are met"],
          },
          {
            heading: "Tiny home on wheels (THOW)",
            lead: "What it is:",
            body: ["A towable home, usually RVIA-certified or built to tiny-house building codes, titled as a vehicle or RV."],
            bullets: ["Financing options: RV loans through credit unions and specialty lenders (RVIA certification required by most), personal loans, or chattel loans—8–15 year terms, higher APR"],
          },
          {
            heading: "Prefab/modular tiny home",
            lead: "Key distinction:",
            body: ["Factory-built to state modular code, delivered as modules, set on a foundation—the small sibling of a standard modular home."],
            bullets: ["Advantages: same financing as any modular home, third-party inspection certificates included, documented cost basis for the appraiser"],
          },
          {
            heading: "Container/converted tiny home",
            body: ["A shipping container or bus conversion. Financing depends entirely on the finished product's classification—permanently affixed and coded means mortgaged in principle, but expect to shop for a lender who will underwrite the novelty."],
          },
        ],
      },
      {
        heading: "Tiny Home Financing Options: Complete Guide",
        body: ["Seven instruments cover the market across both property classes."],
        subsections: [
          {
            heading: "Traditional mortgage (THOF only)",
            lead: "Requirements:",
            bullets: ["Permanent foundation on owned land, utilities connected, title as real property", "Meet agency minimum property standards plus any lender size overlays", "Comps support value—expect a cost approach backup on very small homes"],
          },
          {
            heading: "Construction-to-permanent loan",
            lead: "How it works:",
            bullets: ["One closing funds land, factory invoice, and site work", "Interest-only during the build, converts to the permanent mortgage at CO", "Best for prefab tiny homes with a documented factory price"],
          },
          {
            heading: "RV loan (THOW only — RVIA required)",
            lead: "Requirements:",
            bullets: ["RVIA certification plate (most credit unions require it)", "20%+ down common; 8–15 year terms", "Rate class sits between auto and mortgage pricing"],
          },
          {
            heading: "Personal loan (any tiny home type)",
            lead: "How it works:",
            bullets: ["Unsecured; $25K–$100K typical; 5–7 years", "No appraisal, no title, no land requirement", "Highest APR class—best for small builds or gap funding"],
          },
          {
            heading: "Chattel loan (personal property loan)",
            lead: "How it works:",
            bullets: ["Secured by the home itself, not land", "10–20 year terms at rates above mortgage class", "Standard route for manufactured-style titling"],
          },
          {
            heading: "Home equity loan/HELOC",
            lead: "How it works:",
            bullets: ["Borrow against a primary residence you already own", "Fund the tiny home as a second property or backyard unit", "Mortgage-class rates with 80–85% CLTV caps"],
          },
          {
            heading: "Pay cash / savings",
            body: ["Under $60K, many buyers simply save. The trade: no financing cost, no credit exposure, and zero leverage—but also no payment history utility and liquidity risk if the project overruns."],
          },
        ],
      },
      {
        heading: "Financing Comparison Table",
        body: ["How the realistic options stack up for a typical $80,000 tiny home project."],
        bullets: [
          "Mortgage (THOF) — 5–7% class, 30 yrs, lowest payment, requires land + foundation",
          "Construction-to-perm — mortgage-class, one close, requires plans + contractor",
          "RV loan (THOW) — 7–10% class, 8–15 yrs, requires RVIA plate",
          "Chattel — 8–12% class, 10–20 yrs, home-only collateral",
          "Personal loan — 9–36% APR, 5–7 yrs, unsecured",
          "HELOC — mortgage-class + margin, 10–20 yrs draw/repay, requires equity elsewhere",
          "Cash — 0% financing cost, full liquidity drag",
        ],
      },
      {
        heading: "Tiny Home Costs: Complete Budget Breakdown",
        body: ["Lenders underwrite the full stack, not the sticker price on the builder's page."],
        bullets: [
          "THOW shell + finish: $30K–$100K depending on size and systems",
          "Foundation tiny home (prefab, set + finish): $60K–$150K",
          "Land: $10K–$150K depending on region and utilities in place",
          "Site work — septic, well/power hookups, driveway: $5K–$40K",
          "Permits, engineering, inspections: $1K–$5K",
          "Contingency: hold 10% of project cost",
        ],
      },
    ],
    faqs: [
      { question: "Can I get a mortgage on a tiny home?", answer: "Yes, when it is a Tiny Home on a Foundation (THOF): permanently affixed, on land you own, titled as real property, meeting agency property standards. Wheels-off is the price of mortgage rates." },
      { question: "Can I finance a tiny home on wheels?", answer: "Yes, but not with a mortgage. RVIA-certified models get credit-union RV loans (8–15 years); non-certified builds go through personal or chattel loans at higher rates." },
      { question: "Do I need land first?", answer: "For a mortgage yes—you cannot mortgage real property that sits on rented ground. Land-home packages roll the lot into one loan, or the builder's deposit schedule holds your production slot while land closes." },
      { question: "What credit score do tiny home lenders want?", answer: "Mortgage-class: 580 FHA / 620 conventional like any home. RV and chattel lenders commonly want 640+; personal lenders price from 600 up with steep APR curves below that." },
      { question: "Can I put a tiny home in my backyard and rent it?", answer: "Often—zoning reform in many states permits ADUs, and a backyard tiny home is just a small ADU. See our ADU financing guide for equity and renovation-loan paths." },
      { question: "How long do tiny home loans take to close?", answer: "Personal and RV loans fund in days. Mortgages on THOF builds run the standard 3–5 weeks; construction-to-permanent adds the plans-and-permits phase." },
    ],
    related: [
      { href: "/modular-home-financing/chattel-vs-mortgage", title: "Chattel vs. mortgage", description: "The classification that decides your rate." },
      { href: "/adu-financing", title: "ADU financing", description: "If the tiny home sits behind a primary house." },
      { href: "/calculator", title: "Payment calculator", description: "Model tiny-home payments." },
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
        heading: "Why FHA Loans Are Popular for Modular Homes",
        body: ["FHA exists to widen the door to ownership, and factory-built buyers walk through it every day. Four features do most of the work."],
        subsections: [
          { heading: "Low down payment", body: ["3.5% down with a 580+ FICO. On a $300,000 modular home that is $10,500—less than many buyers spend waiting for a site-builder's construction loan to pencil."] },
          { heading: "Flexible credit", body: ["FHA underwriting weighs the whole file—rent history, reserves, compensating factors—instead of gating on a single score. Prior bumps like collections or thin credit are survivable."] },
          { heading: "Competitive rates", body: ["FHA rates run close to conventional for the same borrower profile, and government-backed pricing does not penalize the factory-built collateral when classification is correct."] },
          { heading: "Assumable loan", body: ["An assumable FHA mortgage can be transferred to a future qualified buyer at your locked rate—a genuine resale lever if rates climb after you close."] },
        ],
      },
      {
        heading: "FHA Modular vs. FHA Manufactured: What's the Difference?",
        body: ["The classification drives the program, and the program drives your rate and insurance. Getting this one distinction right is half the battle."],
        subsections: [
          { heading: "Modular homes (Title II)", body: ["Built to state and local codes, inspected in the factory, titled as real estate. Financed with a standard FHA purchase or construction-to-permanent mortgage on the same terms as site-built homes."] },
          { heading: "Manufactured homes (Title I)", body: ["Built to the HUD code with a permanent chassis. Eligible for FHA Title I programs and Title II with permanent foundation and appropriate classification—but with tighter lender appetite and, in some cases, chattel pricing instead of mortgage pricing."] },
        ],
      },
      {
        heading: "FHA Mortgage Insurance Premium (MIP) Explained",
        body: ["MIP is the trade for the low down payment and flexible credit. It has two parts, and both are priced into your monthly math."],
        subsections: [
          { heading: "Upfront MIP (UFMIP)", body: ["1.75% of the base loan amount, payable at closing or financable into the loan. On a $289,500 loan (3.5% down on $300,000), that is roughly $5,066 rolled in."] },
          { heading: "Annual MIP", body: ["0.15%–0.55% per year depending on loan term, base loan amount, and down payment percentage, paid monthly in 12 installments. Loans with 10%+ down drop annual MIP after 11 years; 3.5%-down loans carry it for the life of the loan."] },
          { heading: "Example: $250,000 FHA loan", lead: "What the numbers look like:", bullets: ["3.5% down payment: $8,750", "Base loan amount: $241,250", "Financed UFMIP (1.75%): $4,222", "Annual MIP at 0.55%: ~$110/month added to the payment"] },
        ],
      },
      {
        heading: "FHA Borrower Requirements",
        body: ["Underwriting boxes to check before you shop rate quotes."],
        bullets: [
          "580+ FICO for 3.5% down (500–579 requires 10% down at lenders who accept it)",
          "43% debt-to-income typical; up to 50% possible with strong compensating factors",
          "Stable two-year employment and income history (factory deposits count in the file)",
          "Primary residence only—no investment ADUs or rentals on this program",
          "3.5% down can include gift funds from family or documented Down Payment Assistance",
        ],
      },
      {
        heading: "Property Requirements",
        body: ["The home must satisfy HUD Minimum Property Requirements—safety, soundness, and security—for FHA to insure the loan."],
        bullets: [
          "Permanent foundation engineered to HUD guidelines (permanent perimeter with anchors or piers)",
          "Modular: state modular program labels and third-party inspection certificates in the file",
          "Manufactured: HUD data plate and certification label affixed, title converted to real property",
          "Utilities, drainage, roof, and access meet HUD MPR standards",
          "The appraiser classifies the construction type—misclassification is the #1 modular FHA failure",
        ],
      },
      {
        heading: "FHA Loan Limits by Area",
        body: [
          "FHA caps the base loan amount by county. In 2026 the floor for a single-family home is $524,225 and the high-cost ceiling is $1,209,750. Most modular budgets sit comfortably under the floor, but high-cost counties get the ceiling. Your lender pulls the limit for the property's county as part of pre-qualification.",
        ],
      },
      {
        heading: "FHA Construction-to-Permanent for Modular Homes",
        body: ["Building rather than buying finished? FHA has a single-close construction-to-permanent option, and it pairs naturally with factory production."],
        subsections: [
          { heading: "How it works", bullets: ["One closing covers land, factory invoice, and site work", "Interest-only payments during production and set", "Automatic conversion to the permanent FHA mortgage at certificate of occupancy", "3.5% down applies to the total project cost"] },
          { heading: "Requirements", bullets: ["Licensed general contractor or installer for the set and finish", "Engineered foundation plan approved before the first draw", "Draw schedule written around factory milestones, not stick-built phases", "Appraisal based on plans and specifications plus the land value"] },
        ],
      },
      {
        heading: "FHA vs. Conventional for Modular Homes",
        body: ["The cross-shopping decision usually comes down to credit score, down payment savings, and how long you will keep the mortgage."],
        bullets: [
          "FHA wins with 580–680 credit and 3–5% down—conventional pricing gets thin below 660",
          "Conventional wins at 700+ with 10%+ down—PMI is cheaper than MIP and drops at 20% equity",
          "FHA MIP is mostly permanent at 3.5% down; conventional PMI self-cancels",
          "Refinancing out of FHA later is common—price the exit when you price the entry",
        ],
      },
      {
        heading: "The FHA Appraisal for Modular Homes",
        body: ["The appraisal is where misclassification bites. Order the right one and the file sails; order the wrong one and you start over."],
        subsections: [
          { heading: "Minimum Property Requirements (MPRs)", body: ["The appraiser verifies safety, soundness, and security: working systems, sound structure, adequate utilities, no health hazards."] },
          { heading: "Modular-specific items", body: ["For modular, the appraiser uses the standard site-built appraisal form with site-built comparables. The file should include state modular program labels and third-party inspection certificates so the classification is documented, not inferred."] },
        ],
      },
      {
        heading: "Step-by-Step FHA Process for Modular Homes",
        body: ["What week-by-week progress looks like with a prefab-experienced FHA lender."],
        bullets: [
          "Pre-qualification (day 1): score against FHA modular lenders, soft pull only",
          "Application + construction packet (week 1): income, assets, factory invoice, foundation plan",
          "Appraisal + engineering review (weeks 2–3): correct form, correct comparables",
          "Underwriting to clear-to-close (weeks 3–4): conditions cleared while the factory builds",
          "Single closing (week 4–5): one set of documents, one rate lock",
          "Production, delivery, set (weeks 5–12): draws fund milestones",
          "CO + conversion (week 12–16): permanent FHA mortgage activates automatically",
        ],
      },
      {
        heading: "Common FHA Mistakes with Modular Homes",
        body: ["The declines ModFii sees are almost never about the buyer—they are about the file."],
        bullets: [
          "Letting the lender classify the home as manufactured when it is modular",
          "Ordering a HUD-code appraisal form for a code-built modular",
          "Draw schedules that miss factory deposit deadlines and forfeit production slots",
          "Foundation engineering submitted after the build starts instead of before underwriting",
          "Shopping the factory deposit on a credit card before the lender's asset review",
        ],
      },
      {
        heading: "Why Many FHA Lenders Reject Modular Homes",
        body: ["FHA insures the loan; the lender still takes the operational risk. Many decline factory-built files to avoid unfamiliar process risk."],
        subsections: [
          { heading: "The real problem", body: ["FHA does not penalize modular. Lender overlays do. A lender with no modular playbook escalates every factory document into an exception queue, and queues kill rate locks and production slots."] },
          { heading: "How ModFii helps", body: ["We match you with FHA-approved lenders who close modular files weekly—correct appraisal form, correct classification, draw schedule written for the production line. Same insurance, none of the friction."] },
        ],
      },
      {
        heading: "Check Your FHA Eligibility",
        lead: "FHA loan quick facts:",
        body: ["A 15-minute pre-qualification returns real rate and payment ranges from FHA lenders who finance modular construction—no hard pull, no cost, no obligation."],
        bullets: [
          "3.5% down with 580+ FICO",
          "UFMIP 1.75% + annual MIP 0.15%–0.55%",
          "County loan limits: $524,225 floor / $1,209,750 ceiling (2026)",
          "Assumable by future qualified buyers",
          "Construction-to-permanent available in one closing",
        ],
      },
    ],
    faqs: [
      { question: "Is an FHA loan good for a modular home?", answer: "Yes—FHA treats code-built modular homes exactly like site-built homes, so you get the 3.5% down payment and flexible credit terms with no factory penalty when the lender classifies the home correctly." },
      { question: "What credit score do I really need for FHA?", answer: "580 unlocks 3.5% down at most lenders. Between 500 and 579, 10% down is possible but few lenders approve the band. Above 620 your FHA pricing strengthens and conventional becomes worth cross-shopping." },
      { question: "How much are FHA closing costs on a modular home?", answer: "Expect 2%–5% of the loan amount including the 1.75% upfront MIP, origination, appraisal, title, and settlement. Construction-to-permanent files add modest draw-inspection fees." },
      { question: "Can I use gift funds for my FHA down payment?", answer: "Yes. Documented gifts from family, employers, or approved charities can cover the full 3.5% plus closing costs with a signed gift letter and paper trail." },
      { question: "Can I buy a modular home with land using FHA?", answer: "Yes. The land, factory invoice, and site work roll into one FHA base loan amount—3.5% applies to the total project, and existing land equity can cover it." },
      { question: "What if the modular home doesn't pass FHA appraisal?", answer: "The appraiser lists MPR deficiencies. Most are fixable at set (railings, steps, drainage). Structural or classification issues require re-appraisal on the correct form—ModFii lenders order the right form the first time." },
      { question: "How do I find FHA lenders who work with modular homes?", answer: "That is exactly what ModFii does: a 15-minute application matches you with FHA-approved lenders whose teams close factory-built files every week." },
      { question: "Can I refinance out of FHA later to drop mortgage insurance?", answer: "Yes. Once you reach 20% equity, an FHA-to-conventional refinance removes MIP entirely. Many buyers price that exit into their original decision." },
    ],
    related: [
      { href: "/modular-home-financing/fha-modular-manufactured", title: "FHA modular vs manufactured", description: "Classification details." },
      { href: "/compare/fha-vs-conventional-prefab", title: "FHA vs conventional", description: "Head-to-head comparison." },
      { href: "/modular-home-financing", title: "Modular financing hub", description: "The full financing guide." },
    ],
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
