import { test } from "@playwright/test";

test.describe("Video Recordings Screenshot Capture", () => {
  test("Capture Desktop & Mobile Screenshots", async ({ page }) => {
    test.setTimeout(90000);

    // -------------------------------------------------------------
    // 1. DESKTOP VIEWPORT (1440 x 900)
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dev/recordings-preview");
    await page.waitForLoadState("networkidle");

    // Screenshot 1: Admin Recordings List (Desktop)
    await page.screenshot({
      path: "qa/screenshots/recordings/desktop_admin_list.png",
      fullPage: true,
    });

    // Open Add Form Modal
    await page.getByRole("button", { name: /Add Class Recording/i }).click({ force: true });
    await page.waitForTimeout(600);

    // Type video URL to trigger live preview
    const textarea = page.locator("textarea").first();
    await textarea.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await page.waitForTimeout(800);

    // Screenshot 2: Admin Add Form with Preview & Student Checklist (Desktop)
    await page.screenshot({
      path: "qa/screenshots/recordings/desktop_admin_add_form.png",
      fullPage: true,
    });

    // Close modal
    await page.getByRole("button", { name: "Cancel" }).click({ force: true });
    await page.waitForTimeout(400);

    // Switch to Student Recordings Tab
    await page.getByTestId("tab-student-list").click({ force: true });
    await page.waitForTimeout(500);

    // Screenshot 3: Student Recordings Page (Desktop)
    await page.screenshot({
      path: "qa/screenshots/recordings/desktop_student_recordings.png",
      fullPage: true,
    });

    // Switch to Watch Page Tab
    await page.getByTestId("tab-watch-page").click({ force: true });
    await page.waitForTimeout(500);

    // Screenshot 4: Student Watch Page (Desktop)
    await page.screenshot({
      path: "qa/screenshots/recordings/desktop_watch_page.png",
      fullPage: true,
    });

    // -------------------------------------------------------------
    // 2. MOBILE VIEWPORT (390 x 844) - iPhone 12 / 13 / 14
    // -------------------------------------------------------------
    await page.setViewportSize({ width: 390, height: 844 });

    // Switch to Admin List
    await page.getByTestId("tab-admin-list").click({ force: true });
    await page.waitForTimeout(500);

    // Screenshot 5: Admin Recordings List (Mobile)
    await page.screenshot({
      path: "qa/screenshots/recordings/mobile_admin_list.png",
      fullPage: true,
    });

    // Open Add Form Modal on Mobile
    await page.getByRole("button", { name: /Add Class Recording/i }).click({ force: true });
    await page.waitForTimeout(600);
    const mobileTextarea = page.locator("textarea").first();
    await mobileTextarea.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await page.waitForTimeout(800);

    // Screenshot 6: Admin Add Form (Mobile)
    await page.screenshot({
      path: "qa/screenshots/recordings/mobile_admin_add_form.png",
      fullPage: true,
    });

    await page.getByRole("button", { name: "Cancel" }).click({ force: true });
    await page.waitForTimeout(400);

    // Switch to Student Recordings Tab
    await page.getByTestId("tab-student-list").click({ force: true });
    await page.waitForTimeout(500);

    // Screenshot 7: Student Recordings Page (Mobile)
    await page.screenshot({
      path: "qa/screenshots/recordings/mobile_student_recordings.png",
      fullPage: true,
    });

    // Switch to Watch Page Tab
    await page.getByTestId("tab-watch-page").click({ force: true });
    await page.waitForTimeout(500);

    // Screenshot 8: Student Watch Page (Mobile)
    await page.screenshot({
      path: "qa/screenshots/recordings/mobile_watch_page.png",
      fullPage: true,
    });
  });
});
