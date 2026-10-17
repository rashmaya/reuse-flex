import { estimateReuseImpact } from "./purchase-impact.ts"
import type { PurchaseReceipt } from "./purchase-impact.ts"

export const ageBrackets = [
  { min: 0, max: 30, percent: 100, label: "0–30 days", tone: "mint" },
  { min: 31, max: 90, percent: 90, label: "31–90 days", tone: "blue" },
  { min: 91, max: 180, percent: 75, label: "91–180 days", tone: "purple" },
  { min: 181, max: 365, percent: 60, label: "181–365 days", tone: "amber" },
  { min: 366, max: 730, percent: 40, label: "366–730 days", tone: "rose" },
  { min: 731, max: Infinity, percent: 25, label: "731+ days", tone: "slate" },
] as const

export const formatGems = (value: bigint | string | number) =>
  BigInt(value).toLocaleString("en-IN")

export function readCost(input: string) {
  const raw = input.replace(/,/g, "").trim()
  if (!raw) return { value: 0n, error: "" }
  if (!/^\d+(\.\d{0,2})?$/.test(raw))
    return {
      value: 0n,
      error: "Enter a positive price with up to 2 decimal places.",
    }
  const [rupees, paise = ""] = raw.split(".")
  return {
    value: BigInt(rupees) * 100n + BigInt(paise.padEnd(2, "0")),
    error: "",
  }
}

export function readWhole(input: string, name = "value") {
  const raw = input.replace(/,/g, "").trim()
  if (!raw) return { value: 0n, error: "" }
  if (!/^\d+$/.test(raw))
    return { value: 0n, error: `Enter a non-negative whole ${name}.` }
  return { value: BigInt(raw), error: "" }
}

export function formatCost(input: string) {
  if (readCost(input).error || !input.trim()) return input
  const [whole, fraction] = input.replace(/,/g, "").split(".")
  return `${formatGems(whole)}${fraction === undefined ? "" : `.${fraction}`}`
}

