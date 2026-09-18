import { expect, test } from "@playwright/test";
import { SITE_URL } from "../../lib/site-url";

const canonicalUrl = SITE_URL;

for (const route of ["/", "/mls"] as const) {
  test(`${route} renders without overflow or broken property images`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator(`[data-audience="${route === "/" ? "branded" : "mls"}"]`)).toBeVisible();
    const images = page.locator("img");
    for (let index = 0; index < await images.count(); index += 1) {
      const image = images.nth(index);
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element) => element instanceof HTMLImageElement ? element.naturalWidth : 0)).toBeGreaterThan(0);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const broken = await images.evaluateAll((loadedImages) => loadedImages.filter((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth === 0).length);
    expect(broken).toBe(0);

    const undersizedGalleryImages = await page.locator(".gallery-item img").evaluateAll((galleryImages) => galleryImages.filter((image) => {
      if (!(image instanceof HTMLImageElement)) return false;
      return image.naturalWidth + 1 < image.getBoundingClientRect().width;
    }).length);
    expect(undersizedGalleryImages).toBe(0);

    const galleryIntersections = await page.locator(".gallery-item").evaluateAll((items) => {
      const rectangles = items.map((item) => item.getBoundingClientRect());
      return rectangles.flatMap((first, firstIndex) => rectangles.slice(firstIndex + 1).filter((second) => {
        const horizontal = Math.min(first.right, second.right) - Math.max(first.left, second.left);
        const vertical = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
        return horizontal > 1 && vertical > 1;
      })).length;
    });
    expect(galleryIntersections).toBe(0);

    const factsFit = await page.locator(".facts-grid").evaluate((grid) => {
      const boundary = grid.getBoundingClientRect();
      return [...grid.children].every((child) => {
        const insideGrid = child.getBoundingClientRect().right <= boundary.right + 1;
        const contentFits = child.scrollWidth <= child.clientWidth + 1;
        return insideGrid && contentFits;
      });
    });
    expect(factsFit).toBe(true);
  });
}

test("MLS route excludes contact capture and branding", async ({ page }) => {
  await page.goto("/mls");
  await expect(page.locator("form")).toHaveCount(0);
  await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator(".brokerage-mark")).toHaveCount(0);
});

test("header calls to action navigate to meaningful mobile content", async ({ page }) => {
  await page.goto("/mls");
  const detailsLink = page.getByRole("link", { name: "Property details" });
  await expect(detailsLink).toHaveAttribute("href", "#overview");

  if ((page.viewportSize()?.width ?? 0) <= 840) {
    const box = await detailsLink.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  await detailsLink.click();
  await expect(page).toHaveURL(/#overview$/);
  const overview = page.locator("#overview");
  await expect(overview).toBeFocused();
  expect(await overview.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("none");

  await page.goto("/");
  const inquiryLink = page.getByRole("link", { name: "Inquire" });
  await expect(inquiryLink).toHaveAttribute("href", "#contact");
  await inquiryLink.click();
  await expect(page).toHaveURL(/#contact$/);
});

test("gallery opens, advances, and closes with the keyboard", async ({ page }) => {
  await page.goto("/");
  const first = page.locator(".gallery-item").first();
  await first.click();
  await expect(page.getByRole("dialog", { name: "Property gallery" })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".lightbox-controls p")).toContainText("2 of");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Property gallery" })).toHaveCount(0);
  await expect(first).toBeFocused();
});

test("public copy contains no staging or internal QA language", async ({ page }) => {
  await page.goto("/");
  const publicCopy = (await page.locator("body").innerText()).toLowerCase();
  for (const internalPhrase of [
    "approved listing photography",
    "verified listing feature",
    "draft for review",
    "source-checked",
    "delivery must be configured",
    "production launch",
  ]) {
    expect(publicCopy).not.toContain(internalPhrase);
  }
  expect(publicCopy).not.toContain("garden rooms");
  await expect(page.locator(".pull-quote")).toHaveCount(0);
  expect(publicCopy).not.toMatch(/[↗↘➜➝➞⟶]/);
});

test("branded route always offers a functional inquiry path", async ({ page }) => {
  await page.goto("/");
  const form = page.locator(".inquiry-form");

  if (await form.count()) {
    await page.route("**/api/inquiry", (route) => route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ receiptId: "11111111-1111-4111-8111-111111111111" }),
    }));
    await form.locator('input[name="name"]').fill("QA Test");
    await form.locator('input[name="email"]').fill("qa@example.com");
    await form.locator('input[name="consent"]').check();
    await form.getByRole("button", { name: "Send inquiry" }).click();
    await expect(form.locator(".form-status")).toContainText("Inquiry received");
  } else {
    await expect(page.locator(".direct-inquiry")).toBeVisible();
    await expect(page.locator('.direct-inquiry a[href^="tel:"]').first()).toBeVisible();
    await expect(page.locator('.direct-inquiry a[href^="mailto:"]').first()).toBeVisible();
  }
});

