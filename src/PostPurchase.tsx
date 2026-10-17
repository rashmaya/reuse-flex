import { useState } from "react"
import { formatGems } from "./gems"
import { formatOriginalAmount } from "./purchase-impact"
import type { PurchaseReceipt } from "./purchase-impact"
import "./post-purchase.css"

type PostPurchaseProps = {
  receipt: PurchaseReceipt
  onWardrobe: () => void
  onStore: () => void
  onReceipt: () => void
}

export default function PostPurchase({
  receipt,
  onWardrobe,
  onStore,
  onReceipt,
}: PostPurchaseProps) {
  const [shareMessage, setShareMessage] = useState("")
  const { product, impact } = receipt
  const original = formatOriginalAmount(impact.originalPricePaise)
  const gems = formatGems(receipt.gemsPaid)
  const date = new Date(receipt.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  async function share() {
    const text = `${product.name}: a new chapter, not a new buy. Original purchase value ${original}; paid ${gems} gems. Estimated footprint avoided: ${impact.avoidedKg} kg CO₂e (${impact.newProductKg} − ${impact.reuseKg}). Illustrative demo scenario, not measured or verified impact. #ReuseFlex`
    try {
      if (navigator.share) {
        await navigator.share({ title: "Little steps. Big reuse.", text })
        setShareMessage("Your reuse story is ready to inspire another keeper.")
      } else {
        await navigator.clipboard.writeText(text)
        setShareMessage(
          "Reuse story copied. The estimate disclaimer is included.",
        )
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError")
        setShareMessage(
          "Sharing isn’t available right now. Your savings are still saved in wallet history.",
        )
    }
  }
  return (
    <div className="post-purchase">
      <header className="purchase-brand">
        <img src="/assets/8e8dd.svg" alt="Reuse Flex" />
        <span className="purchase-demo">ILLUSTRATIVE DEMO</span>
      </header>
      <main className="purchase-layout">
        <section className="purchase-intro" aria-labelledby="purchase-title">
          <div className="purchase-success">
            <span>
              <img src="/assets/53e2f.svg" alt="" />
            </span>
            PURCHASE COMPLETE
          </div>
          <h1 id="purchase-title" tabIndex={-1}>
            Little steps.
            <br />
            Big reuse.
          </h1>
          <article className="purchase-recap">
            <div className="purchase-photo">
              <img
                src={product.photo || `/assets/${product.image}`}
                alt={product.name}
              />
            </div>
            <div>
              <h2>{product.name}</h2>
              <p>{date} · Pre-loved purchase</p>
              <strong>Confirmed · {gems} wallet gems paid</strong>
            </div>
          </article>
        </section>
        <section className="purchase-impact" aria-label="Your reuse savings">
          <div className="purchase-outcome">
            <p className="purchase-overline">LESS NEW. MORE POSSIBILITY.</p>
            <div className="purchase-metrics">
              <div>
                <strong className="purchase-money">{original}</strong>
                <span>cash purchase avoided</span>
                <small>
                  {original} original price · paid {gems} gems
                </small>
              </div>
              <div className="purchase-metric-divider" />
              <div>
                <strong className="purchase-carbon">
                  {impact.avoidedKg}
                  <span> kg CO₂e</span>
                </strong>
                <span>est. footprint avoided</span>
                <small>
                  {impact.newProductKg} − {impact.reuseKg} kg CO₂e
                </small>
              </div>
            </div>
            <p className="purchase-estimate-caption">
              Illustrative retail &amp; carbon estimates, not verified impact.
            </p>
          </div>
          <div className="purchase-comparison">
            <h2>Same favourite. A different way.</h2>
            <table className="purchase-table">
              <caption className="sr-only">
                Original purchase reference compared with your pre-loved
                purchase
              </caption>
              <thead>
                <tr>
                  <th>Illustrative comparison</th>
                  <th>BUY NEW</th>
                  <th>REUSE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Value / payment</th>
                  <td>{original}</td>
                  <td>{gems} gems</td>
                </tr>
                <tr>
                  <th scope="row">Est. kg CO₂e</th>
                  <td>{impact.newProductKg}</td>
                  <td>{impact.reuseKg}</td>
                </tr>
              </tbody>
            </table>
            <p>
              Item {gems} gems + fees 0 gems + pickup 0 gems = {gems} wallet
              gems. No cash required.
            </p>
            <p className="purchase-currency-note">
              The rupee amount is the item’s original bill value, not a current
              retail quote. Gems have no fixed rupee conversion.
            </p>
          </div>
          <aside className="purchase-estimate-note">
            <strong>A useful estimate, not a certified claim.</strong>
            <p>
              Assumes a new purchase is replaced: {impact.newProductKg} kg CO₂e
              new-product baseline − {impact.reuseKg} kg local transport &amp;
              cleaning. Generic demo model, not a product-specific lifecycle
              assessment. Not measured; actual impact depends on product,
              transport and reuse.
            </p>
          </aside>
        </section>
        <section className="purchase-actions" aria-label="Next steps">
          <button className="purchase-primary" onClick={onWardrobe}>
            Back to my wardrobe
            <img src="/assets/ace5e.svg" alt="" />
          </button>
          <div className="purchase-secondary">
            <button onClick={onReceipt}>View purchase receipt</button>
            <button onClick={share}>Share my reuse story</button>
          </div>
          <button className="purchase-store-link" onClick={onStore}>
            Keep exploring the Store ↗
          </button>
          {shareMessage && (
            <p className="purchase-share-status" role="status">
              {shareMessage}
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
