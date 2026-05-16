import { describe, expect, it } from "vitest";
import { recordPaymentSchema } from "./operations";

describe("recordPaymentSchema", () => {
  it("accepts a valid payment payload", () => {
    const result = recordPaymentSchema.safeParse({
      utr: "UTR123456",
      amount: 25_000,
      paymentDate: "2026-05-01",
    });

    expect(result.success).toBe(true);
  });

  it("rejects UTR values that are too short or contain invalid characters", () => {
    expect(recordPaymentSchema.safeParse({
      utr: "UTR1",
      amount: 100,
      paymentDate: "2026-05-01",
    }).success).toBe(false);

    expect(recordPaymentSchema.safeParse({
      utr: "UTR-12345",
      amount: 100,
      paymentDate: "2026-05-01",
    }).success).toBe(false);
  });

  it("rejects non-positive payment amounts", () => {
    expect(recordPaymentSchema.safeParse({
      utr: "UTR123456",
      amount: 0,
      paymentDate: "2026-05-01",
    }).success).toBe(false);

    expect(recordPaymentSchema.safeParse({
      utr: "UTR123456",
      amount: -500,
      paymentDate: "2026-05-01",
    }).success).toBe(false);
  });

  it("rejects missing or unparsable payment dates", () => {
    expect(recordPaymentSchema.safeParse({
      utr: "UTR123456",
      amount: 100,
      paymentDate: "",
    }).success).toBe(false);

    expect(recordPaymentSchema.safeParse({
      utr: "UTR123456",
      amount: 100,
      paymentDate: "not-a-date",
    }).success).toBe(false);
  });
});
