import { lazy, Suspense, useEffect, useRef, useState } from "react"
import type { FormEvent } from "react"
import { formatGems, initialMarket } from "./gems"
import type { GemProduct, MarketState } from "./gems"

const GemMarketplace = lazy(() => import("./GemMarketplace"))

const asset = (name: string) => `/assets/${name}`
const icons = {
  arrow: "e5e97.svg",
  back: "3fff3.svg",
  close: "595da.svg",
  plus: "316ff.svg",
  add: "fadaa.svg",
  quickPlus: "91b73.svg",
  smallPlus: "1da94.svg",
  care: "a9745.svg",
  wrench: "9fe74.svg",
  wallet: "9be6d.svg",
  repair: "e8951.svg",
  gem: "24c44.svg",
  shirt: "4ecec.svg",
  repeat: "67f09.svg",
  users: "81de1.svg",
  share: "0740d.svg",
  camera: "54498.svg",
  sparkles: "e2776.svg",
  flag: "96754.svg",
}
function Icon({ name }: { name: keyof typeof icons }) {
  return <img className="icon" src={asset(icons[name])} alt="" />
}
type LifeEvent = {
  type: "wear" | "repair"
  date: string
  note: string
}
type Item = {
  id: string
  name: string
  category: string
  image: string
  date: string
  wears: number
  repairs: number
  age: string
  events: LifeEvent[]
  photo?: string
}
type SmallItemProps = {
  item: Item
  index: number
}
const sampleItems: Item[] = [
  {
    id: "denim",
    name: "Everyday denim",
    category: "Jackets",
    image: "c5bb2.png",
    date: "2022-06",
    wears: 42,
    repairs: 2,
    age: "4Y 4M",
    events: [
      {
        type: "wear",
        date: "2026-10-15",
        note: "The usual favourite. From campus days to late-night chai.",
      },
      {
        type: "repair",
        date: "2026-09-12",
        note: "A new button. Same jacket.",
      },
      {
        type: "repair",
        date: "2024-08-08",
        note: "Cuff patched, character added.",
      },
    ],
  },
  {
    id: "tee",
    name: "Gig tee",
    category: "Tops",
    image: "774f0.png",
    date: "2024-05",
    wears: 28,
    repairs: 0,
    age: "2Y",
    events: [],
  },
  {
    id: "kurta",
    name: "Festive kurta",
    category: "Tops",
    image: "84f2e.png",
    date: "2023-08",
    wears: 12,
    repairs: 0,
    age: "3Y",
    events: [],
  },
  {
    id: "sneakers",
    name: "Everyday sneakers",
    category: "Shoes",
    image: "20ca5.png",
    date: "2023-08",
    wears: 86,
    repairs: 1,
    age: "3Y 2M",
    events: [],
  },
  {
    id: "headphones",
    name: "Study-session headphones",
    category: "Electronics",
    image: "6690f.png",
    date: "2022-09",
    wears: 240,
    repairs: 1,
    age: "4Y 1M",
    events: [],
  },
  {
    id: "sandals",
    name: "Campus sandals",
    category: "Shoes",
    image: "27e37.png",
    date: "2024-05",
    wears: 54,
    repairs: 0,
    age: "2Y",
    events: [],
  },
  {
    id: "juttis",
    name: "Fest-night juttis",
    category: "Shoes",
    image: "4faaf.png",
    date: "2022-05",
    wears: 18,
    repairs: 0,
    age: "4Y",
    events: [],
  },
  {
    id: "laptop",
    name: "Campus laptop",
    category: "Electronics",
    image: "be307.png",
    date: "2021-05",
    wears: 420,
    repairs: 1,
    age: "5Y",
    events: [],
  },
  {
    id: "speaker",
    name: "Chai-time speaker",
    category: "Electronics",
    image: "e7b8c.png",
    date: "2023-05",
    wears: 95,
    repairs: 0,
    age: "3Y",
    events: [],
  },
  {
    id: "classic-watch",
    name: "Dad’s classic watch",
    category: "Watches",
    image: "27d34.png",
    date: "2018-04",
    wears: 128,
    repairs: 3,
    age: "8Y 6M",
    events: [],
  },
  {
    id: "digital-watch",
    name: "Everyday digital",
    category: "Watches",
    image: "f0f83.png",
    date: "2022-04",
    wears: 210,
    repairs: 0,
    age: "4Y",
    events: [],
  },
  {
    id: "silver-watch",
    name: "Silver dial",
    category: "Watches",
    image: "fc7b7.png",
    date: "2023-04",
    wears: 32,
    repairs: 0,
    age: "3Y",
    events: [],
  },
  {
    id: "jhumkas",
    name: "Mum’s silver jhumkas",
    category: "Jewellery",
    image: "d3e00.png",
    date: "2020-06",
    wears: 48,
    repairs: 3,
    age: "6Y 4M",
    events: [],
  },
  {
    id: "hoops",
    name: "Everyday hoops",
    category: "Jewellery",
    image: "7ba77.png",
    date: "2023-04",
    wears: 72,
    repairs: 0,
    age: "3Y",
    events: [],
  },
  {
    id: "chain",
    name: "Silver chain",
    category: "Jewellery",
    image: "d49c4.png",
    date: "2024-04",
    wears: 36,
    repairs: 0,
    age: "2Y",
    events: [],
  },
  {
    id: "dining-table",
    name: "Family dining table",
    category: "Furniture",
    image: "8a647.png",
    photo:
      "https://images.unsplash.com/photo-1698770531036-c627d35188f2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1080",
    date: "2019-03",
    wears: 860,
    repairs: 2,
    age: "7Y",
    events: [],
  },
  {
    id: "reading-chair",
    name: "Reading corner chair",
    category: "Furniture",
    image: "8a647.png",
    photo:
      "https://images.unsplash.com/photo-1769255119622-1bd8e49ff35c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1080",
    date: "2021-08",
    wears: 340,
    repairs: 1,
    age: "4Y 8M",
    events: [],
  },
  {
    id: "stroller",
    name: "City stroller",
    category: "Furniture",
    image: "8a647.png",
    photo:
      "https://images.unsplash.com/photo-1560609783-dac174f45b33?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1080",
    date: "2023-02",
    wears: 186,
    repairs: 2,
    age: "3Y",
    events: [],
  },
  {
    id: "baby-toys",
    name: "Baby’s first toy box",
    category: "Games",
    image: "8a647.png",
    photo:
      "https://images.unsplash.com/photo-1696563541384-bf48ecbaac45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    date: "2022-11",
    wears: 124,
    repairs: 3,
    age: "3Y 5M",
    events: [],
  },
  {
    id: "sports-kit",
    name: "Weekend sports kit",
    category: "Games",
    image: "8a647.png",
    photo:
      "https://images.unsplash.com/photo-1632755898125-36cd72575dde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    date: "2021-06",
    wears: 96,
    repairs: 2,
    age: "4Y 10M",
    events: [],
  },
  {
    id: "card-games",
    name: "Sunday card games",
    category: "Games",
    image: "8a647.png",
    photo:
      "https://images.unsplash.com/photo-1541278107931-e006523892df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    date: "2020-12",
    wears: 78,
    repairs: 1,
    age: "5Y 4M",
    events: [],
  },
]
const categoryDetails: Record<string, {
  subtitle: string
  unit: string
  badge: string
  gems: number
  milestone: number
  story: string
  care: string
  store: string
}> = {
  Shoes: {
    subtitle: "Same pair. More places.",
    unit: "pairs",
    badge: "MOST WORN",
    gems: 100,
    milestone: 100,
    story: "Those sneakers have more stories in them.",
    care: "Sole restitched in September. Same sneakers, next chapter.",
    store: "One occasion? Borrow the pair.",
  },
  Jewellery: {
    subtitle: "Old favourites. Still your signature.",
    unit: "pieces",
    badge: "FAMILY FAVOURITE",
    gems: 160,
    milestone: 50,
    story: "Mum’s jhumkas. Now part of your story.",
    care: "Polished in October. A little care, a lot more shine.",
    store: "Big celebration. Borrow the sparkle.",
  },
  Electronics: {
    subtitle: "Still switched on. Still a flex.",
    unit: "devices",
    badge: "DAILY SIDEKICK",
    gems: 120,
    milestone: 250,
    story: "Same headphones. A whole new playlist.",
    care: "Ear pads replaced in August. The playlist goes on.",
    store: "Need a projector for one night?",
  },
  Watches: {
    subtitle: "Good times. Same timepiece.",
    unit: "watches",
    badge: "OLDEST KEEPER",
    gems: 200,
    milestone: 150,
    story: "Dad’s classic. Your everyday companion.",
    care: "Battery changed in July. Still right on time.",
    store: "Dress up without a new timepiece.",
  },
  Furniture: {
    subtitle: "Built for more homes, meals, naps and growing years.",
    unit: "pieces",
    badge: "FAMILY ANCHOR",
    gems: 260,
    milestone: 1000,
    story: "That table has held hundreds of meals and still has room for more.",
    care: "Joints tightened and surface refreshed. Strong enough for another chapter.",
    store: "Outgrown the stroller? Swap it into another family.",
  },
  Games: {
    subtitle: "More play. Fewer things gathering dust.",
    unit: "playthings",
    badge: "PLAYED, NOT PACKED",
    gems: 140,
    milestone: 150,
    story: "The best games get better when more people join in.",
    care: "Pieces checked, cleaned and kept together for the next game.",
    store: "Swap toy boxes, sports kits and card games nearby.",
  },
}
const usageCategory = (category: string) =>
  ["Electronics", "Furniture", "Games"].includes(category)
