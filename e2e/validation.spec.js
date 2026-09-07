const { test, expect } = require("@playwright/test");
const { clearTasks, openApp } = require("./helpers");

test.beforeEach(async ({ page, request }) => {
  await clearTasks(request);
  await openApp(page);
  await page.evaluate(() => document.getElementById("taskTitle").removeAttribute("required"));
  await page.click("#btnCreate");
});

test.describe("Валидация заголовка", () => {
  test("показывает ошибку при пустом заголовке", async ({ page }) => {
    await page.click('button[type="submit"]');

    await expect(page.locator("#errorTitle")).toContainText("обязателен для заполнения");
    await expect(page.locator("#taskTitle")).toHaveClass(/is-invalid/);
  });

  test("не создаёт задачу с пустым заголовком", async ({ page }) => {
    await page.click('button[type="submit"]');

    await expect(page.locator(".task-card")).toHaveCount(0);
    await expect(page.locator("#formWrapper")).toBeVisible();
  });

  test("показывает ошибку при заголовке > 255 символов", async ({ page }) => {
    await page.evaluate(() => {
      const input = document.getElementById("taskTitle");
      input.removeAttribute("maxlength");
      input.value = "А".repeat(256);
    });
    await page.click('button[type="submit"]');

    await expect(page.locator("#errorTitle")).toContainText("255 символов");
  });

  test("принимает заголовок ровно 255 символов", async ({ page }) => {
    const maxTitle = "Б".repeat(255);
    await page.fill("#taskTitle", maxTitle);
    await page.click('button[type="submit"]');

    await expect(page.locator(".task-card")).toHaveCount(1);
    await expect(page.locator("#formWrapper")).toBeHidden();
  });

  test("очищает ошибку при корректном вводе", async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator("#errorTitle")).toContainText("обязателен");

    await page.fill("#taskTitle", "Валидный заголовок");
    await page.click('button[type="submit"]');

    await expect(page.locator("#errorTitle")).toHaveText("");
    await expect(page.locator("#taskTitle")).not.toHaveClass(/is-invalid/);
  });

  test("отображает ошибку при пробелах только", async ({ page }) => {
    await page.fill("#taskTitle", "   ");
    await page.click('button[type="submit"]');

    await expect(page.locator("#errorTitle")).toContainText("обязателен для заполнения");
  });
});

test.describe("Валидация описания", () => {
  test("показывает ошибку при описании > 2000 символов", async ({ page }) => {
    await page.fill("#taskTitle", "Заголовок");
    await page.evaluate(() => {
      const textarea = document.getElementById("taskDesc");
      textarea.removeAttribute("maxlength");
      textarea.value = "Д".repeat(2001);
    });
    await page.click('button[type="submit"]');

    await expect(page.locator("#errorDesc")).toContainText("2000 символов");
    await expect(page.locator("#taskDesc")).toHaveClass(/is-invalid/);
  });

  test("принимает описание ровно 2000 символов", async ({ page }) => {
    await page.fill("#taskTitle", "С длинным описанием");
    await page.fill("#taskDesc", "Е".repeat(2000));
    await page.click('button[type="submit"]');

    await expect(page.locator(".task-card")).toHaveCount(1);
  });

  test("не показывает ошибку для пустого описания", async ({ page }) => {
    await page.fill("#taskTitle", "Без описания");
    await page.click('button[type="submit"]');

    await expect(page.locator("#errorDesc")).toHaveText("");
    await expect(page.locator(".task-card")).toHaveCount(1);
  });
});
