import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("la landing responde", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.ok()).toBeTruthy();
  });
});
