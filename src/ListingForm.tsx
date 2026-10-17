import { useRef, useState } from "react"
import type { FormEvent } from "react"
import {
  ageFromPurchaseDate,
  formatCost,
  formatGems,
  listingValue,
  localToday,
  readCost,
  saleValues,
} from "./gems"
import type { GemProduct } from "./gems"

type ListingFormProps = {
  onReview: (product: GemProduct) => void
  onCancel: () => void
  initial?: GemProduct | null
}
const picture = (name: string) => `/assets/${name}`
export default function ListingForm({
  onReview,
  onCancel,
  initial,
}: ListingFormProps) {
  const [name, setName] = useState(initial?.name || "")
  const [category, setCategory] = useState(initial?.category || "Jackets")
  const [price, setPrice] = useState(initial?.cost || "")
  const [date, setDate] = useState(initial?.purchaseDate || "")
  const [photo, setPhoto] = useState(initial?.photo || "")
  const [bill, setBill] = useState(initial?.bill || "")
  const [uploadMenu, setUploadMenu] = useState(false)
  const [fileError, setFileError] = useState("")
  const photoInput = useRef<HTMLInputElement>(null)
  const billInput = useRef<HTMLInputElement>(null)
  const receipt = useRef<File | null>(null)
  const age = ageFromPurchaseDate(date)
  const cost = readCost(price)
  const complete = !cost.error && cost.value > 0n && age.complete
  const value = listingValue(cost.error ? "" : price, age.days)
  const original = complete ? value.listing : 0n
  const sale = saleValues(original)
  const image = initial?.image || "8a647.png"
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !complete) return
    onReview({
      id: initial?.id || crypto.randomUUID(),
      name: name.trim(),
      category,
      cost: price.replace(/,/g, ""),
      age: age.days,
      purchaseDate: date,
      acquisition: String(original),
      image,
      photo,
      bill,
      owner: "You",
      status: "owned",
    })
  }
  return (
    <section className="reuse-listing">
      <div className="page-bar">
        <button
          className="icon-button"
          onClick={onCancel}
          aria-label="Back to store"
        >
          <img src={picture("3fff3.svg")} alt="" />
        </button>
        <span>List a keeper</span>
        <button
          className="icon-button"
          onClick={onCancel}
          aria-label="Close listing"
        >
          <img src={picture("595da.svg")} alt="" />
        </button>
      </div>
      <div className="setup-heading">
        <p className="eyebrow">LESS NEW. MORE POSSIBILITY.</p>
        <h1>
          Meet their
          <br />
          next favourite.
        </h1>
        <p className="muted">
          A few details from you. We’ll work out the gems.
        </p>
      </div>
      <form onSubmit={submit} className="setup-grid">
        <div className="listing-visual">
          <div className="setup-photo pale-lilac">
            <img
              src={photo || picture(image)}
              alt={name || "Denim jacket sample"}
            />
            <span className="tag photo-tag">
              <img src={picture("9f6f9.svg")} alt="" />
              {photo ? "PHOTO ADDED" : "SAMPLE PHOTO"}
            </span>
            <button
              type="button"
              className="photo-upload icon-button"
              aria-label="Upload options"
              aria-expanded={uploadMenu}
              onClick={() => setUploadMenu(!uploadMenu)}
            >
              <img src={picture("54498.svg")} alt="" />
            </button>
          </div>
          {uploadMenu && (
            <div className="listing-upload-menu" aria-label="Upload options">
              <p className="eyebrow">MAKE IT YOURS</p>
              <button
                type="button"
                onClick={() => {
                  setUploadMenu(false)
                  photoInput.current?.click()
                }}
              >
                <img src={picture("54498.svg")} alt="" />
                Choose an item photo
                <span>JPG, PNG or other image · up to 2 MB</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMenu(false)
                  billInput.current?.click()
                }}
              >
                <img src={picture("6f6a3.svg")} alt="" />
                Upload purchase bill
                <span>Optional · image or PDF · up to 10 MB</span>
              </button>
              <button
                className="text-button"
                type="button"
                onClick={() => setUploadMenu(false)}
              >
                Close upload options
              </button>
            </div>
          )}
          <input
            hidden
            type="file"
            ref={photoInput}
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              if (!file.type.startsWith("image/") || file.size > 2_000_000) {
                setFileError("Choose an item photo smaller than 2 MB.")
                return
              }
              const reader = new FileReader()
              reader.onload = () => {
                setPhoto(String(reader.result))
                setFileError("")
              }
              reader.onerror = () =>
                setFileError("We couldn’t read that photo. Please try another.")
              reader.readAsDataURL(file)
            }}
          />
          <input
            hidden
            type="file"
            ref={billInput}
            accept="image/*,.pdf"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              if (
                (!file.type.startsWith("image/") &&
                  file.type !== "application/pdf") ||
                file.size > 10_000_000
              ) {
                setFileError("Choose an image or PDF bill smaller than 10 MB.")
                return
              }
              receipt.current = file
              setBill(file.name)
              setFileError("")
            }}
          />
          {fileError && (
            <p className="gm-error" role="alert">
              {fileError}
            </p>
          )}
          <div className="listing-value-note">
            <img src={picture("bf284.svg")} alt="" />
            <p>
              Your gem value is calculated automatically from the original price
              and purchase date. No extra step needed.
            </p>
          </div>
        </div>
        <div className="setup-fields">
          <label>
            Give it a name
            <input
              required
              value={name}
              maxLength={60}
              placeholder="e.g. Everyday denim"
              onChange={(event) => setName(event.target.value)}
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
                "Jewellery",
                "Electronics",
                "Watches",
                "Furniture",
                "Games",
                "Other",
              ].map((option) => (
                <button
                  type="button"
                  key={option}
                  className={`chip ${category === option ? "selected" : ""}`}
                  aria-pressed={category === option}
                  onClick={() => setCategory(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="listing-price">
            How much did you pay?
            <div className="listing-money">
              <span>₹</span>
              <input
                id="listing-price"
                required
                value={price}
                inputMode="decimal"
                placeholder="Original purchase price"
                onChange={(event) => setPrice(event.target.value)}
                onBlur={() => setPrice(formatCost(price))}
                aria-invalid={!!cost.error}
                aria-describedby="listing-price-hint"
              />
            </div>
          </label>
          <p
            className={cost.error ? "gm-error" : "footnote left"}
            id="listing-price-hint"
          >
            {cost.error ||
              "Use the original amount on your bill, including taxes."}
          </p>
          <label htmlFor="listing-date">
            When did you buy it?
            <input
              id="listing-date"
              required
              type="date"
              max={localToday()}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-invalid={!!age.error}
              aria-describedby="listing-date-hint"
            />
          </label>
          <p
            id="listing-date-hint"
            className={age.error ? "gm-error" : "footnote left"}
          >
            {age.error ||
              (age.complete
                ? `${formatGems(age.days)} days in your life · ${value.bracket.percent}% value retained`
                : "We’ll calculate the item’s age from this date.")}
          </p>
          <div className="listing-receipt">
            <button
              type="button"
              className="text-button"
              onClick={() => billInput.current?.click()}
            >
              <img src={picture(bill ? "9f6f9.svg" : "6f6a3.svg")} alt="" />
              <span>
                {bill || "Upload purchase bill"}
                <small>
                  {bill
                    ? "Bill name saved with the listing"
                    : "Optional · add an image or PDF"}
                </small>
              </span>
              <span>{bill ? "Change" : "+"}</span>
            </button>
            {bill && (
              <button
                className="text-button listing-remove-bill"
                type="button"
                onClick={() => {
                  setBill("")
                  receipt.current = null
                  if (billInput.current) billInput.current.value = ""
                }}
              >
                Remove bill
              </button>
            )}
            <p className="footnote left">
              No automatic scanning. The file stays in this session; enter its
              price above.
            </p>
          </div>
          <div className="listing-auto-value" aria-live="polite">
            <div>
              <span className="eyebrow">YOUR ITEM’S GEM VALUE</span>
              <span className="tag lilac">AUTO-CALCULATED</span>
            </div>
            <strong>
              <img src={picture("bf284.svg")} alt="" />
              {formatGems(original)}
              <small>gems</small>
            </strong>
            <p>
              {complete
                ? `${formatGems(value.base)} base gems × ${value.bracket.percent}% retained`
                : "Add the price and purchase date to see its value."}
            </p>
            {complete && (
              <div className="listing-sale-preview">
                <span>
                  Buyer pays <b>{formatGems(sale.price)}</b>
                </span>
                <span>
                  You receive <b>{formatGems(sale.price)}</b>
                  <small>gem sales do not include a bonus</small>
                </span>
              </div>
            )}
          </div>
          <button
            className="button dark full"
            type="submit"
            disabled={!complete || !name.trim()}
          >
            <img src={picture("e5e97.svg")} alt="" />
            Review my listing
          </button>
          <p className="footnote">
            A next home for your keeper. A little reward for you.
          </p>
        </div>
      </form>
    </section>
  )
}
