const { test, expect } = require("@playwright/test");

test.describe("Пустое состояние", () => {
  test("показывает сообщение «Задач пока нет» при пустом списке", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.locator(".empty-state")).toBeVisible();
    await expect(page.locator(".empty-state")).toContainText("Задач пока нет");
    await expect(page.locator("#taskCount")).toHaveText("");
  });

  test("скрывает сообщение после добавления задачи", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.locator(".empty-state")).toBeVisible();

    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Первая задача");
    await page.click('button[type="submit"]');

    await expect(page.locator(".empty-state")).toBeHidden();
  });
});

test.describe("Сохранение в localStorage", () => {
  test("задачи сохраняются и загружаются после перезагрузки", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Сохранённая задача");
    await page.fill("#taskDesc", "Описание");
    await page.click('button[type="submit"]');

    await page.reload();

    await expect(page.locator(".task-card")).toHaveCount(1);
    await expect(page.locator(".task-card")).toContainText("Сохранённая задача");
    await expect(page.locator(".task-card")).toContainText("Описание");
  });

  test("несколько задач сохраняются после перезагрузки", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    for (const name of ["Задача А", "Задача Б", "Задача В"]) {
      await page.click("#btnCreate");
      await page.fill("#taskTitle", name);
      await page.click('button[type="submit"]');
    }

    await page.reload();

    await expect(page.locator(".task-card")).toHaveCount(3);
    await expect(page.locator("#taskCount")).toContainText("3");
  });

  test("удаление сохраняется после перезагрузки", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Удалится");
    await page.click('button[type="submit"]');

    await page.click(".btn-delete");
    await page.reload();

    await expect(page.locator(".task-card")).toHaveCount(0);
    await expect(page.locator(".empty-state")).toBeVisible();
  });

  test("редактирование сохраняется после перезагрузки", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Оригинал");
    await page.click('button[type="submit"]');

    await page.click(".btn-edit");
    await page.fill("#taskTitle", "Изменено");
    await page.click('button[type="submit"]');

    await page.reload();

    await expect(page.locator(".task-card")).toContainText("Изменено");
    await expect(page.locator(".task-card")).not.toContainText("Оригинал");
  });

  test("порядок задач сохраняется после перезагрузки", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    for (const name of ["А", "Б", "В"]) {
      await page.click("#btnCreate");
      await page.fill("#taskTitle", name);
      await page.click('button[type="submit"]');
    }

    await page.reload();

    const cards = page.locator(".task-card");
    await expect(cards.nth(0)).toContainText("А");
    await expect(cards.nth(1)).toContainText("Б");
    await expect(cards.nth(2)).toContainText("В");
  });
});

test.describe("Счётчик задач", () => {
  test("не показывает счётчик при пустом списке", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.locator("#taskCount")).toHaveText("");
  });

  test("показывает правильный счётчик", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Одна");
    await page.click('button[type="submit"]');
    await expect(page.locator("#taskCount")).toContainText("1");

    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Две");
    await page.click('button[type="submit"]');
    await expect(page.locator("#taskCount")).toContainText("2");
  });
});