test("both listing advisors have centered, distinct profiles", async ({ page }) => {
  await page.goto("/");

  const profiles = page.locator(".agent-profile");
  await expect(profiles).toHaveCount(2);
  await expect(page.locator(".agent-profile .agent-monogram")).toHaveText(["SS"]);
  await expect(page.getByRole("img", { name: "Portrait of Andre Wang seated in a living room" })).toBeVisible();

  const alignment = await profiles.evaluateAll((items) => items.map((item) => {
    const profile = item.getBoundingClientRect();
    const portrait = item.querySelector(".agent-portrait")?.getBoundingClientRect();
    if (!portrait) return Number.POSITIVE_INFINITY;
    return Math.abs((profile.left + profile.width / 2) - (portrait.left + portrait.width / 2));
  }));

  expect(alignment.every((offset) => offset <= 1)).toBe(true);
});

test("team feedback refinements keep the editorial layout balanced", async ({ page }) => {
  await page.goto("/");

  expect(await page.locator(".site-header .wordmark span").evaluate((element) => getComputedStyle(element).borderRadius)).toBe("0px");

  const factSizes = await page.locator(".fact dd").evaluateAll((items) => items.map((item) => Number.parseFloat(getComputedStyle(item).fontSize)));
  expect(Math.max(...factSizes) - Math.min(...factSizes)).toBeLessThanOrEqual(0.1);
  if ((page.viewportSize()?.width ?? 0) > 1000) {
    const factWidths = await page.locator(".fact").evaluateAll((items) => items.slice(0, 2).map((item) => item.getBoundingClientRect().width));
    expect(factWidths[0]).toBeLessThan(factWidths[1] ?? 0);
  }

  const headingTops = await page.locator(".neighborhood-grid h3").evaluateAll((items) => items.map((item) => item.getBoundingClientRect().top));
  if ((page.viewportSize()?.width ?? 0) > 840) expect(Math.max(...headingTops) - Math.min(...headingTops)).toBeLessThanOrEqual(1);
});

test("a failed inquiry keeps the visitor's entered details", async ({ page }) => {
  await page.goto("/");
  const form = page.locator(".inquiry-form");
  test.skip((await form.count()) === 0, "Inquiry delivery is not configured in this environment");

  await page.route("**/api/inquiry", (route) => route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ error: "Temporary delivery failure" }),
  }));
  await form.locator('input[name="name"]').fill("Taylor Visitor");
  await form.locator('input[name="email"]').fill("taylor@example.com");
  await form.locator('textarea[name="message"]').fill("Please send the disclosure package.");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: "Send inquiry" }).click();

  await expect(form.locator(".form-status")).toContainText("not delivered");
  await expect(form.locator('input[name="name"]')).toHaveValue("Taylor Visitor");
  await expect(form.locator('textarea[name="message"]')).toHaveValue("Please send the disclosure package.");
});

test("branded route exposes canonical, social, and property metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/2628 Photinia Court, Pleasanton/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonicalUrl);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /2628 Photinia Court/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
  expect(structuredData).toContain("SingleFamilyResidence");
  expect(structuredData).toContain("PostalAddress");
});

test("MLS route is noindex and consolidates to the branded canonical", async ({ page }) => {
  await page.goto("/mls");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonicalUrl);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});

test("crawler endpoints publish only the canonical listing URL", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain(`Sitemap: ${canonicalUrl}/sitemap.xml`);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain(`${canonicalUrl}/`);
  expect(sitemapText).not.toContain("/mls");
});

test("social preview image renders at the Open Graph dimensions", async ({ page }) => {
  const response = await page.goto("/opengraph-image");
  expect(response?.ok()).toBe(true);
  expect(response?.headers()["content-type"]).toContain("image/png");

  const image = page.locator("img");
  await expect(image).toHaveCount(1);
  await expect.poll(() => image.evaluate((element) => ({
    width: element instanceof HTMLImageElement ? element.naturalWidth : 0,
    height: element instanceof HTMLImageElement ? element.naturalHeight : 0,
  }))).toEqual({ width: 1200, height: 630 });
});
