import { describe, expect, it } from "vitest";
import { comparePassword, hashPassword } from "./auth.service";

describe("password hashing consistency", () => {
  it("hashPassword + comparePassword accept the same plaintext", async () => {
    const password = "Password1!";
    const hash = await hashPassword(password);

    expect(await comparePassword(password, hash)).toBe(true);
    expect(await comparePassword("Password1", hash)).toBe(false);
  });

  it("produces distinct salts across calls", async () => {
    const a = await hashPassword("Password1!");
    const b = await hashPassword("Password1!");

    expect(a).not.toBe(b);
    expect(await comparePassword("Password1!", a)).toBe(true);
    expect(await comparePassword("Password1!", b)).toBe(true);
  });
});
