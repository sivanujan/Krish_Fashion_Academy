import { test, expect } from "@playwright/test";

test.describe("Krish Fashion Academy - End-to-End Suite", () => {
  test("Home Page: Renders Canadian branding, correct facts, and all sections in order", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Check title & SEO
    await expect(page).toHaveTitle(/Scarborough, Toronto \| Krish Fashion Academy/i);

    // 2. Check Hero section (3.1)
    await expect(
      page.getByText("SCARBOROUGH · TORONTO · IN-PERSON & ONLINE")
    ).toBeVisible();
    await expect(
      page.locator("h1").getByText("Master the Art of", { exact: false })
    ).toBeVisible();
    await expect(
      page.locator("h1").getByText("Saree Blouse Tailoring", { exact: false })
    ).toBeVisible();
    await expect(page.getByText("No experience needed", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Finish your blouse in 2 days").first()).toBeVisible();
    await expect(page.getByText("Small hands-on batches").first()).toBeVisible();

    // Verify WhatsApp button has Canadian phone +1 647-501-9569
    const heroWhatsAppBtn = page.locator("section").first().getByRole("link", { name: /REGISTER ON WHATSAPP/i }).first();
    await expect(heroWhatsAppBtn).toBeVisible();
    const heroHref = await heroWhatsAppBtn.getAttribute("href");
    expect(heroHref).toContain("16475019569");

    // 3. Check Upcoming Master Class section (3.2)
    await expect(
      page.getByRole("heading", { name: /2-Day Saree Blouse Master Class/i }).first()
    ).toBeVisible();
    await expect(page.getByText(/Days/i).first()).toBeVisible();
    await expect(page.getByText(/Hours/i).first()).toBeVisible();

    // 4. Check What You'll Learn 5-step timeline (3.3)
    await expect(
      page.getByRole("heading", { name: /From Measurement to Finished Blouse/i })
    ).toBeVisible();
    await expect(page.getByText("Body Measurements").first()).toBeVisible();
    await expect(page.getByText("Calculations").first()).toBeVisible();
    await expect(page.getByText("Paper Pattern").first()).toBeVisible();
    await expect(page.getByText("Cutting").first()).toBeVisible();
    await expect(page.getByText("Stitching").first()).toBeVisible();

    // 5. Check Who It's For (3.4)
    await expect(
      page.getByRole("heading", { name: /Who This Master Class Is For/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Complete Beginners" })
    ).toBeVisible();

    // 6. Check Choose Your Format (3.5)
    await expect(
      page.getByRole("heading", { name: "Choose Your Format", exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /In-Person Master Class/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Live Online Master Class/i })
    ).toBeVisible();

    // 7. Check Location & Map (3.11)
    await expect(
      page.getByText("Middlefield Rd & McNicoll Ave, Scarborough, ON").first()
    ).toBeVisible();
    const mapIframe = page.locator("iframe");
    await expect(mapIframe.first()).toBeVisible();

    // 8. CRITICAL: Strict check that Sri Lanka or LKR never appear on the home page
    const pageContent = await page.content();
    expect(pageContent).not.toContain("Sri Lanka");
    expect(pageContent).not.toContain("Colombo");
    expect(pageContent).not.toContain("LKR");
    expect(pageContent).not.toContain("fee_lkr");
  });

  test("Public Classes & Batches: Lists upcoming cohorts and batch details", async ({
    page,
  }) => {
    // 1. Visit /classes
    await page.goto("/classes");
    await expect(page).toHaveTitle(/Upcoming Batches & Classes in Scarborough/i);
    await expect(page.getByRole("heading", { name: /Upcoming Master Class Batches/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /All Scheduled Cohorts/i })).toBeVisible();

    // 2. Visit flagship batch /classes/SBM-2026-05
    await page.goto("/classes/SBM-2026-05");
    await expect(page.getByText(/2-Day Saree Blouse Master Class/i).first()).toBeVisible();
    await expect(page.getByText(/Middlefield Rd & McNicoll Ave/i).first()).toBeVisible();

    // Check WhatsApp CTA & Enquiry Form on the batch page
    await expect(page.getByRole("link", { name: /Reserve Seat via WhatsApp/i })).toBeVisible();
    await expect(page.getByLabel(/Your Full Name/i)).toBeVisible();
  });

  test("Public Feedback Link: Token verification and closed state behavior", async ({
    page,
  }) => {
    // Visiting an unknown or closed token renders the elegant closed state
    await page.goto("/feedback/closed-sample-token-12345");
    await expect(
      page.getByRole("heading", { name: /Feedback for this batch is closed/i })
    ).toBeVisible();
    await expect(
      page.getByText(/The submission window for this cohort has concluded/i)
    ).toBeVisible();
  });

  test("Security & Auth: Unauthenticated visitors redirected from admin and student portal", async ({
    page,
  }) => {
    // 1. Protected Admin overview redirects to /login?next=/admin
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
    await expect(page.getByRole("heading", { name: /Sign In/i })).toBeVisible();

    // 2. Protected Student Dashboard redirects to /login?next=/dashboard
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
    await expect(page.getByRole("heading", { name: /Sign In/i })).toBeVisible();
  });

  test("Contact Page: Form with Canadian phone, mode selector, and WhatsApp direct link", async ({
    page,
  }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: /Admissions & Atelier Inquiries/i })).toBeVisible();
    await expect(page.getByText("+1 647-501-9569").first()).toBeVisible();
    await expect(page.getByText("Middlefield Rd & McNicoll Ave, Scarborough, ON").first()).toBeVisible();

    // Form inputs
    await expect(page.getByLabel(/Your Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Phone \/ WhatsApp Number/i)).toBeVisible();
  });

  test("Responsive Design: No horizontal overflow across all device viewports", async ({
    page,
  }) => {
    const viewports = [
      { width: 360, height: 740, name: "360px Mobile" },
      { width: 390, height: 844, name: "390px iPhone" },
      { width: 768, height: 1024, name: "768px iPad" },
      { width: 1024, height: 768, name: "1024px Desktop" },
      { width: 1440, height: 900, name: "1440px Large Screen" },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");

      // Verify no horizontal overflow
      const hasHorizontalScrollbar = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(
        hasHorizontalScrollbar,
        `Viewport ${vp.name} (${vp.width}px) should not have horizontal overflow`
      ).toBe(false);
    }
  });
});