export function localToday(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function ageFromPurchaseDate(purchased: string, today = localToday()) {
  if (!purchased) return { days: 0, error: "", complete: false }
  const timestamp = Date.parse(`${purchased}T00:00:00Z`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(purchased) ||
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== purchased
  )
    return { days: 0, error: "Enter a valid purchase date.", complete: false }
  const days = Math.round(
    (Date.parse(`${today}T00:00:00Z`) - timestamp) / 86_400_000,
  )
  if (days < 0)
    return {
      days: 0,
      error: "The purchase date can’t be in the future.",
      complete: false,
    }
  return { days, error: "", complete: true }
}

export function retention(age: number) {
  if (!Number.isSafeInteger(age) || age < 0)
    throw new RangeError("Age must be a non-negative whole number.")
  return ageBrackets.find((bracket) => age <= bracket.max)!
}

// All percentages are rounded independently, half up, with no floating-point drift.
export const roundPercent = (value: bigint, percent: number) =>
  (value * BigInt(percent) + 50n) / 100n

export function listingValue(cost: string, age: number) {
  const parsed = readCost(cost)
  if (parsed.error) throw new RangeError(parsed.error)
  const bracket = retention(age)
  const base = parsed.value === 0n ? 0n : (parsed.value / 50_000n) * 50n + 50n
  return { base, bracket, listing: roundPercent(base, bracket.percent) }
}

export function saleValues(acquisition: bigint) {
  if (acquisition < 0n) throw new RangeError("Acquisition cannot be negative.")
  if (acquisition === 0n)
    return { acquisition, price: 0n, bonus: 0n, payout: 0n, net: 0n }
  const discounted = roundPercent(acquisition, 90)
  const price = discounted < 1n ? 1n : discounted
  return {
    acquisition,
    price,
    bonus: 0n,
    payout: price,
    net: price - acquisition,
  }
}

export function swapBonus(acquisition: bigint) {
  if (acquisition < 0n) throw new RangeError("Acquisition cannot be negative.")
  return roundPercent(acquisition, 15)
}

export function resaleChain(start: bigint, count: number) {
  if (!Number.isInteger(count) || count < 1 || count > 10)
    throw new RangeError("Use 1–10 resales.")
  let acquisition = start
  return Array.from({ length: count }, (_, index) => {
    const sale = saleValues(acquisition)
    acquisition = sale.price
    return {
      ...sale,
      step: index + 1,
      seller: String.fromCharCode(65 + index),
      buyer: String.fromCharCode(66 + index),
    }
  })
}

export type GemProduct = {
  id: string
  name: string
  cost: string
  age: number
  acquisition: string
  owner: string
  status: "listed" | "owned"
  image: string
  bill?: string
  photo?: string
  purchaseDate?: string
  category?: string
}
export type Transaction = {
  id: string
  kind: "sale" | "buy" | "credit" | "swap"
  name: string
  amount: string
  bonus: string
  date: string
  receipt?: PurchaseReceipt
}
export type SwapOffer = {
  id: string
  offeredProductId: string
  requestedProductId: string
  proposer: string
  recipient: string
  status: "pending" | "accepted" | "rejected"
  date: string
}
export type MarketState = {
  balance: string
  products: GemProduct[]
  transactions: Transaction[]
  offers: SwapOffer[]
}

export function initialMarket(): MarketState {
  const products = [
    {
      name: "The everyday tee",
      cost: "499",
      age: 15,
      image: "774f0.png",
      owner: "Rohan",
    },
    {
      name: "Weekend sneakers",
      cost: "500",
      age: 60,
      image: "20ca5.png",
      owner: "Meera",
    },
    {
      name: "Everyday denim",
      cost: "2600",
      age: 120,
      image: "c5bb2.png",
      owner: "You",
    },
    {
      name: "Study-session headphones",
      cost: "12000",
      age: 250,
      image: "6690f.png",
      owner: "Ishaan",
    },
    {
      name: "The studio laptop",
      cost: "100000",
      age: 500,
      image: "be307.png",
      owner: "Ananya",
    },
    {
      name: "One more festive season",
      cost: "4500",
      age: 900,
      image: "84f2e.png",
      owner: "Neha",
    },
  ].map((p, index) => ({
    ...p,
    id: `sample-${index}`,
    acquisition: String(listingValue(p.cost, p.age).listing),
    status: "listed" as const,
  }))
  return {
    balance: "1240",
    products,
    transactions: [
      {
        id: "seed-sale",
        kind: "sale",
        name: "Sold Shirt",
        amount: "900",
        bonus: "0",
        date: "2026-10-16T12:00:00",
      },
      {
        id: "seed-buy",
        kind: "buy",
        name: "Bought Jacket",
        amount: "810",
        bonus: "0",
        date: "2026-10-15T12:00:00",
      },
      {
        id: "seed-credit",
        kind: "credit",
        name: "Demo welcome credit",
        amount: "1000",
        bonus: "0",
        date: "2026-10-14T12:00:00",
      },
    ],
    offers: [
      {
        id: "seed-swap-offer",
        offeredProductId: "sample-1",
        requestedProductId: "sample-2",
        proposer: "Meera",
        recipient: "You",
        status: "pending",
        date: "2026-10-17T12:00:00",
      },
    ],
  }
}

export function buyProduct(state: MarketState, id: string): MarketState {
  const product = state.products.find((p) => p.id === id)
  if (!product || product.status !== "listed")
    throw new Error("This item is not available.")
  if (product.owner === "You")
    throw new Error("You cannot buy your own listing.")
  const { price } = saleValues(BigInt(product.acquisition))
  if (BigInt(state.balance) < price)
    throw new Error(
      `Need ${formatGems(price - BigInt(state.balance))} more gems.`,
    )
  const transactionId = crypto.randomUUID()
  const date = new Date().toISOString()
  const receipt: PurchaseReceipt = {
    id: transactionId,
    date,
    product: {
      id: product.id,
      name: product.name,
      cost: product.cost,
      image: product.image,
      ...(product.photo ? { photo: product.photo } : {}),
    },
    gemsPaid: String(price),
    impact: estimateReuseImpact(readCost(product.cost).value),
  }
  return {
    ...state,
    balance: String(BigInt(state.balance) - price),
    products: state.products.map((p) =>
      p.id === id
        ? { ...p, owner: "You", status: "owned", acquisition: String(price) }
        : p,
    ),
    transactions: [
      {
        id: transactionId,
        kind: "buy",
        name: `Bought ${product.name}`,
        amount: String(price),
        bonus: "0",
        date,
        receipt,
      },
      ...state.transactions,
    ],
  }
}

export function completeSale(state: MarketState, id: string): MarketState {
  const product = state.products.find((p) => p.id === id)
  if (!product || product.owner !== "You" || product.status !== "listed")
    throw new Error("List your item before completing a sale.")
  const sale = saleValues(BigInt(product.acquisition))
  return {
    ...state,
    balance: String(BigInt(state.balance) + sale.price),
    products: state.products.map((p) =>
      p.id === id
        ? {
            ...p,
            owner: "Maya",
            acquisition: String(sale.price),
            status: "listed",
          }
        : p,
    ),
    transactions: [
      {
        id: crypto.randomUUID(),
        kind: "sale",
        name: `Sold ${product.name}`,
        amount: String(sale.price),
        bonus: "0",
        date: new Date().toISOString(),
      },
      ...state.transactions,
    ],
  }
}

export function proposeSwap(
  state: MarketState,
  offeredProductId: string,
  requestedProductId: string,
): MarketState {
  const offered = state.products.find((p) => p.id === offeredProductId)
  const requested = state.products.find((p) => p.id === requestedProductId)
  if (!offered || offered.owner !== "You")
    throw new Error("Choose an item from your wardrobe.")
  if (!requested || requested.owner === "You" || requested.status !== "listed")
    throw new Error("This item is not available for swapping.")
  if (
    state.offers.some(
      (offer) =>
        offer.status === "pending" &&
        offer.offeredProductId === offeredProductId &&
        offer.requestedProductId === requestedProductId,
    )
  )
    throw new Error("You already proposed this swap.")
  return {
    ...state,
    offers: [
      {
        id: crypto.randomUUID(),
        offeredProductId,
        requestedProductId,
        proposer: "You",
        recipient: requested.owner,
        status: "pending",
        date: new Date().toISOString(),
      },
      ...state.offers,
    ],
  }
}

export function respondToSwap(
  state: MarketState,
  offerId: string,
  accept: boolean,
): MarketState {
  const offer = state.offers.find((candidate) => candidate.id === offerId)
  if (!offer || offer.status !== "pending" || offer.recipient !== "You")
    throw new Error("This offer can no longer be updated.")
  if (!accept)
    return {
      ...state,
      offers: state.offers.map((candidate) =>
        candidate.id === offerId
          ? { ...candidate, status: "rejected" as const }
          : candidate,
      ),
    }
  const offered = state.products.find((p) => p.id === offer.offeredProductId)
  const requested = state.products.find(
    (p) => p.id === offer.requestedProductId,
  )
  if (
    !offered ||
    !requested ||
    offered.owner !== offer.proposer ||
    requested.owner !== "You"
  )
    throw new Error("One of these items is no longer available.")
  const bonus = swapBonus(BigInt(requested.acquisition))
  return {
    ...state,
    balance: String(BigInt(state.balance) + bonus),
    products: state.products.map((product) =>
      product.id === offered.id
        ? { ...product, owner: "You", status: "owned" as const }
        : product.id === requested.id
          ? { ...product, owner: offer.proposer, status: "owned" as const }
          : product,
    ),
    offers: state.offers.map((candidate) =>
      candidate.id === offerId
        ? { ...candidate, status: "accepted" as const }
        : candidate,
    ),
    transactions: [
      {
        id: crypto.randomUUID(),
        kind: "swap",
        name: `Swapped ${requested.name} for ${offered.name}`,
        amount: String(bonus),
        bonus: String(bonus),
        date: new Date().toISOString(),
      },
      ...state.transactions,
    ],
  }
}

export function gemChecks() {
  const checks = [
    {
      name: "Gem sale 1,000 → price and payout 900, no bonus",
      pass: (() => {
        const s = saleValues(1000n)
        return s.price === 900n && s.bonus === 0n && s.payout === 900n
      })(),
    },
    {
      name: "Swap bonus 1,000 → 150",
      pass: (() => {
        return swapBonus(1000n) === 150n
      })(),
    },
    {
      name: "Swap bonus 810 → 122",
      pass: (() => {
        return swapBonus(810n) === 122n
      })(),
    },
    {
      name: "Cost ₹2,600, age 120 days → listing 225",
      pass: listingValue("2600", 120).listing === 225n,
    },
    {
      name: "₹499 → base 50; ₹500 → base 100",
      pass:
        listingValue("499", 0).base === 50n &&
        listingValue("500", 0).base === 100n,
    },
    {
      name: "Day 30 → 100%; day 31 → 90%",
      pass: retention(30).percent === 100 && retention(31).percent === 90,
    },
    {
      name: "Day 730 → 40%; day 731 → 25%",
      pass: retention(730).percent === 40 && retention(731).percent === 25,
    },
    {
      name: "1-gem acquisition → minimum price 1, payout ≥ 0",
      pass: saleValues(1n).price === 1n && saleValues(1n).payout >= 0n,
    },
  ]
  return checks
}
