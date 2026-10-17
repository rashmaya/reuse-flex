import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import {
  ageBrackets,
  buyProduct,
  completeSale,
  formatCost,
  formatGems,
  gemChecks,
  initialMarket,
  listingValue,
  proposeSwap,
  readCost,
  readWhole,
  respondToSwap,
  resaleChain,
  saleValues,
  swapBonus,
} from "./gems"
import type { GemProduct, MarketState, SwapOffer } from "./gems"
import ListingForm from "./ListingForm"
import PostPurchase from "./PostPurchase"
import { formatOriginalAmount } from "./purchase-impact"
import "./gem-marketplace.css"

type Tab = "marketplace" | "offers" | "chain" | "wallet"
const purchaseIdFromHash = () =>
  location.hash.startsWith("#purchase/")
    ? location.hash.slice("#purchase/".length)
    : ""
const loadListingDraft = () => {
  try {
    return JSON.parse(
      localStorage.getItem("reuse-listing-draft-v1") || "null",
    ) as GemProduct | null
  } catch {
    return null
  }
}
type IconName = "gem" | "shop" | "chain" | "wallet" | "arrow" | "back" | "close" | "sun" | "moon" | "help" | "receipt" | "check" | "plus" | "minus" | "swap"
type MarkProps = {
  name: IconName
  className?: string
}
function Mark({ name, className = "" }: MarkProps) {
  const paths: Record<IconName, ReactNode> = {
    gem: (
      <>
        <path d="m3 8 4-5h10l4 5-9 13L3 8Z" />
        <path d="M3 8h18M7 3l5 18 5-18M7 3l5 5 5-5" />
      </>
    ),
    shop: (
      <>
        <path d="M4 9h16l-1 11H5L4 9Zm4 0V7a4 4 0 0 1 8 0v2" />
      </>
    ),
    chain: (
      <>
        <path d="M4 6h5m6 0h5M4 18h5m6 0h5M12 8v8" />
        <circle cx="12" cy="5" r="3" />
        <circle cx="12" cy="19" r="3" />
      </>
    ),
    wallet: (
      <>
        <rect x="3" y="5" width="18" height="15" rx="3" />
        <path d="M3 8V5a2 2 0 0 1 2-2h12M16 11h5v5h-5a2.5 2.5 0 0 1 0-5Z" />
      </>
    ),
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    back: <path d="M20 12H5m6-6-6 6 6 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
      </>
    ),
    moon: <path d="M20 14a8 8 0 0 1-10-10A8.5 8.5 0 1 0 20 14Z" />,
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1-1.5 3m0 3h.01" />
      </>
    ),
    receipt: (
      <>
        <path d="M5 3v18l3-2 4 2 4-2 3 2V3l-3 2-4-2-4 2-3-2Zm4 6h6m-6 4h6m-6 4h3" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    swap: (
      <>
        <path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4" />
      </>
    ),
  }
  return (
    <svg
      className={`gm-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Count({ value }: { value: bigint }) {
  const [shown, setShown] = useState(value)
  const previous = useRef(value)
  useEffect(() => {
    const from = previous.current
    previous.current = value
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value)
      return
    }
    let frame: number
    const start = performance.now()
    function update(now: number) {
      const fraction = Math.min(1, (now - start) / 420)
      const eased = BigInt(Math.round((1 - (1 - fraction) ** 3) * 1000))
      setShown(from + ((value - from) * eased) / 1000n)
      if (fraction < 1) frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <span aria-label={formatGems(value)}>{formatGems(shown)}</span>
}

function Sheet({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const lastFocus = document.activeElement as HTMLElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusable = () => [
      ...(ref.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input, [tabindex="0"]',
      ) || []),
    ]
    focusable()[0]?.focus()
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "Tab") {
        const controls = focusable(),
          first = controls[0],
          last = controls.at(-1)
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener("keydown", key)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener("keydown", key)
      lastFocus?.focus()
    }
  }, [onClose])
  return (
    <div className="gm-overlay" onClick={onClose}>
      <section
        className={`gm-sheet ${wide ? "gm-sheet-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="gm-sheet-handle" />
        <div className="gm-section-head">
          <h2>{title}</h2>
          <button
            className="gm-icon-button"
            aria-label={`Close ${title}`}
            onClick={onClose}
          >
            <Mark name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

function ProductCard({
  product,
  balance,
  onBuy,
  onSwap,
  onSell,
}: {
  product: GemProduct
  balance: bigint
  onBuy: () => void
  onSwap: () => void
  onSell: () => void
}) {
  const sale = saleValues(BigInt(product.acquisition))
  const own = product.owner === "You"
  const need = sale.price - balance
  const bracket = ageBrackets.find((b) => product.age <= b.max)!
  return (
    <article className="gm-product">
      <div className="gm-product-image">
        <img
          src={product.photo || `/assets/${product.image}`}
          alt={product.name}
        />
        <span className={`gm-chip gm-${bracket.tone}`}>
          {product.age} days old
        </span>
        {own && <span className="gm-owner">YOURS</span>}
      </div>
      <div className="gm-product-body">
        <div className="gm-product-seller">
          <span className="gm-avatar">{product.owner.slice(0, 1)}</span>
          {own ? "Your wardrobe" : `${product.owner}’s wardrobe`}
          <span>{product.status === "owned" ? "Not listed" : "Available"}</span>
        </div>
        <h3>{product.name}</h3>
        <p className="gm-muted">
          Originally ₹{formatCost(product.cost)} · {bracket.percent}% retained
          at listing
        </p>
        <div className="gm-product-price">
          <Mark name="gem" />
          <strong>{formatGems(sale.price)}</strong>
          <span>gems</span>
          <s aria-label={`Acquisition value ${product.acquisition}`}>
            {formatGems(product.acquisition)}
          </s>
        </div>
        <span className="gm-bonus-chip">
          <Mark name="swap" />
          {formatGems(swapBonus(BigInt(product.acquisition)))} bonus on swaps
          only
        </span>
        {own ? (
          <>
            <button className="gm-btn gm-btn-soft" onClick={onSell}>
              {product.status === "owned"
                ? "Sell this item"
                : "Manage your listing"}
              <Mark name="arrow" />
            </button>
            {product.status === "listed" && (
              <p className="gm-card-hint">
                Your listing · you can’t buy your own item
              </p>
            )}
          </>
        ) : (
          <>
            <div className="gm-product-actions">
              <button
                className="gm-btn gm-btn-primary"
                disabled={need > 0n}
                onClick={onBuy}
              >
                {need > 0n
                  ? `Need ${formatGems(need)} more`
                  : "Buy with gems"}
                {need <= 0n && <Mark name="arrow" />}
              </button>
              <button className="gm-btn gm-btn-soft" onClick={onSwap}>
                <Mark name="swap" />
                Propose swap
              </button>
            </div>
            {need > 0n && (
              <p className="gm-card-hint">Sell a keeper to grow your balance</p>
            )}
          </>
        )}
      </div>
    </article>
  )
}

function PriceChart({ rows }: { rows: ReturnType<typeof resaleChain> }) {
  const max = rows[0]?.acquisition || 1n
  const values = [rows[0]?.acquisition || 0n, ...rows.map((r) => r.price)]
  const coords = values.map((value, i) => ({
    x: 52 + (i * 520) / (values.length - 1),
    y: 158 - Number((value * 10000n) / max) / 100,
    value,
  }))
  const path = coords
    .map((point, i) => `${i ? "L" : "M"}${point.x},${point.y}`)
    .join(" ")
  return (
    <div className="gm-chart">
      <div className="gm-section-head">
        <h3>Less to pay. More to pass on.</h3>
        <span className="gm-chart-key">Sale price</span>
      </div>
      <svg
        viewBox="0 0 620 205"
        role="img"
        aria-label={`Sale price from ${formatGems(max)} acquisition to ${formatGems(rows.at(-1)?.price || 0n)} gems after ${rows.length} resales`}
      >
        <defs>
          <linearGradient id="gem-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gm-primary)" stopOpacity=".18" />
            <stop offset="100%" stopColor="var(--gm-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[58, 108, 158].map((y, i) => (
          <g key={y}>
            <line x1="52" y1={y} x2="572" y2={y} className="gm-chart-grid" />
            <text x="42" y={y + 4} textAnchor="end">
              {i === 0 ? "100%" : i === 1 ? "50%" : "0"}
            </text>
          </g>
        ))}
        <path d={`${path}L572,158 L52,158 Z`} fill="url(#gem-area)" />
        <path d={path} className="gm-chart-line" />
        {coords.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={i === coords.length - 1 ? 5 : 3.5}
              className="gm-chart-dot"
            >
              <title>
                {i ? `Sale ${i}` : "Original"}: {formatGems(p.value)} gems
              </title>
            </circle>
            <text x={p.x} y="188" textAnchor="middle">
              {i === 0 ? "Original" : `#${i}`}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

const nav: {
  id: Tab
  label: string
  icon: IconName
}[] = [
  { id: "marketplace", label: "Store", icon: "shop" },
  { id: "offers", label: "Swap offers", icon: "swap" },
  { id: "chain", label: "Resale chain", icon: "chain" },
  { id: "wallet", label: "My wallet", icon: "wallet" },
]

type GemMarketplaceProps = {
  onExit: (destination?: "wardrobe" | "circles") => void
  initialTab?: Tab
  initialListing?: boolean
}
export default function GemMarketplace({
  onExit,
  initialTab = "marketplace",
  initialListing = false,
}: GemMarketplaceProps) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [listingOpen, setListingOpen] = useState(initialListing)
  const [dark, setDark] = useState(
    () => localStorage.getItem("reuse-gem-theme") === "dark",
  )
  const [rules, setRules] = useState(false)
  const [dev, setDev] = useState(
    () => new URLSearchParams(location.search).get("dev") === "1",
  )
  const [chainStart, setChainStart] = useState("225")
  const [steps, setSteps] = useState(3)
  const [market, setMarket] = useState<MarketState>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("reuse-gem-market-v1") || "null",
      ) as MarketState | null
      const initial = initialMarket()
      return saved
        ? {
            ...saved,
            transactions: saved.transactions.map((transaction) =>
              transaction.kind === "sale"
                ? { ...transaction, bonus: "0" }
                : transaction,
            ),
            offers: saved.offers || initial.offers,
          }
        : initial
    } catch {
      return initialMarket()
    }
  })
  const [seller, setSeller] = useState<GemProduct | null>(null)
  const [buying, setBuying] = useState<GemProduct | null>(null)
  const [swapping, setSwapping] = useState<GemProduct | null>(null)
  const [swapItemId, setSwapItemId] = useState("")
  const [receiptId, setReceiptId] = useState(purchaseIdFromHash)
  const [receiptDetailsOpen, setReceiptDetailsOpen] = useState(false)
  const [filter, setFilter] = useState("All items")
  const [notice, setNotice] = useState("")
  const [sparkle, setSparkle] = useState(false)
  const source =
    seller ||
    market.products.find((product) => product.owner === "You") ||
    market.products[0]
  const cost = source?.cost || ""
  const age = String(source?.age ?? 0)
  const costInput = readCost(cost)
  const valid = !costInput.error && costInput.value > 0n
  const calculated = listingValue(costInput.error ? "" : cost, Number(age))
  const listing = valid ? calculated.listing : 0n
  const startInput = readWhole(chainStart, "gem value")
  const chain = resaleChain(startInput.error ? 0n : startInput.value, steps)
  const totalBonus = chain.reduce((total, row) => total + row.bonus, 0n)
  const sellProduct = seller
    ? market.products.find((p) => p.id === seller.id) || seller
    : null
  const selling = saleValues(BigInt(sellProduct?.acquisition || "0"))
  const balance = BigInt(market.balance)
  const bonuses = market.transactions.reduce(
    (sum, t) => sum + BigInt(t.bonus),
    0n,
  )
  const completedPurchase = market.transactions.find(
    (transaction) => transaction.id === receiptId,
  )?.receipt
  const listingDraft = initialListing
    ? loadListingDraft()
    : null

  useEffect(() => {
    localStorage.setItem("reuse-gem-theme", dark ? "dark" : "light")
  }, [dark])
  useEffect(() => {
    try {
      localStorage.setItem("reuse-gem-market-v1", JSON.stringify(market))
    } catch {
      setNotice("Storage is full. This session’s changes could not be saved.")
    }
  }, [market])
  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => {
      setNotice("")
      setSparkle(false)
    }, 4500)
    return () => clearTimeout(timeout)
  }, [notice])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault()
        setDev((v) => !v)
      }
    }
    document.addEventListener("keydown", key)
    return () => document.removeEventListener("keydown", key)
  }, [])
  useEffect(() => {
    const updateReceipt = () => {
      setReceiptId(purchaseIdFromHash())
      setReceiptDetailsOpen(false)
    }
    window.addEventListener("hashchange", updateReceipt)
    return () => window.removeEventListener("hashchange", updateReceipt)
  }, [])

  function changeTab(next: Tab) {
    setReceiptId("")
    setReceiptDetailsOpen(false)
    if (location.hash.startsWith("#purchase/")) location.hash = "gems"
    setTab(next)
    setSeller(null)
    setListingOpen(false)
    window.scrollTo({ top: 0, behavior: "instant" })
  }
  function openListing() {
    setSeller(null)
    setListingOpen(true)
    window.scrollTo({ top: 0, behavior: "instant" })
  }
  function listForSale() {
    if (!sellProduct || !sellProduct.name.trim() || selling.acquisition === 0n)
      return
    setMarket((prev) => ({
      ...prev,
      products: [
        { ...sellProduct, name: sellProduct.name.trim(), status: "listed" },
        ...prev.products.filter((p) => p.id !== sellProduct.id),
      ],
    }))
    setNotice("Your listing is live in the demo marketplace.")
  }
  function settleSale() {
    if (!sellProduct) return
    try {
      setMarket((prev) => completeSale(prev, sellProduct.id))
      setSparkle(true)
      setNotice(
        `Sale complete. ${formatGems(selling.price)} gems added with no swap bonus.`,
      )
      setSeller(null)
      setTab("wallet")
    } catch (error) {
      setNotice((error as Error).message)
    }
  }
  function purchase() {
    if (!buying) return
    try {
      const next = buyProduct(market, buying.id)
      setMarket(next)
      setNotice("")
      setBuying(null)
      showPurchase(next.transactions[0].id)
    } catch (error) {
      setNotice((error as Error).message)
    }
  }
  function sendSwapProposal() {
    if (!swapping || !swapItemId) return
    try {
      setMarket((previous) =>
        proposeSwap(previous, swapItemId, swapping.id),
      )
      setSwapping(null)
      setSwapItemId("")
      setNotice("Swap proposed. You’ll see the seller’s response in offers.")
      setTab("offers")
    } catch (error) {
      setNotice((error as Error).message)
    }
  }
  function respond(offer: SwapOffer, accept: boolean) {
    try {
      setMarket((previous) => respondToSwap(previous, offer.id, accept))
      setSparkle(accept)
      setNotice(
        accept
          ? "Swap accepted. Your items changed wardrobes and your swap bonus was added."
          : "Swap offer declined. Both items stay with their current owners.",
      )
    } catch (error) {
      setNotice((error as Error).message)
    }
  }
  function showPurchase(id: string) {
    setReceiptId(id)
    setReceiptDetailsOpen(false)
    location.hash = `purchase/${id}`
    window.scrollTo(0, 0)
    requestAnimationFrame(() =>
      document.getElementById("purchase-title")?.focus({ preventScroll: true }),
    )
  }
  const shownProducts = market.products.filter((p) =>
    filter === "My items"
      ? p.owner === "You"
      : filter === "Under 100 gems"
        ? saleValues(BigInt(p.acquisition)).price < 100n
        : true,
  )
  const swapInventory = market.products.filter(
    (product) => product.owner === "You" && product.id !== swapping?.id,
  )

  if (completedPurchase)
    return (
      <div className={`gm-root purchase-page ${dark ? "gm-dark" : ""}`}>
        <PostPurchase
          receipt={completedPurchase}
          onWardrobe={() => onExit("wardrobe")}
          onStore={() => changeTab("marketplace")}
          onReceipt={() => setReceiptDetailsOpen(true)}
        />
        {receiptDetailsOpen && (
          <Sheet
            title="Your purchase receipt"
            onClose={() => setReceiptDetailsOpen(false)}
          >
            <span className="gm-chip gm-purple">DEMO RECEIPT</span>
            <h3>{completedPurchase.product.name}</h3>
            <dl className="purchase-receipt-details">
              <div>
                <dt>Reference</dt>
                <dd>RF-{completedPurchase.id.slice(0, 8).toUpperCase()}</dd>
              </div>
              <div>
                <dt>Purchased</dt>
                <dd>
                  {new Date(completedPurchase.date).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </dd>
              </div>
              <div>
                <dt>Original price reference</dt>
                <dd>
                  {formatOriginalAmount(
                    completedPurchase.impact.originalPricePaise,
                  )}
                </dd>
              </div>
              <div>
                <dt>Item payment</dt>
                <dd>{formatGems(completedPurchase.gemsPaid)} gems</dd>
              </div>
              <div>
                <dt>Fees / pickup</dt>
                <dd>0 gems / 0 gems</dd>
              </div>
              <div>
                <dt>Total gems paid</dt>
                <dd>{formatGems(completedPurchase.gemsPaid)} gems</dd>
              </div>
              <div>
                <dt>Cash payment</dt>
                <dd>₹0</dd>
              </div>
            </dl>
            <p className="gm-small">
              This is a simulated purchase, not a payment invoice. No cash was
              charged. Estimated savings assume this reuse replaces a new
              purchase.
            </p>
            <button
              className="gm-btn gm-btn-primary"
              onClick={() => setReceiptDetailsOpen(false)}
            >
              Done
              <Mark name="check" />
            </button>
          </Sheet>
        )}
      </div>
    )

  return (
    <div className={`gm-root ${dark ? "gm-dark" : ""}`}>
      <header className="gm-header">
        <div className="gm-header-inner">
          <button
            className="gm-brand"
            onClick={() => onExit("wardrobe")}
            aria-label="Gem Marketplace home"
          >
            <span className="gm-original-logo">
              <img src="/assets/bd04f.svg" alt="Reuse Flex" />
            </span>
            <span className="gm-brand-sub">AANYA’S ARCHIVE</span>
          </button>
          <div className="gm-desktop-nav">
            {nav.map((n) => (
              <button
                key={n.id}
                className={tab === n.id && !seller ? "is-active" : ""}
                onClick={() => changeTab(n.id)}
              >
                <Mark name={n.icon} />
                {n.label}
              </button>
            ))}
          </div>
          <div className="gm-header-actions">
            <button
              className="gm-balance-pill"
              onClick={() => changeTab("wallet")}
              aria-label={`Wallet balance ${formatGems(balance)} gems`}
            >
              <img src="/assets/9be6d.svg" alt="" />
              Wallet · <Count value={balance} />
            </button>
          </div>
        </div>
      </header>
      <main className="gm-main">
        <div className="gm-topline">
          <button className="gm-back-link" onClick={() => onExit("wardrobe")}>
            <Mark name="back" />
            My wardrobe
          </button>
          <button className="gm-back-link" onClick={() => changeTab("chain")}>
            <Mark name="chain" />
            Resale story
          </button>
          <button className="gm-rules-link" onClick={() => setRules(true)}>
            <Mark name="help" />
            How gems work
          </button>
          <button
            className="gm-icon-button gm-mode"
            onClick={() => setDark(!dark)}
            aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
          >
            <Mark name={dark ? "sun" : "moon"} />
          </button>
        </div>
        {listingOpen ? (
          <ListingForm
            initial={seller || listingDraft}
            onCancel={() => {
              localStorage.removeItem("reuse-listing-draft-v1")
              setListingOpen(false)
              if (!seller) changeTab("marketplace")
            }}
            onReview={(product) => {
              localStorage.removeItem("reuse-listing-draft-v1")
              setSeller(product)
              setChainStart(product.acquisition)
              setListingOpen(false)
              window.scrollTo(0, 0)
            }}
          />
        ) : sellProduct ? (
          <>
            <button
              className="gm-back-link gm-seller-back"
              onClick={() => setSeller(null)}
            >
              <Mark name="back" />
              Back to store
            </button>
            <div className="gm-page-title">
              <p className="gm-overline">A NEW CHAPTER, NOT A NEW THING</p>
              <h1>
                Pass it on.
                <br className="gm-mobile-break" /> Get a little back.
              </h1>
              <p>
                Give your keeper a next home. Earn gems for keeping it in
                circulation.
              </p>
            </div>
            <div className="gm-sell-layout">
              <section className="gm-panel gm-sell-item">
                <div className="gm-sell-image">
                  <img
                    src={sellProduct.photo || `/assets/${sellProduct.image}`}
                    alt={sellProduct.name}
                  />
                </div>
                <label>
                  Item name
                  <input
                    value={sellProduct.name}
                    readOnly={market.products.some(
                      (p) => p.id === sellProduct.id,
                    )}
                    onChange={(e) =>
                      setSeller({ ...sellProduct, name: e.target.value })
                    }
                    maxLength={60}
                  />
                </label>
                <div className="gm-pair">
                  <span>Original bill price</span>
                  <strong>₹{formatCost(sellProduct.cost)}</strong>
                </div>
                <div className="gm-pair">
                  <span>Product age</span>
                  <strong>{sellProduct.age} days</strong>
                </div>
                {sellProduct.purchaseDate && (
                  <div className="gm-pair">
                    <span>Purchased on</span>
                    <strong>
                      {new Date(
                        `${sellProduct.purchaseDate}T12:00:00`,
                      ).toLocaleDateString("en-IN")}
                    </strong>
                  </div>
                )}
                {!market.products.some(
                  (product) => product.id === sellProduct.id,
                ) && (
                  <button
                    className="gm-back-link"
                    onClick={() => setListingOpen(true)}
                  >
                    Edit purchase details
                    <Mark name="arrow" />
                  </button>
                )}
                <div className="gm-pair">
                  <span>Your acquisition value</span>
                  <strong>
                    <Mark name="gem" />
                    {formatGems(selling.acquisition)}
                  </strong>
                </div>
                <p className="gm-small">
                  For a first listing, acquisition equals the calculated Listing
                  Value. For a resale, it’s exactly what you paid in gems.
                </p>
                {sellProduct.bill && (
                  <span className="gm-file">
                    <Mark name="receipt" />
                    Bill attached: {sellProduct.bill}
                  </span>
                )}
              </section>
              <section className="gm-panel gm-sale-breakdown">
                <span className="gm-eyebrow">YOUR SALE BREAKDOWN</span>
                <h2>
                  Good for them.
                  <br />
                  Rewarding for you.
                </h2>
                <div className="gm-breakdown-row">
                  <span>
                    Buyer pays<small>90% of acquisition value</small>
                  </span>
                  <strong>
                    {formatGems(selling.price)} <small>gems</small>
                  </strong>
                </div>
                <div className="gm-breakdown-row gm-bonus-row">
                  <span>
                    <Mark name="swap" />
                    Sale bonus<small>Bonuses are reserved for swaps</small>
                  </span>
                  <strong>
                    +0 <small>gems</small>
                  </strong>
                </div>
                <div className="gm-payout">
                  <span>You receive</span>
                  <strong>
                    <Mark name="gem" />
                    <Count value={selling.price} />
                  </strong>
                  <span>gems in your wallet</span>
                </div>
                <div className="gm-net-line">
                  You paid {formatGems(selling.acquisition)}, you earn{" "}
                  {formatGems(selling.price)} from this gem sale.
                  <strong>Swap instead to earn a bonus</strong>
                </div>
                {sellProduct.status === "listed" ? (
                  <>
                    <div className="gm-listed">
                      <Mark name="check" />
                      Listed · waiting for its next owner
                    </div>
                    <button
                      className="gm-btn gm-btn-primary"
                      onClick={settleSale}
                    >
                      <Mark name="swap" />
                      Complete demo sale
                    </button>
                    <p className="gm-small gm-center">
                      Simulates Maya buying your item. Credits sale proceeds
                      without a bonus, then transfers ownership.
                    </p>
                  </>
                ) : (
                  <button
                    className="gm-btn gm-btn-primary"
                    disabled={
                      !sellProduct.name.trim() || selling.acquisition === 0n
                    }
                    onClick={listForSale}
                  >
                    List for sale
                    <Mark name="arrow" />
                  </button>
                )}
                <p className="gm-small gm-center">
                  No real payments. All gems in this prototype are simulated.
                </p>
              </section>
            </div>
          </>
        ) : tab === "marketplace" ? (
          <>
            <div className="gm-page-title">
              <p className="gm-overline">GOOD FINDS. BETTER SECOND CHAPTERS.</p>
              <h1>
                Not new.
                <br className="gm-mobile-break" />
                <span> New to you.</span>
              </h1>
              <p>Find a keeper, spend your gems, keep the story going.</p>
            </div>
            <div className="gm-market-toolbar">
              <div className="gm-tabs">
                {["All items", "Under 100 gems", "My items"].map((f) => (
                  <button
                    className={filter === f ? "is-active" : ""}
                    key={f}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <button
                className="gm-btn gm-btn-primary gm-btn-compact"
                onClick={openListing}
              >
                <Mark name="plus" />
                List an item
              </button>
            </div>
            <div className="gm-market-info">
              <Mark name="gem" />
              <span>
                Gem buys include a <strong>10% buyer discount.</strong>{" "}
                The <strong>15% bonus is only for accepted swaps.</strong>
              </span>
              <span>{shownProducts.length} keepers</span>
            </div>
            <div className="gm-products">
              {shownProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  balance={balance}
                  onBuy={() => setBuying(product)}
                  onSwap={() => {
                    setSwapping(product)
                    setSwapItemId("")
                  }}
                  onSell={() => setSeller(product)}
                />
              ))}
            </div>
            {!shownProducts.length && (
              <div className="gm-empty">
                <Mark name="shop" />
                <h2>Your next chapter is waiting.</h2>
                <p>Buy a keeper or list an item you already own.</p>
                <button className="gm-btn gm-btn-primary" onClick={openListing}>
                  List an item
                  <Mark name="arrow" />
                </button>
              </div>
            )}
          </>
        ) : tab === "offers" ? (
          <>
            <div className="gm-page-title">
              <p className="gm-overline">TWO KEEPERS. TWO NEW CHAPTERS.</p>
              <h1>
                Swap offers.
                <br />
                <span>Better than another buy.</span>
              </h1>
              <p>
                Review proposals for your listings and track the swaps you’ve
                sent.
              </p>
            </div>
            <div className="gm-market-info">
              <Mark name="swap" />
              <span>
                Accepted swaps earn you a <strong>15% platform bonus</strong>{" "}
                based on the item you pass on. Gem sales do not earn a bonus.
              </span>
              <span>
                {
                  market.offers.filter(
                    (offer) =>
                      offer.recipient === "You" && offer.status === "pending",
                  ).length
                }{" "}
                awaiting you
              </span>
            </div>
            <div className="gm-offers">
              {market.offers.map((offer) => {
                const offered = market.products.find(
                  (product) => product.id === offer.offeredProductId,
                )
                const requested = market.products.find(
                  (product) => product.id === offer.requestedProductId,
                )
                if (!offered || !requested) return null
                const incoming = offer.recipient === "You"
                return (
                  <article className="gm-panel gm-offer" key={offer.id}>
                    <div className="gm-offer-heading">
                      <span
                        className={`gm-chip ${incoming ? "gm-mint" : "gm-purple"}`}
                      >
                        {incoming ? "INCOMING" : "SENT"}
                      </span>
                      <span className={`gm-offer-status is-${offer.status}`}>
                        {offer.status}
                      </span>
                    </div>
                    <div className="gm-offer-items">
                      <div>
                        <img
                          src={offered.photo || `/assets/${offered.image}`}
                          alt={offered.name}
                        />
                        <small>{offer.proposer} offers</small>
                        <strong>{offered.name}</strong>
                      </div>
                      <Mark name="swap" />
                      <div>
                        <img
                          src={requested.photo || `/assets/${requested.image}`}
                          alt={requested.name}
                        />
                        <small>For {requested.owner}’s</small>
                        <strong>{requested.name}</strong>
                      </div>
                    </div>
                    {incoming && offer.status === "pending" && (
                      <>
                        <p className="gm-small">
                          Accepting swaps ownership and adds{" "}
                          {formatGems(
                            swapBonus(BigInt(requested.acquisition)),
                          )}{" "}
                          bonus gems to your wallet.
                        </p>
                        <div className="gm-offer-actions">
                          <button
                            className="gm-btn gm-btn-primary"
                            onClick={() => respond(offer, true)}
                          >
                            Accept swap
                            <Mark name="check" />
                          </button>
                          <button
                            className="gm-btn gm-btn-soft"
                            onClick={() => respond(offer, false)}
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    )}
                    {!incoming && offer.status === "pending" && (
                      <p className="gm-small">
                        Waiting for {offer.recipient} to accept or reject.
                      </p>
                    )}
                  </article>
                )
              })}
            </div>
            {!market.offers.length && (
              <div className="gm-empty">
                <Mark name="swap" />
                <h2>No swap offers yet.</h2>
                <p>Propose a swap from any Store listing.</p>
                <button
                  className="gm-btn gm-btn-primary"
                  onClick={() => changeTab("marketplace")}
                >
                  Browse keepers
                  <Mark name="arrow" />
                </button>
              </div>
            )}
          </>
        ) : tab === "chain" ? (
          <>
            <div className="gm-page-title">
              <p className="gm-overline">ONE ITEM. MANY GOOD STORIES.</p>
              <h1>
                Follow the gems.
                <br />
                <span>See the ripple effect.</span>
              </h1>
              <p>
                Simulate each gem resale. Lower prices for buyers.
                <br className="gm-mobile-break" /> Swap instead when you want
                the platform reward.
              </p>
            </div>
            <section className="gm-panel gm-chain-controls">
              <div>
                <label htmlFor="chain-start">Starting Listing Value</label>
                <div className="gm-input-wrap">
                  <Mark name="gem" />
                  <input
                    id="chain-start"
                    value={chainStart}
                    onChange={(e) => setChainStart(e.target.value)}
                    onBlur={() => {
                      if (!startInput.error && chainStart)
                        setChainStart(formatGems(startInput.value))
                    }}
                    inputMode="numeric"
                    placeholder="Enter a gem value"
                    aria-invalid={!!startInput.error}
                  />
                  <span>gems</span>
                </div>
                {startInput.error && (
                  <p className="gm-error">{startInput.error}</p>
                )}
                {!startInput.value && !startInput.error && (
                  <p className="gm-field-hint">
                    Enter a starting value to simulate its journey.
                  </p>
                )}
              </div>
              <div>
                <label>Number of resales</label>
                <div className="gm-stepper">
                  <button
                    aria-label="Fewer resales"
                    disabled={steps === 1}
                    onClick={() => setSteps((s) => s - 1)}
                  >
                    <Mark name="minus" />
                  </button>
                  <output aria-label="Number of resales">
                    {steps}
                    <small>/ 10</small>
                  </output>
                  <button
                    aria-label="More resales"
                    disabled={steps === 10}
                    onClick={() => setSteps((s) => s + 1)}
                  >
                    <Mark name="plus" />
                  </button>
                </div>
              </div>
              <button
                className="gm-back-link"
                onClick={() => setChainStart(String(listing))}
              >
                Use latest item value
                <Mark name="arrow" />
              </button>
            </section>
            <PriceChart rows={chain} />
            <section className="gm-panel gm-chain-table">
              <div className="gm-section-head">
                <h2>Every handoff, broken down.</h2>
                <span className="gm-chip gm-purple">
                  {steps} {steps === 1 ? "resale" : "resales"}
                </span>
              </div>
              <div
                className="gm-table-scroll"
                tabIndex={0}
                aria-label="Resale chain breakdown"
              >
                <table>
                  <thead>
                    <tr>
                      <th>Sale</th>
                      <th>Seller → Buyer</th>
                      <th>Acquisition</th>
                      <th>Buyer pays</th>
                      <th>Bonus</th>
                      <th>Seller payout</th>
                      <th>Net gain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chain.map((row) => (
                      <tr key={row.step}>
                        <td>
                          <span className="gm-sale-index">
                            {String(row.step).padStart(2, "0")}
                          </span>
                        </td>
                        <td>
                          <span className="gm-person">{row.seller}</span>
                          <span className="gm-table-arrow">→</span>
                          <span className="gm-person">{row.buyer}</span>
                        </td>
                        <td>{formatGems(row.acquisition)}</td>
                        <td className="gm-price-cell">
                          {formatGems(row.price)}
                        </td>
                        <td className="gm-gold-text">
                          +{formatGems(row.bonus)}
                        </td>
                        <td className="gm-bold">{formatGems(row.payout)}</td>
                        <td className="gm-green-text">
                          +{formatGems(row.net)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="gm-small">
                All figures are in gems, independently rounded half up. Each
                buyer’s payment becomes their acquisition value. Minimum sale
                price: 1 gem for a positive acquisition.
              </p>
            </section>
            <div className="gm-chain-summary">
              <div className="gm-panel">
                <span>
                  <Mark name="gem" />
                  Gem-sale bonuses
                </span>
                <strong className="gm-gold-text">
                  <Count value={totalBonus} />
                  <small>gems issued</small>
                </strong>
                <p>Extra value across {steps} new chapters.</p>
              </div>
              <div className="gm-panel">
                <span>
                  <Mark name="swap" />
                  Final sale price
                </span>
                <strong>
                  <Count value={chain.at(-1)?.price || 0n} />
                  <small>gems</small>
                </strong>
                <p>What the last buyer pays after {steps} resales.</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="gm-page-title">
              <p className="gm-overline">YOUR CIRCULAR LITTLE ECONOMY</p>
              <h1>
                Good choices.
                <br />
                <span>Real gem energy.</span>
              </h1>
              <p>
                Your proceeds, rewards, and next possibilities. All in one
                place.
              </p>
            </div>
            <div className="gm-wallet-layout">
              <div>
                <section
                  className={`gm-wallet-card ${sparkle ? "gm-sparkle" : ""}`}
                >
                  <div className="gm-section-head">
                    <span>YOUR GEM BALANCE</span>
                    <Mark name="wallet" />
                  </div>
                  <div className="gm-wallet-number">
                    <Mark name="gem" />
                    <Count value={balance} />
                  </div>
                  <p>gems ready for their next chapter</p>
                  <div className="gm-wallet-bonus">
                    <Mark name="gem" />
                    <span>
                      <strong>{formatGems(bonuses)} bonus gems</strong> earned
                      so far
                    </span>
                  </div>
                  <button
                    className="gm-btn"
                    onClick={() => changeTab("marketplace")}
                  >
                    Find your next keeper
                    <Mark name="arrow" />
                  </button>
                  {sparkle && (
                    <div className="gm-bonus-sparkles" aria-hidden="true">
                      {[0, 1, 2, 3, 4, 5].map((n) => (
                        <span key={n}>
                          <Mark name="gem" />
                        </span>
                      ))}
                    </div>
                  )}
                </section>
                <div className="gm-wallet-note">
                  <Mark name="help" />
                  <p>
                    Bonuses are credited only when a swap is accepted, never
                    for a gem sale or listing. This is a local demo wallet; gems
                    have no cash value.
                  </p>
                </div>
              </div>
              <section className="gm-panel gm-history">
                <div className="gm-section-head">
                  <h2>Your gem trail</h2>
                  <span className="gm-chip gm-purple">
                    {market.transactions.length} transactions
                  </span>
                </div>
                {market.transactions.map((t) => (
                  <div className="gm-transaction" key={t.id}>
                    <span
                      className={`gm-transaction-icon ${
                        t.kind === "sale" ? "gm-mint" : "gm-purple"
                      }`}
                    >
                      <Mark
                        name={
                          t.kind === "buy"
                            ? "shop"
                            : t.kind === "sale" || t.kind === "swap"
                              ? "swap"
                              : "gem"
                        }
                      />
                    </span>
                    <div>
                      <h3>{t.name}</h3>
                      <p>
                        {new Date(t.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        ·{" "}
                        {t.kind === "sale"
                          ? "Sale proceeds"
                          : t.kind === "buy"
                            ? "Gem purchase"
                            : t.kind === "swap"
                              ? "Accepted swap bonus"
                              : "Prototype credit"}
                      </p>
                      {BigInt(t.bonus) > 0n && (
                        <span className="gm-bonus-chip">
                          +{formatGems(t.bonus)} platform bonus
                        </span>
                      )}
                      {t.receipt && (
                        <button
                          className="purchase-view-savings"
                          aria-label={`View savings for ${t.receipt.product.name}`}
                          onClick={() => showPurchase(t.id)}
                        >
                          View savings &amp; receipt ↗
                        </button>
                      )}
                    </div>
                    <strong className={t.kind === "buy" ? "" : "gm-green-text"}>
                      {t.kind === "buy" ? "−" : "+"}
                      {formatGems(t.amount)}
                      <small>
                        {t.kind === "swap"
                          ? " swap bonus"
                          : ` gems${BigInt(t.bonus) > 0n ? " + bonus" : ""}`}
                      </small>
                    </strong>
                  </div>
                ))}
              </section>
            </div>
          </>
        )}
        <footer className="gm-footer">
          <span>
            <Mark name="gem" />
            Keep good things going.
          </span>
          <div>
            <span>Demo gems. Real calculations.</span>
            <button className="gm-back-link" onClick={() => setRules(true)}>
              The fine print
              <Mark name="arrow" />
            </button>
          </div>
        </footer>
        {dev && (
          <section className="gm-dev-panel">
            <div className="gm-section-head">
              <h2>Test cases</h2>
              <button className="gm-back-link" onClick={() => setDev(false)}>
                Hide panel
              </button>
            </div>
            <p className="gm-small">
              Live checks against the same functions used by listing and wallet.
              Toggle with Alt+T or ?dev=1.
            </p>
            {gemChecks().map((c) => (
              <p key={c.name} className={c.pass ? "gm-green-text" : "gm-error"}>
                {c.pass ? "PASS" : "FAIL"} · {c.name}
              </p>
            ))}
          </section>
        )}
      </main>
      {!listingOpen && (
        <nav
          className="bottom-nav reuse-market-nav"
          aria-label="Main navigation"
        >
          <button onClick={() => onExit("wardrobe")}>
            <span>
              <img src="/assets/4ecec.svg" alt="" />
            </span>
            Wardrobe
          </button>
          <button
            className={tab === "marketplace" ? "active" : ""}
            aria-current={tab === "marketplace" ? "page" : undefined}
            onClick={() => changeTab("marketplace")}
          >
            <span>
              <img src="/assets/67f09.svg" alt="" />
            </span>
            Store
          </button>
          <button onClick={() => onExit("circles")}>
            <span>
              <img src="/assets/81de1.svg" alt="" />
            </span>
            Circles
          </button>
        </nav>
      )}
      {notice && (
        <div
          className={`gm-toast ${sparkle ? "gm-toast-bonus" : ""}`}
          role="status"
        >
          <Mark name={sparkle ? "gem" : "check"} />
          {notice}
        </div>
      )}
      {buying && (
        <Sheet title="Your next keeper" onClose={() => setBuying(null)}>
          <div className="gm-buy-preview">
            <img
              src={buying.photo || `/assets/${buying.image}`}
              alt={buying.name}
            />
            <h3>{buying.name}</h3>
            <p className="gm-muted">From {buying.owner}’s wardrobe to yours.</p>
          </div>
          <div className="gm-pair">
            <span>You pay</span>
            <strong>
              {formatGems(saleValues(BigInt(buying.acquisition)).price)} gems
            </strong>
          </div>
          <div className="gm-pair">
            <span>Your balance after purchase</span>
            <strong>
              {formatGems(
                balance - saleValues(BigInt(buying.acquisition)).price,
              )}{" "}
              gems
            </strong>
          </div>
          <div className="gm-tip">
            <Mark name="swap" />
            <p>
              This gem purchase does not create a bonus. Propose a swap instead
              to reward keeping both items in circulation.
            </p>
          </div>
          <button
            className="gm-btn gm-btn-primary"
            disabled={
              buying.owner === "You" ||
              balance < saleValues(BigInt(buying.acquisition)).price
            }
            onClick={purchase}
          >
            Confirm gem purchase
            <Mark name="arrow" />
          </button>
          <p className="gm-small gm-center">
            Simulated purchase. No real payment is made.
          </p>
        </Sheet>
      )}
      {swapping && (
        <Sheet title="Propose a swap" onClose={() => setSwapping(null)}>
          <div className="gm-buy-preview">
            <img
              src={swapping.photo || `/assets/${swapping.image}`}
              alt={swapping.name}
            />
            <h3>{swapping.name}</h3>
            <p className="gm-muted">
              Choose one of your keepers to offer {swapping.owner}.
            </p>
          </div>
          {swapInventory.length ? (
            <div className="gm-swap-picker">
              {swapInventory.map((product) => (
                <button
                  className={swapItemId === product.id ? "is-selected" : ""}
                  aria-pressed={swapItemId === product.id}
                  key={product.id}
                  onClick={() => setSwapItemId(product.id)}
                >
                  <img
                    src={product.photo || `/assets/${product.image}`}
                    alt=""
                  />
                  <span>
                    <strong>{product.name}</strong>
                    <small>
                      {formatGems(
                        swapBonus(BigInt(product.acquisition)),
                      )}{" "}
                      bonus gems if accepted
                    </small>
                  </span>
                  {swapItemId === product.id && <Mark name="check" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="gm-tip">
              <Mark name="help" />
              <p>Add or buy a keeper first, then return to propose a swap.</p>
            </div>
          )}
          <button
            className="gm-btn gm-btn-primary"
            disabled={!swapItemId}
            onClick={sendSwapProposal}
          >
            Send swap proposal
            <Mark name="swap" />
          </button>
          <p className="gm-small gm-center">
            No gems are exchanged. Bonuses are added only after acceptance.
          </p>
        </Sheet>
      )}
      {rules && (
        <Sheet
          title="A fairer kind of value."
          onClose={() => setRules(false)}
          wide
        >
          <p className="gm-muted gm-rules-intro">
            A transparent little system for keeping things in circulation.
            Here’s exactly how your gems add up.
          </p>
          <section className="gm-rules-section">
            <span className="gm-number-step">01</span>
            <h3>From your bill to base gems</h3>
            <code>floor(cost ÷ 500) × 50 + 50</code>
            <p>
              Cost is the original purchase price in rupees. No maximum. An
              empty or zero price gives 0 gems.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Original cost</th>
                  <th>Base gems</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { min: 1n, max: 49999n, label: "₹0.01–499.99", value: "50" },
                  {
                    min: 50000n,
                    max: 99999n,
                    label: "₹500–999.99",
                    value: "100",
                  },
                  {
                    min: 100000n,
                    max: 149999n,
                    label: "₹1,000–1,499.99",
                    value: "150",
                  },
                  {
                    min: 250000n,
                    max: 299999n,
                    label: "₹2,500–2,999.99",
                    value: "300",
                  },
                  {
                    min: 10000000n,
                    max: 10049999n,
                    label: "₹1,00,000–1,00,499.99",
                    value: "10,050",
                  },
                ].map((r) => (
                  <tr
                    className={
                      costInput.value >= r.min && costInput.value <= r.max
                        ? "gm-rule-match"
                        : ""
                    }
                    key={r.label}
                  >
                    <td>{r.label}</td>
                    <td>{r.value}</td>
                  </tr>
                ))}
                {valid &&
                  ![0n, 50000n, 100000n, 250000n, 10000000n].includes(
                    (costInput.value / 50000n) * 50000n,
                  ) && (
                    <tr className="gm-rule-match">
                      <td>Your input: ₹{formatCost(cost)}</td>
                      <td>{formatGems(calculated.base)}</td>
                    </tr>
                  )}
              </tbody>
            </table>
          </section>
          <section className="gm-rules-section">
            <span className="gm-number-step">02</span>
            <h3>A little age. Plenty of value.</h3>
            <p>Listing Value = round(Base Gems × age retention).</p>
            <table>
              <thead>
                <tr>
                  <th>Product age</th>
                  <th>Value retained</th>
                </tr>
              </thead>
              <tbody>
                {ageBrackets.map((b) => (
                  <tr
                    key={b.min}
                    className={
                      source && b.min === calculated.bracket.min
                        ? "gm-rule-match"
                        : ""
                    }
                  >
                    <td>{b.label}</td>
                    <td>
                      <span className={`gm-chip gm-${b.tone}`}>
                        {b.percent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="gm-rules-section">
            <span className="gm-number-step">03</span>
            <h3>Swapping gets the reward</h3>
            <ul>
              <li>
                Gem buyers pay <strong>90% of acquisition value.</strong>
              </li>
              <li>
                Gem sales receive <strong>no platform bonus.</strong>
              </li>
              <li>
                An accepted swap adds a{" "}
                <strong>15% bonus for the item you pass on.</strong>
              </li>
              <li>
                The next owner’s acquisition value is exactly what they paid.
              </li>
              <li>
                Every figure is rounded independently, half up. A positive
                acquisition has a minimum sale price of 1 gem.
              </li>
            </ul>
            <div className="gm-shirt-example">
              <h3>The 1,000-gem shirt</h3>
              {resaleChain(1000n, 3).map((s) => (
                <div key={s.step}>
                  <span>
                    Sale {s.step} · {s.seller} → {s.buyer}
                  </span>
                  <p>
                    Acquired for {formatGems(s.acquisition)}. Buyer pays{" "}
                    <strong>{formatGems(s.price)}</strong>. Seller gets{" "}
                    <strong>
                      {formatGems(s.price)} + {formatGems(s.bonus)} bonus ={" "}
                      {formatGems(s.payout)}.
                    </strong>{" "}
                    Net +{formatGems(s.net)}.
                  </p>
                </div>
              ))}
            </div>
            <p className="gm-small">
              Swap bonuses are issued by the platform, not charged to either
              person. Gem sales do not receive this bonus. This is a prototype
              of the rules, not a claim that rewards are financially
              self-funding.
            </p>
          </section>
          <button
            className="gm-btn gm-btn-primary"
            onClick={() => setRules(false)}
          >
            Makes gem sense
            <Mark name="check" />
          </button>
        </Sheet>
      )}
    </div>
  )
}
