export interface LenderSeed {
  slug: string;
  name: string;
  description: string;
  specialties: string[];
  minCredit: number;
  greenMortgage: boolean;
  avgApprovalDays: number;
  rateDiscountBps: number;
  nmlsId: string;
}

export const LENDER_SEEDS: LenderSeed[] = [
  {
    slug: "greenline-modular",
    name: "Greenline Modular Lending",
    description:
      "Energy-efficient specialists offering green mortgage discounts for ENERGY STAR and high-performance prefab homes.",
    specialties: ["modular", "prefab", "adu", "green"],
    minCredit: 640,
    greenMortgage: true,
    avgApprovalDays: 7,
    rateDiscountBps: 45,
    nmlsId: "1842201",
  },
  {
    slug: "factory-first-mortgage",
    name: "Factory First Mortgage",
    description:
      "Construction-to-permanent lender with draw schedules aligned to factory production, delivery, and crane-set milestones.",
    specialties: ["modular", "prefab", "construction"],
    minCredit: 620,
    greenMortgage: false,
    avgApprovalDays: 8,
    rateDiscountBps: 15,
    nmlsId: "1720944",
  },
  {
    slug: "hearthstone-fha",
    name: "Hearthstone FHA Partners",
    description:
      "FHA-focused shop for modular and HUD-code homes on permanent foundations, including 3.5% down and limited 203(k) work.",
    specialties: ["modular", "manufactured", "fha"],
    minCredit: 580,
    greenMortgage: false,
    avgApprovalDays: 12,
    rateDiscountBps: 0,
    nmlsId: "1453388",
  },
  {
    slug: "valor-prefab-va",
    name: "Valor Prefab VA",
    description:
      "VA specialists who treat modular and prefab homes as real property when they sit on a permanent foundation.",
    specialties: ["modular", "prefab", "va"],
    minCredit: 580,
    greenMortgage: true,
    avgApprovalDays: 9,
    rateDiscountBps: 25,
    nmlsId: "1983302",
  },
  {
    slug: "prairie-usda",
    name: "Prairie USDA Home Loans",
    description:
      "Zero-down USDA financing for eligible rural and suburban-edge sites, including modular packages with land.",
    specialties: ["modular", "usda", "with-land"],
    minCredit: 640,
    greenMortgage: false,
    avgApprovalDays: 14,
    rateDiscountBps: 10,
    nmlsId: "1604417",
  },
  {
    slug: "summit-adu-capital",
    name: "Summit ADU Capital",
    description:
      "Backyard cottage and accessory dwelling specialists using HELOCs, renovation loans, and construction-to-perm structures.",
    specialties: ["adu", "prefab", "construction"],
    minCredit: 660,
    greenMortgage: true,
    avgApprovalDays: 10,
    rateDiscountBps: 20,
    nmlsId: "2018841",
  },
  {
    slug: "crossmod-conventional",
    name: "CrossMod Conventional",
    description:
      "Conventional and Fannie Mae CrossMod lenders for factory-built homes that meet site-built appearance and foundation standards.",
    specialties: ["modular", "manufactured", "conventional"],
    minCredit: 680,
    greenMortgage: false,
    avgApprovalDays: 6,
    rateDiscountBps: 30,
    nmlsId: "1332090",
  },
  {
    slug: "tiny-foundation-lending",
    name: "Foundation Tiny Lending",
    description:
      "Tiny homes on permanent foundations financed as real property. Chattel options available only when wheels remain.",
    specialties: ["tiny", "modular", "chattel"],
    minCredit: 640,
    greenMortgage: false,
    avgApprovalDays: 11,
    rateDiscountBps: 0,
    nmlsId: "1766503",
  },
];

export const LOAN_PRODUCT_SEEDS = [
  {
    slug: "fha",
    name: "FHA Modular & Manufactured",
    downPayment: "3.5%",
    creditMin: 580,
    summary: "Low down payment government-backed loans for modular and HUD-code homes on permanent foundations.",
    bestFor: "First-time buyers and credit rebuilding",
  },
  {
    slug: "va",
    name: "VA Prefab & Modular",
    downPayment: "0%",
    creditMin: 580,
    summary: "No-down-payment VA loans when the home is real property on a permanent foundation.",
    bestFor: "Eligible veterans, service members, and surviving spouses",
  },
  {
    slug: "usda",
    name: "USDA Rural Modular",
    downPayment: "0%",
    creditMin: 640,
    summary: "Zero-down rural development loans for income-eligible buyers in USDA map areas.",
    bestFor: "Rural and suburban-edge modular buyers",
  },
  {
    slug: "construction-to-permanent",
    name: "Construction-to-Permanent",
    downPayment: "3.5%–20%",
    creditMin: 620,
    summary: "Single-close loan covering factory production, delivery, site work, then converting to a mortgage.",
    bestFor: "Custom modular builds and land-plus-home packages",
  },
  {
    slug: "conventional",
    name: "Conventional / CrossMod",
    downPayment: "3%–20%",
    creditMin: 620,
    summary: "Agency-backed mortgages for modular and CrossMod homes titled as real estate.",
    bestFor: "Strong credit buyers seeking the lowest long-term rate",
  },
] as const;