const usageNoun = (category: string) =>
  category === "Games" ? "plays" : usageCategory(category) ? "uses" : "wears"
function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}
const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
function Logo({ welcome = false }: { welcome?: boolean }) {
  return (
    <div className={`logo ${welcome ? "logo-welcome" : ""}`}>
      <img src={asset(welcome ? "8e8dd.svg" : "bd04f.svg")} alt="Reuse Flex" />
    </div>
  )
}
function App() {
  const [showGems, setShowGems] = useState(
    () => location.hash === "#gems" || location.hash.startsWith("#purchase/"),
  )
  const [marketTab, setMarketTab] =
    useState<"marketplace" | "wallet" | "chain">("marketplace")
  const [createListing, setCreateListing] = useState(false)
  const [items, setItems] = useState<Item[]>(() => {
    const saved = load<Item[]>("reuse-flex-items-v1", sampleItems)
    const refreshed = saved.map((item) => {
      const sample = sampleItems.find(
        (candidate) =>
          candidate.id === item.id && candidate.category === "Furniture",
      )
      return sample?.photo ? { ...item, photo: sample.photo } : item
    })
    return [
      ...refreshed,
      ...sampleItems.filter(
        (item) =>
          !refreshed.some((existing) => existing.id === item.id) &&
          ["Watches", "Jewellery", "Furniture", "Games"].includes(
            item.category,
          ),
      ),
    ]
  })
  const [started, setStarted] = useState(true)
  const [page, setPage] = useState("wardrobe")
  const [adding, setAdding] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState("Clothing")
  const [all, setAll] = useState(false)
  const [repair, setRepair] = useState<Item | null>(null)
  const [toast, setToast] = useState("")
  const [storeFilter, setStoreFilter] = useState("All")
  const [request, setRequest] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [wallet, setWallet] = useState(false)
  const [name, setName] = useState("Everyday denim")
  const [category, setCategory] = useState("Jackets")
  const [since, setSince] = useState("2022-06")
  const [photo, setPhoto] = useState("")
  const [saveCount, setSaveCount] = useState(0)
  const upload = useRef<HTMLInputElement>(null)
  useEffect(() => {
    localStorage.setItem("reuse-flex-items-v1", JSON.stringify(items))
  }, [items])
  useEffect(() => {
    localStorage.setItem("reuse-flex-started", JSON.stringify(started))
  }, [started])
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3200)
      return () => clearTimeout(t)
    }
  }, [toast])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page, selected, adding, started])
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRepair(null)
        setRequest(null)
        setWallet(false)
      }
    }
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [])
  const active = items.find((i) => i.id === selected)
  const clothing = items.filter(
    (i) =>
      ![
        "Shoes",
        "Electronics",
        "Watches",
        "Jewellery",
        "Furniture",
        "Games",
      ].includes(i.category),
  )
  const rotation =
    filter === "Clothing"
      ? clothing
      : items.filter((i) => i.category === filter)
  const hero = rotation[0]
  const categoryInfo = categoryDetails[filter]
  const gemWallet = load<MarketState>("reuse-gem-market-v1", initialMarket())
  function openMarket(
    list = false,
    tab: "marketplace" | "wallet" | "chain" = "marketplace",
  ) {
    setMarketTab(tab)
    setCreateListing(list)
    setShowGems(true)
    location.hash = "gems"
    window.scrollTo(0, 0)
  }
  function navigate(next: string) {
    if (next === "store") {
      openMarket()
      return
    }
    setPage(next)
    setSelected(null)
    setAll(false)
  }
  function beginAdd(initial = false) {
    if (!initial) {
      openMarket(true)
      return
    }
    setOnboarding(initial)
    setAdding(true)
    setName(initial ? "Everyday denim" : "")
    setCategory("Jackets")
    setSince("2022-06")
    setPhoto("")
  }
  function finish() {
    setStarted(true)
    setAdding(false)
    setOnboarding(false)
    setFilter("Clothing")
  }
  function wear(item: Item) {
    const event: LifeEvent = {
      type: "wear",
      date: new Date().toISOString().slice(0, 10),
      note: "Another day. Still a favourite.",
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, wears: i.wears + 1, events: [event, ...i.events] }
          : i,
      ),
    )
    setToast(
      `${item.name}: ${item.wears + 1} ${usageNoun(item.category)}. Keep it going.`,
    )
  }
  function saveItem(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) return
    const addToStore =
      ((e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)
        ?.value === "store"
    const existing =
      onboarding && saveCount === 0 && name.trim() === "Everyday denim"
    const id = existing ? "denim" : `keeper-${Date.now()}`
    const image =
      category === "Shoes"
        ? "20ca5.png"
        : category === "Electronics"
          ? "6690f.png"
          : "8a647.png"
    const years = Math.max(
      0,
      new Date().getFullYear() - Number(since.slice(0, 4)),
    )
    if (existing)
      setItems((prev) =>
        prev.map((i) =>
          i.id === "denim"
            ? {
                ...i,
                name: name.trim(),
                category,
                date: since,
                ...(photo ? { photo } : {}),
              }
            : i,
        ),
      )
    else
      setItems((prev) => [
        {
          id,
          name: name.trim(),
          category,
          date: since,
          image,
          wears: 0,
          repairs: 0,
          age: `${years}Y`,
          events: [],
          ...(photo ? { photo } : {}),
        },
        ...prev,
      ])
    setSaveCount((c) => c + 1)
    setToast("Favourite saved. A new chapter starts here.")
    if (addToStore) {
      const purchaseDate = `${since}-01`
      const age = Math.max(
        0,
        Math.floor(
          (Date.now() - Date.parse(`${purchaseDate}T00:00:00`)) / 86_400_000,
        ),
      )
      localStorage.setItem(
        "reuse-listing-draft-v1",
        JSON.stringify({
          id,
          name: name.trim(),
          category,
          cost: "",
          age,
          purchaseDate,
          acquisition: "0",
          image,
          photo,
          owner: "You",
          status: "owned",
        } satisfies GemProduct),
      )
      setStarted(true)
      setAdding(false)
      setOnboarding(false)
      openMarket(true)
      return
    }
    if (onboarding && saveCount < 2) {
      setName("")
      setPhoto("")
    } else {
      finish()
      setSelected(id)
    }
  }
  function saveRepair(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!repair) return
    const form = new FormData(e.currentTarget)
    const event: LifeEvent = {
      type: "repair",
      date: String(form.get("date")),
      note: String(form.get("note")).trim(),
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === repair.id
          ? { ...i, repairs: i.repairs + 1, events: [event, ...i.events] }
          : i,
      ),
    )
    setRepair(null)
    setToast("Repair logged. Same favourite, next chapter.")
  }
  async function share(item: Item) {
    const text = `${item.name}: ${item.wears} wears, ${item.repairs} repairs. Kept, not new. #ReuseFlex`
    try {
      if (navigator.share)
        await navigator.share({ title: "The life of a favourite", text })
      else {
        await navigator.clipboard.writeText(text)
        setToast("Your keeper story is copied. Share the flex.")
      }
    } catch {
      setToast(text)
    }
  }
  function Actions({ item }: { item: Item }) {
    return (
      <div className="actions">
        <button className="button lime" onClick={() => wear(item)}>
          <Icon name={active ? "plus" : "quickPlus"} />
          {item.category === "Games"
            ? "Played today"
            : usageCategory(item.category)
              ? "Used it today"
              : "Wore it today"}
        </button>
        <button className="button subtle" onClick={() => setRepair(item)}>
          <Icon
            name={
              item.category === "Jewellery"
                ? "care"
                : [
                    "Shoes",
                    "Electronics",
                    "Watches",
                    "Furniture",
                    "Games",
                  ].includes(item.category)
                  ? "wrench"
                  : "repair"
            }
          />
          {active
            ? "Log a repair"
            : item.category === "Jewellery"
              ? "Log care"
              : item.category === "Watches"
                ? "Serviced"
                : item.category === "Furniture"
                  ? "Maintained"
                  : item.category === "Games"
                    ? "Fixed a piece"
                : "Repaired"}
        </button>
      </div>
    )
  }
  function SmallItem({ item, index }: SmallItemProps) {
    return (
      <article className="small-item">
        <button
          className={`small-photo ${
            categoryDetails[item.category] ? "category-photo" : ""
          } ${index % 2 ? "pale-lilac" : "sage"}`}
          onClick={() => setSelected(item.id)}
          aria-label={`View ${item.name}`}
        >
          <img src={item.photo || asset(item.image)} alt={item.name} />
        </button>
        <div className="small-info">
          <button className="text-button" onClick={() => setSelected(item.id)}>
            {item.name}
          </button>
          <button
            className="mini-plus"
            aria-label={`Log a wear for ${item.name}`}
            onClick={() => wear(item)}
          >
            <Icon name="smallPlus" />
          </button>
          <p className="muted">
            {item.wears} {usageNoun(item.category)} ·{" "}
            {item.age.toLowerCase()} kept
          </p>
        </div>
      </article>
    )
  }

  if (showGems)
    return (
      <Suspense
        fallback={
          <div className="content" role="status">
            Opening your gem marketplace…
          </div>
        }
      >
        <GemMarketplace
          initialTab={marketTab}
          initialListing={createListing}
          onExit={(destination = "wardrobe") => {
            setShowGems(false)
            setStarted(true)
            setPage(destination)
            setSelected(null)
            setItems((previous) => {
              const state = load<MarketState>(
                "reuse-gem-market-v1",
                initialMarket(),
              )
              const owned = state.products.filter(
                (product) => product.owner === "You",
              )
              const kept = previous.filter(
                (item) =>
                  !state.products.some(
                    (product) =>
                      product.id === item.id && product.owner !== "You",
                  ),
              )
              return [
                ...owned
                  .filter(
                    (product) =>
                      !kept.some(
                        (item) =>
                          item.id === product.id ||
                          item.name.toLowerCase() ===
                            product.name.toLowerCase(),
                      ),
                  )
                  .map((product) => ({
                    id: product.id,
                    name: product.name,
                    category:
                      product.category ||
                      sampleItems.find((item) => item.image === product.image)
                        ?.category ||
                      "Jackets",
                    image: product.image,
                    photo: product.photo,
                    date: (
                      product.purchaseDate ||
                      new Date(
                        Date.now() - product.age * 86400000,
                      ).toISOString()
                    ).slice(0, 7),
                    wears: 0,
                    repairs: 0,
                    age: `${Math.floor(product.age / 365)}Y`,
                    events: [],
                  })),
                ...kept,
              ]
            })
            location.hash = destination
            window.scrollTo(0, 0)
          }}
        />
      </Suspense>
    )

  if (!started && !adding)
    return (
      <div className="welcome">
        <header className="welcome-header">
          <Logo welcome />
          <span className="tag lilac">KEEPER CULTURE</span>
        </header>
        <main className="welcome-grid">
          <section className="welcome-title">
            <p className="eyebrow">LESS NEW. MORE YOU.</p>
            <h1>
              Old is the
              <br />
              new flex.
            </h1>
          </section>
          <section
            className="welcome-art"
            aria-label="Everyday denim, 42 wears and still the one"
          >
            <span className="editorial-number">42</span>
            <p className="art-caption">
              THE EVERYDAY
              <br />
              DENIM / 2022
            </p>
            <img
              className="welcome-jacket"
              src={asset("22120.png")}
              alt="A favourite blue denim jacket"
            />
            <div className="wear-sticker">
              <Icon name="sparkles" />
              42 WEARS. STILL THE ONE.
            </div>
            <span className="art-footer">KEPT, NOT NEW ↗</span>
          </section>
          <section className="welcome-cta">
            <p className="welcome-copy">
              Your favourites have stories.
              <br />
              Make keeping them a status thing.
            </p>
            <div className="journey">
              <span>
                <b>①</b> Add 3–5 favourites
              </span>
              <span>
                <b>②</b> Wear &amp; repair
              </span>
              <span>
                <b>③</b> Flex the story
              </span>
            </div>
            <button className="button dark full" onClick={() => beginAdd(true)}>
              <Icon name="arrow" />
              Build my first wardrobe
            </button>
            <p className="footnote">
              No receipts. No perfect dates. Just your favourites.
            </p>
            <button
              className="text-button explore"
              onClick={() => setStarted(true)}
            >
              Explore the sample wardrobe ↗
            </button>
          </section>
        </main>
      </div>
    )

  return (
    <div className="app">
      <header className="app-header">
        <button
          className="logo-button"
          onClick={() => {
            if (adding) setAdding(false)
            else navigate("wardrobe")
          }}
          aria-label="Reuse Flex home"
        >
          <Logo />
        </button>
        <span className="header-note">AANYA’S ARCHIVE</span>
        <button
          className="wallet tag lime"
          onClick={() => openMarket(false, "wallet")}
        >
          <Icon name="wallet" />
          Wallet · {formatGems(gemWallet.balance)}
        </button>
      </header>
      <main className={`content ${adding ? "setup-content" : ""}`}>
        {adding ? (
          <>
            <div className="page-bar">
              <button
                className="icon-button"
                aria-label="Back"
                onClick={() => setAdding(false)}
              >
                <Icon name="back" />
              </button>
              <span>
                {onboarding ? "Your first 3–5 favourites" : "Add a favourite"}
              </span>
              <button
                className="icon-button"
                aria-label="Close"
                onClick={finish}
              >
                <Icon name="close" />
              </button>
            </div>
            {onboarding && (
              <div className="progress-segments">
                {[0, 1, 2, 3, 4].map((n) => (
                  <span key={n} className={n < saveCount ? "complete" : ""} />
                ))}
              </div>
            )}
            <div className="setup-heading">
              <p className="eyebrow">
                {onboarding
                  ? `ITEM ${saveCount + 1} OF 5 · START WITH YOUR FAVOURITES`
                  : "ANOTHER ONE WORTH KEEPING"}
              </p>
              <h1>Meet your next keeper.</h1>
              <p className="muted">
                Start with what you love wearing. The details can be a little
                fuzzy.
              </p>
            </div>
            <form className="setup-grid" onSubmit={saveItem}>
              <div className="setup-photo pale-lilac">
                <img
                  src={photo || asset("8a647.png")}
                  alt="Your favourite item"
                />
                <span className="tag photo-tag">
                  ✓ {photo ? "PHOTO ADDED" : "SAMPLE PHOTO"}
                </span>
                <button
                  type="button"
                  className="photo-upload icon-button"
                  aria-label="Change item photo"
                  onClick={() => upload.current?.click()}
                >
                  <Icon name="camera" />
                </button>
                <input
                  ref={upload}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    if (f.size > 3_000_000) {
                      setToast("Choose a photo smaller than 3 MB.")
                      return
                    }
                    const reader = new FileReader()
                    reader.onload = () => setPhoto(String(reader.result))
                    reader.readAsDataURL(f)
                  }}
                />
              </div>
              <div className="setup-fields">
                <label>
                  Give it a name
                  <input
                    required
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Everyday denim"
                    autoComplete="off"
                  />
                </label>
                <fieldset>
                  <legend>Category</legend>
                  <div className="chips">
                    {[
                      "Jackets",
                      "Tops",
                      "Bottoms",
                      "Shoes",
                      "Electronics",
                      "Furniture",
                      "Games",
                      "Other",
                    ].map((c) => (
                      <button
                        type="button"
                        className={`chip ${category === c ? "selected" : ""}`}
                        aria-pressed={category === c}
                        key={c}
                        onClick={() => setCategory(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label>
                  When did it come into your life?
                  <input
                    required
                    type="month"
                    value={since}
                    max={new Date().toISOString().slice(0, 7)}
                    onChange={(e) => setSince(e.target.value)}
                  />
                </label>
                <p className="footnote left">
                  A rough month or year is perfect. You can edit it later.
                </p>
                <div className="note sage">
                  <Icon name="gem" />
                  <p>
                    Time kept gives an item its gem value. Buying more isn’t the
                    flex.
                  </p>
                </div>
                <button className="button dark full" type="submit" value="save">
                  <Icon name="arrow" />
                  {onboarding && saveCount < 2
                    ? "Save item & keep going"
                    : "Save my favourite"}
                </button>
                {!onboarding && (
                  <button
                    className="button lime full"
                    type="submit"
                    value="store"
                  >
                    <Icon name="repeat" />
                    Save &amp; add to Store
                  </button>
                )}
                {onboarding && (
                  <button
                    type="button"
                    className="text-button finish"
                    onClick={finish}
                  >
                    Finish with {clothing.length} sample favourites instead
                  </button>
                )}
              </div>
            </form>
          </>
        ) : active ? (
          <>
            <div className="page-bar">
              <button
                className="icon-button"
                aria-label="Back to wardrobe"
                onClick={() => setSelected(null)}
              >
                <Icon name="back" />
              </button>
              <span>The life of a favourite</span>
              <button
                className="icon-button"
                aria-label="Share item story"
                onClick={() => share(active)}
              >
                <img src={asset("b20ef.svg")} alt="" />
              </button>
            </div>
            <div className="detail-grid">
              <div className="detail-art">
                <span className="detail-number">{active.wears}</span>
                <span className="archive-label">
                  YOUR ARCHIVE / {active.date.slice(0, 4)}
                </span>
                <img
                  src={
                    active.photo ||
                    asset(active.id === "denim" ? "3f098.png" : active.image)
                  }
                  alt={active.name}
                />
                <span className="tag age-tag">{active.age} KEPT</span>
              </div>
              <section className="detail-body">
                <div>
                  <h1>{active.name}</h1>
                  <p className="muted">
                    {active.category} · In your life since around{" "}
                    {new Date(`${active.date}-01T12:00:00`).toLocaleDateString(
                      "en",
                      { month: "long", year: "numeric" },
                    )}
                  </p>
                </div>
                <div className="counters">
                  {[
                    [
                      active.wears,
                      usageNoun(active.category),
                    ],
                    [String(active.repairs).padStart(2, "0"), "repairs"],
                    ["00", "pass-ons"],
                  ].map(([n, label]) => (
                    <div key={label}>
                      <strong>{n}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <Actions item={active} />
                <div className="note pale-lilac">
                  <img src={asset("ecc6b.svg")} alt="" />
                  <div>
                    <strong>120 gems · longevity value</strong>
                    <p className="muted">
                      Older keepers grow in value. This item’s value is separate
                      from your 240-gem wallet.
                    </p>
                  </div>
                </div>
                <section className="timeline">
                  <h2>A little wear. A lot of life.</h2>
                  {active.events.map((event, n) => (
                    <div className="life-event" key={`${event.date}-${n}`}>
                      <span className="event-icon">
                        <Icon
                          name={event.type === "wear" ? "shirt" : "repair"}
                        />
                      </span>
                      <div>
                        <p className="event-date">
                          {dateLabel(event.date)} · {event.type.toUpperCase()}
                        </p>
                        <p>{event.note}</p>
                      </div>
                    </div>
                  ))}
                  <div className="life-event">
                    <span className="event-icon">
                      <Icon name="flag" />
                    </span>
                    <div>
                      <p className="event-date">AROUND {active.date}</p>
                      <p>The first chapter.</p>
                      <p className="muted">
                        Added to your life. Still in your rotation.
                      </p>
                    </div>
                  </div>
                </section>
                <div className="repair-near sage">
                  <p className="eyebrow">KEEP IT GOING / REPAIR NEAR YOU</p>
                  <h3>The Local Stitch</h3>
                  <p className="muted">
                    Koramangala · 0.8 km · Open until 8 pm
                    <br />
                    Denim patches from ₹150 · Same-day small fixes
                  </p>
                  <button
                    className="button dark"
                    onClick={() => setRepair(active)}
                  >
                    <Icon name="repair" />
                    Log a repair
                  </button>
                  <span className="footnote left">Sample local service</span>
                </div>
                <button
                  className="button dark full"
                  onClick={() => share(active)}
                >
                  <Icon name="share" />
                  Flex this item's story
                </button>
              </section>
            </div>
          </>
        ) : page === "wardrobe" ? (
          <>
            <div className="title-row">
              <h1>{filter === "Clothing" ? "Good on repeat." : filter}</h1>
              <button
                className="add-button"
                aria-label="List an item"
                onClick={() => beginAdd()}
              >
                <Icon name="add" />
              </button>
            </div>
            {filter !== "Clothing" && (
              <p className="muted subtitle">{categoryInfo?.subtitle}</p>
            )}
            <div
              className="chips wardrobe-filters"
              aria-label="Wardrobe categories"
            >
              {[
                "Clothing",
                "Shoes",
                "Jewellery",
                "Electronics",
                "Watches",
                "Furniture",
                "Games",
              ].map((c) => (
                  <button
                    key={c}
                    className={`chip ${filter === c ? "selected" : ""}`}
                    aria-pressed={filter === c}
                    onClick={() => {
                      setFilter(c)
                      setAll(false)
                    }}
                  >
                    {c}
                  </button>
              ))}
            </div>
            <div className="wardrobe-layout">
              <section className="keeping">
                <div className="keeping-heading">
                  <span>YOUR KEEPING ERA</span>
                  <span>DEMO DATA</span>
                </div>
                <div className="metrics">
                  <div>
                    <strong>{rotation.length}</strong>
                    <span>{categoryInfo?.unit || "items"} kept</span>
                  </div>
                  <div>
                    <strong>
                      {filter === "Clothing"
                        ? 3
                        : rotation.reduce((sum, i) => sum + i.wears, 0)}
                    </strong>
                    <span>
                      {filter === "Clothing"
                        ? "buys skipped"
                        : filter === "Games"
                          ? "plays logged"
                          : usageCategory(filter)
                            ? "uses logged"
                            : "wears logged"}
                    </span>
                  </div>
                  <div>
                    <strong>
                      {filter === "Clothing"
                        ? "8 kg"
                        : rotation.reduce((sum, i) => sum + i.repairs, 0)}
                    </strong>
                    <span>
                      {filter === "Clothing"
                        ? "CO₂e est. saved*"
                        : ["Jewellery", "Watches", "Games"].includes(filter)
                          ? "care logs"
                          : "repairs logged"}
                    </span>
                  </div>
                </div>
                <p>
                  {filter === "Clothing"
                    ? "*Illustrative estimate: 2 rentals/swaps replacing new buys, less local transport. Not a lifecycle calculation."
                    : "Item gems reflect longevity, not your wallet balance."}
                </p>
                <div className="keeping-desktop">
                  <Icon name="sparkles" />
                  <h2>
                    More memories.
                    <br />
                    Not more stuff.
                  </h2>
                  <p>
                    Every wear adds to the story.
                    <br />
                    Your favourites are just getting started.
                  </p>
                </div>
              </section>
              <section className="rotation">
                <div className="section-heading">
                  <h2>Your rotation</h2>
                  <button className="text-button" onClick={() => setAll(!all)}>
                    {all ? "Show less" : `View all ${rotation.length}`} ↗
                  </button>
                </div>
                {hero && (
                  <article className="hero-card">
                    <button
                      className={`hero-art ${
                        filter !== "Clothing" ? "category-art" : ""
                      } ${
                        ["Watches", "Electronics", "Furniture"].includes(filter)
                          ? "three-digit-art"
                          : ""
                      }`}
                      onClick={() => setSelected(hero.id)}
                      aria-label={`View ${hero.name}`}
                    >
                      <span className="hero-number">{hero.wears}</span>
                      <img
                        className="hero-item"
                        src={hero.photo || asset(hero.image)}
                        alt={hero.name}
                      />
                      <div className="hero-tags">
                        <span className="tag">
                          {categoryInfo?.badge || "MOST WORN"}
                        </span>
                        <span className="tag lime">
                          <Icon name="gem" />
                          {categoryInfo?.gems || 120} · ITEM GEMS
                        </span>
                      </div>
                      <span className="kept-label">KEPT FOR {hero.age}</span>
                    </button>
                    <div className="hero-summary">
                      <button
                        className="hero-title"
                        onClick={() => setSelected(hero.id)}
                      >
                        <span>{hero.name}</span>
                        <img src={asset("f9a60.svg")} alt="" />
                      </button>
                      <p className="muted">
                        {hero.wears}{" "}
                        {usageNoun(hero.category)} ·{" "}
                        {filter === "Watches"
                          ? `1 strap fix · ${Math.max(0, hero.repairs - 1)} services`
                          : filter === "Jewellery"
                            ? `1 clasp fix · ${Math.max(0, hero.repairs - 1)} polishes`
                            : filter === "Furniture"
                              ? `${hero.repairs} maintenance logs · 0 pass-ons`
                              : filter === "Games"
                                ? `${hero.repairs} piece fixes · 0 pass-ons`
                                : `${hero.repairs} repairs · 0 pass-ons`}
                      </p>
                      <Actions item={hero} />
                    </div>
                  </article>
                )}
                <div className="small-grid">
                  {rotation.slice(1, all ? undefined : 3).map((item, i) => (
                    <SmallItem item={item} index={i} key={item.id} />
                  ))}
                </div>
                {filter !== "Clothing" && hero && (
                  <div className="milestone pale-lilac">
                    <div className="note">
                      <img src={asset("e6624.svg")} alt="" />
                      <div>
                        <strong>
                          {Math.max(
                            0,
                            (categoryInfo?.milestone || 100) - hero.wears,
                          )}{" "}
                          {filter === "Watches"
                            ? "wears to 150 shared moments."
                            : filter === "Jewellery"
                              ? "wears to a 50-wear favourite."
                              : filter === "Electronics"
                                ? "uses to the 250-use club."
                                : filter === "Furniture"
                                  ? "uses to a thousand shared moments."
                                  : filter === "Games"
                                    ? "plays to the 150-play club."
                                    : "wears to the 100-wear club."}
                        </strong>
                        <p className="muted">{categoryInfo?.story}</p>
                      </div>
                    </div>
                    <progress
                      value={hero.wears}
                      max={categoryInfo?.milestone || 100}
                    />
                    <div className="milestone-footer">
                      <span>
                        {hero.wears} / {categoryInfo?.milestone || 100}{" "}
                        {filter === "Watches"
                          ? "classic watch wears"
                          : filter === "Jewellery"
                            ? "jhumka wears"
                            : filter === "Electronics"
                              ? "headphone uses"
                              : filter === "Furniture"
                                ? "family uses"
                                : filter === "Games"
                                  ? "game plays"
                                  : "sneaker wears"}
                      </span>
                      <button
                        className="text-button"
                        onClick={() => share(hero)}
                      >
                        Flex the story ↗
                      </button>
                    </div>
                  </div>
                )}
                {filter !== "Clothing" && hero && (
                  <>
                    <div className="category-care">
                      <img
                        src={asset(
                          filter === "Jewellery" ? "2f4b7.svg" : "0ef4c.svg",
                        )}
                        alt=""
                      />
                      <p className="muted">{categoryInfo?.care}</p>
                      <button
                        className="text-button"
                        onClick={() => setRepair(hero)}
                      >
                        Find care ↗
                      </button>
                    </div>
                    <button
                      className="category-store sage"
                      onClick={() => navigate("store")}
                    >
                      <Icon name="repeat" />
                      <span>
                        <strong>{categoryInfo?.store}</strong>
                        <span className="muted">Borrow or swap in Store ↗</span>
                      </span>
                    </button>
                  </>
                )}
                <button
                  className={`circle-note pale-lilac ${
                    filter !== "Clothing" ? "category-circle" : ""
                  }`}
                  onClick={() => navigate("circles")}
                >
                  <Icon name="users" />
                  <span>
                    <strong>Your circle is keeping it going.</strong>
                    <span className="muted">
                      Rohan hit 100 wears. Give him some love ↗
                    </span>
                  </span>
                </button>
              </section>
            </div>
          </>
        ) : page === "store" ? (
          <>
            <p className="eyebrow breadcrumb">REUSE FLEX / THE STORE</p>
            <h1>
              New plans.
              <br />
              Not new stuff.
            </h1>
            <p className="muted subtitle">
              Borrow the look. Keep the memories. Find a substitute for your
              next new buy.
            </p>
            <div className="store-controls">
              <div className="location-label">College fest · Bengaluru</div>
              <div className="chips">
                {["All", "Swap", "Rent", "Borrow"].map((f) => (
                  <button
                    className={`chip ${storeFilter === f ? "selected" : ""}`}
                    key={f}
                    onClick={() => setStoreFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="note lime">
              <div>
                <strong>240 wallet gems to put back into circulation.</strong>
                <p className="muted">
                  Keeping milestones earn wallet gems. Demo amounts, not a fixed
                  reward formula.
                </p>
              </div>
            </div>
            <div className="market-grid">
              {[
                {
                  name: "Fest-night kurta",
                  image: "45e45.png",
                  type: "Rent",
                  person: "Ishaan · 1.2 km · Size M",
                  gems: 90,
                  note: "3 days · Return after your occasion",
                  footer: "A FEST, NOT A NEW BUY",
                },
                {
                  name: "Varsity, next chapter",
                  image: "c5c83.png",
                  type: "Swap",
                  person: "Meera · 2.1 km · Size L",
                  gems: 60,
                  note: "Offer a keeper · Owner approval",
                  footer: "READY FOR A NEW CIRCLE",
                },
                {
                  name: "The presentation pair",
                  image: "c7615.png",
                  type: "Borrow",
                  person: "Rohan · Your circle · Size 30",
                  gems: 40,
                  note: "2 days · Clean & return",
                  footer: "BIG DAY. SMALL FOOTPRINT.",
                },
              ]
                .filter((i) => storeFilter === "All" || i.type === storeFilter)
                .map((i) => (
                  <article className="market-card" key={i.name}>
                    <img src={asset(i.image)} alt={i.name} />
                    <div>
                      <p className="eyebrow">
                        {i.type.toUpperCase()} / LOCAL PICKUP
                      </p>
                      <h3>{i.name}</h3>
                      <p className="muted">{i.person}</p>
                      <p>{i.note}</p>
                      <div className="market-bottom">
                        <strong>
                          <Icon name="gem" />
                          {i.gems} <small>wallet gems</small>
                        </strong>
                        <button
                          className="round lime"
                          aria-label={`Request ${i.name}`}
                          onClick={() => setRequest(i.name)}
                        >
                          ↗
                        </button>
                      </div>
                    </div>
                    <footer>{i.footer}</footer>
                  </article>
                ))}
            </div>
            <div className="note sage">
              <Icon name="repeat" />
              <p>
                One occasion. One less new buy.
                <br />
                <small className="muted">
                  Sample listings. No real payments or exchanges.
                </small>
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow breadcrumb">CIRCLES / FAMILY REUSE</p>
            <h1>
              Outgrown.
              <br />
              Not outdone.
            </h1>
            <p className="muted subtitle">
              Little phases. Longer lives for good things. Pass them on to a
              family around the corner.
            </p>
            <div className="family-card">
              <div className="section-heading">
                <h2>The Family Circle</h2>
                <Icon name="users" />
              </div>
              <p>HSR Layout, Bengaluru · Within 3 km</p>
              <div className="family-people">
                <span>AN</span>
                <span>RS</span>
                <span>MS</span>
                <strong>129 neighbours</strong>
                <span className="joined">✓ Joined</span>
              </div>
              <p className="footnote left">
                Verified member profiles · Local pickup · Circle rules
              </p>
            </div>
            <div className="note pale-lilac">
              <Icon name="users" />
              <div>
                <strong>Rohan hit the 100-wear club.</strong>
                <p className="muted">
                  Same sneakers. A hundred different days.
                </p>
              </div>
              <button
                className="chip"
                onClick={() => setLiked(!liked)}
                aria-pressed={liked}
              >
                {liked ? "✓ Cheered" : "Give some love"}
              </button>
            </div>
            <div className="section-heading">
              <h2>Ready for another family</h2>
              <span className="muted">Nearest ↙</span>
            </div>
            <div className="market-grid">
              {[
                {
                  name: "More little adventures",
                  image: "f8d9c.png",
                  type: "BORROW / STROLLERS",
                  person: "Ananya · 0.8 km · ID verified",
                  note: "Good · Grows with the family",
                  price: "Free · 7 days",
                },
                {
                  name: "A new kind of play",
                  image: "e5085.png",
                  type: "EXCHANGE / CHILDREN’S TOYS",
                  person: "Rohan · 1.2 km · ID verified",
                  note: "Good · All 24 blocks included",
                  price: "Swap for a puzzle",
                },
                {
                  name: "Room to grow",
                  image: "6b795.png",
                  type: "RESELL / FURNITURE",
                  person: "Meera · 1.8 km · ID verified",
                  note: "Fair · Surface scratches shown",
                  price: "1,800 gems · The set",
                },
                {
                  name: "For the next beginning",
                  image: "66d59.png",
                  type: "DONATE / CRADLES",
                  person: "Neha · 2.0 km · ID verified",
                  note: "Good · Light marks on legs",
                  price: "Free · Local pickup",
                },
              ].map((i) => (
                <article className="market-card family-listing" key={i.name}>
                  <img src={asset(i.image)} alt={i.name} />
                  <div>
                    <p className="eyebrow">{i.type}</p>
                    <h3>{i.name}</h3>
                    <p className="muted">{i.person}</p>
                    <p>{i.note}</p>
                    <div className="market-bottom">
                      <strong>{i.price}</strong>
                      <button
                        className="round lime"
                        aria-label={`View ${i.name}`}
                        onClick={() => setRequest(i.name)}
                      >
                        ↗
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
      {!adding && (
        <nav className="bottom-nav" aria-label="Main navigation">
          {(["wardrobe", "store", "circles"] as const).map((p, i) => (
            <button
              key={p}
              className={page === p ? "active" : ""}
              aria-current={page === p ? "page" : undefined}
              onClick={() => navigate(p)}
            >
              <span>
                <Icon name={(["shirt", "repeat", "users"] as const)[i]} />
              </span>
              {p[0].toUpperCase() + p.slice(1)}
            </button>
          ))}
        </nav>
      )}
      {toast && (
        <div className="toast" role="status">
          ✓ {toast}
        </div>
      )}
      {repair && (
        <div className="modal-backdrop" onClick={() => setRepair(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="repair-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-heading">
              <span className="tag lilac">KEEP THE STORY GOING</span>
              <button
                className="icon-button"
                aria-label="Close repair form"
                onClick={() => setRepair(null)}
                autoFocus
              >
                <Icon name="close" />
              </button>
            </div>
            <h2 id="repair-title">A little fix. A lot more life.</h2>
            <p className="muted">{repair.name}</p>
            <form onSubmit={saveRepair}>
              <label>
                What did you repair?
                <textarea
                  name="note"
                  required
                  maxLength={250}
                  placeholder="A new button, a patched cuff, a fresh sole…"
                />
              </label>
              <label>
                Repair date
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </label>
              <button className="button dark full" type="submit">
                <Icon name="repair" />
                Save repair
              </button>
              <button
                className="text-button finish"
                type="button"
                onClick={() => setRepair(null)}
              >
                Cancel
              </button>
            </form>
          </section>
        </div>
      )}
      {(request || wallet) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setRequest(null)
            setWallet(false)
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="section-heading">
              <span className="tag lime">
                <Icon name="gem" />
                {wallet ? "YOUR WALLET" : "YOUR NEXT REUSE STORY"}
              </span>
              <button
                className="icon-button"
                aria-label="Close"
                autoFocus
                onClick={() => {
                  setRequest(null)
                  setWallet(false)
                }}
              >
                <Icon name="close" />
              </button>
            </div>
            <h2 id="info-title">
              {wallet ? "240 gems. More possibility." : request}
            </h2>
            <p className="muted">
              {wallet
                ? "Wallet gems can be used for swaps, rentals and borrowing. Item gems celebrate how long you keep your favourites — they are not a spendable balance."
                : "This is a sample listing. You can try requesting it; no gems will be charged and no real exchange will be made."}
            </p>
            <button
              className="button dark full"
              onClick={() => {
                setToast(
                  wallet
                    ? "Keep wearing. Keep repairing. Keep the story going."
                    : "Demo request sent. Your gems haven’t been charged.",
                )
                setRequest(null)
                setWallet(false)
              }}
            >
              {wallet ? "Got it" : "Send demo request"}
              <Icon name="arrow" />
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
export default App
