// The supplied design uses this illustrative scenario, not a measured product footprint.
export const demoCarbonScenario = { newProductKg: 30, reuseKg: 3 } as const

export function estimateReuseImpact(
  originalPricePaise: bigint,
  newProductKg: number = demoCarbonScenario.newProductKg,
  reuseKg: number = demoCarbonScenario.reuseKg,
) {
  if (
    ![newProductKg, reuseKg].every(
      (value) => Number.isFinite(value) && value >= 0,
    )
  )
    throw new RangeError(
      "Carbon assumptions must be finite, non-negative numbers.",
    )
  if (originalPricePaise < 0n)
    throw new RangeError("Original price cannot be negative.")
  return {
    originalPricePaise: String(originalPricePaise),
    newProductKg,
    reuseKg,
    avoidedKg: Math.round(Math.max(0, newProductKg - reuseKg) * 100) / 100,
    model: "illustrative-demo-v1",
  }
}

export type PurchaseReceipt = {
  id: string
  date: string
  product: {
    id: string
    name: string
    cost: string
    image: string
    photo?: string
  }
  gemsPaid: string
  impact: ReturnType<typeof estimateReuseImpact>
}

export function formatOriginalAmount(paise: string) {
  const amount = BigInt(paise)
  const whole = (amount / 100n).toLocaleString("en-IN")
  const fraction = amount % 100n
  return `₹${whole}${fraction ? `.${String(fraction).padStart(2, "0")}` : ""}`
}
