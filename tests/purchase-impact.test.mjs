import test from "node:test"
import assert from "node:assert/strict"
import {
  estimateReuseImpact,
  formatOriginalAmount,
} from "../src/purchase-impact.ts"
import { buyProduct, completeSale, initialMarket } from "../src/gems.ts"

test("reference demo carbon saving is 30 minus 3 = 27 kg", () => {
  const impact = estimateReuseImpact(450000n)
  assert.equal(impact.originalPricePaise, "450000")
  assert.equal(impact.avoidedKg, 27)
  assert.equal(impact.model, "illustrative-demo-v1")
})
test("cash reference never subtracts gems or invents a rupee conversion", () => {
  const bought = buyProduct(initialMarket(), "sample-0")
  const receipt = bought.transactions[0].receipt
  assert.equal(formatOriginalAmount(receipt.impact.originalPricePaise), "₹499")
  assert.equal(receipt.gemsPaid, "45")
  assert.equal(bought.balance, "1195")
})
test("currency preserves paise and Indian grouping without a value cap", () => {
  assert.equal(formatOriginalAmount("49999"), "₹499.99")
  assert.equal(formatOriginalAmount("10000000"), "₹1,00,000")
  assert.equal(formatOriginalAmount("100000000"), "₹10,00,000")
  assert.equal(
    formatOriginalAmount("100000000000000000000000"),
    "₹1,00,00,00,00,00,00,00,00,00,000",
  )
})
test("carbon estimates never go negative and reject invalid assumptions", () => {
  assert.equal(estimateReuseImpact(0n, 2, 3).avoidedKg, 0)
  assert.equal(estimateReuseImpact(0n, 3.25, 1.5).avoidedKg, 1.75)
  assert.throws(() => estimateReuseImpact(1n, NaN, 1))
  assert.throws(() => estimateReuseImpact(1n, 30, -1))
  assert.throws(() => estimateReuseImpact(-1n))
})
test("purchase receipt is an immutable snapshot retained through resale and reload", () => {
  const original = initialMarket()
  const bought = buyProduct(original, "sample-0")
  const receipt = bought.transactions[0].receipt
  const listed = {
    ...bought,
    products: bought.products.map((p) =>
      p.id === "sample-0" ? { ...p, status: "listed" } : p,
    ),
  }
  const sold = completeSale(listed, "sample-0")
  const reloaded = JSON.parse(JSON.stringify(sold))
  assert.deepEqual(
    reloaded.transactions.find((t) => t.kind === "buy").receipt,
    receipt,
  )
  assert.equal(receipt.product.name, "The everyday tee")
  assert.equal(original.products[0].owner, "Rohan")
  assert.throws(() => buyProduct(bought, "sample-0"), /not available/)
  assert.equal(bought.transactions.length, original.transactions.length + 1)
})
