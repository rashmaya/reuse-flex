import test from "node:test"
import assert from "node:assert/strict"
import {
  listingValue,
  retention,
  resaleChain,
  saleValues,
  readCost,
  readWhole,
  formatCost,
  initialMarket,
  buyProduct,
  completeSale,
  gemChecks,
  ageFromPurchaseDate,
} from "../src/gems.ts"

for (const check of gemChecks())
  test(check.name, () => assert.equal(check.pass, true))
test("all retention boundaries", () => {
  for (const [age, percent] of [
    [0, 100],
    [30, 100],
    [31, 90],
    [90, 90],
    [91, 75],
    [180, 75],
    [181, 60],
    [365, 60],
    [366, 40],
    [730, 40],
    [731, 25],
  ])
    assert.equal(retention(age).percent, percent)
})
test("empty and zero cost are zero, very large costs have no cap", () => {
  assert.equal(listingValue("", 0).listing, 0n)
  assert.equal(listingValue("0", 0).base, 0n)
  assert.equal(
    listingValue("1000000000000000000000", 0).base,
    100000000000000000050n,
  )
  assert.equal(listingValue("499.99", 0).base, 50n)
  assert.equal(formatCost("1000000"), "10,00,000")
})
test("invalid input is rejected", () => {
  for (const value of ["-1", "abc", "1.234", "1e5"])
    assert.ok(readCost(value).error)
  assert.ok(readWhole("1.5").error)
  assert.throws(() => retention(-1))
  assert.throws(() => saleValues(-1n))
})
test("purchase dates produce calendar-day age and reject future or invalid dates", () => {
  assert.equal(ageFromPurchaseDate("2026-07-02", "2026-08-01").days, 30)
  assert.equal(ageFromPurchaseDate("2026-07-01", "2026-08-01").days, 31)
  assert.equal(ageFromPurchaseDate("2026-08-01", "2026-08-01").days, 0)
  assert.equal(ageFromPurchaseDate("", "2026-08-01").complete, false)
  assert.ok(ageFromPurchaseDate("2026-08-02", "2026-08-01").error)
  assert.ok(ageFromPurchaseDate("2026-02-30", "2026-08-01").error)
  assert.equal(ageFromPurchaseDate("2024-02-28", "2024-03-01").days, 2)
})
test("resale acquisition always equals previous rounded price", () => {
  const chain = resaleChain(1000n, 3)
  assert.deepEqual(
    chain.map((s) => s.price),
    [900n, 810n, 729n],
  )
  assert.equal(chain[2].payout, 851n)
  assert.equal(
    chain.reduce((a, s) => a + s.bonus, 0n),
    407n,
  )
  assert.equal(resaleChain(1n, 10)[9].price, 1n)
})
test("wallet blocks own listing and insufficient funds", () => {
  const state = initialMarket()
  assert.throws(() => buyProduct(state, "sample-2"), /own listing/)
  assert.throws(() => buyProduct(state, "sample-4"), /more gems/)
  assert.equal(state.balance, "1240")
})
test("buy, list, sell cycle applies buyer acquisition and seller reward once", () => {
  const bought = buyProduct(initialMarket(), "sample-0")
  assert.equal(bought.balance, "1195")
  assert.equal(bought.products[0].acquisition, "45")
  assert.equal(bought.transactions[0].receipt.gemsPaid, "45")
  assert.equal(
    bought.transactions[0].receipt.impact.originalPricePaise,
    "49900",
  )
  assert.equal(bought.transactions[0].receipt.impact.avoidedKg, 27)
  assert.equal(bought.transactions[0].id, bought.transactions[0].receipt.id)
  assert.throws(() => completeSale(bought, "sample-0"))
  const listed = {
    ...bought,
    products: bought.products.map((p) =>
      p.id === "sample-0" ? { ...p, status: "listed" } : p,
    ),
  }
  const sold = completeSale(listed, "sample-0")
  assert.equal(sold.balance, "1243") // rounded 40.5 → 41 proceeds + 7 bonus
  assert.equal(sold.transactions[0].amount, "41")
  assert.equal(sold.transactions[0].bonus, "7")
  assert.equal(sold.products[0].acquisition, "41")
  assert.throws(() => completeSale(sold, "sample-0"))
})
