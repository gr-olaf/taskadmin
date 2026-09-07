const { test, expect } = require("@playwright/test");
const { clearTasks, openApp } = require("./helpers");

test.beforeEach(async ({ page, request }) => {
  await clearTasks(request);
  await openApp(page);
});

test.describe("Создание задачи", () => {
  test("открывает форму по кнопке «Создать задачу»", async ({ page }) => {
    await page.click("#btnCreate");
    await expect(page.locator("#formWrapper")).toBeVisible();
    await expect(page.locator("#taskTitle")).toBeFocused();
  });

  test("создаёт задачу с заголовком и описанием", async ({ page }) => {
    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Первая задача");
    await page.fill("#taskDesc", "Описание первой задачи");
    await page.click('button[type="submit"]');

    await expect(page.locator(".task-card")).toHaveCount(1);
    await expect(page.locator(".task-card")).toContainText("Первая задача");
    await expect(page.locator(".task-card")).toContainText("Описание первой задачи");
    await expect(page.locator("#taskCount")).toContainText("1");
  });

  test("создаёт задачу только с заголовком", async ({ page }) => {
    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Без описания");
    await page.click('button[type="submit"]');

    await expect(page.locator(".task-card")).toHaveCount(1);
    await expect(page.locator(".task-card")).toContainText("Без описания");
  });

  test("скрывает форму после создания", async ({ page }) => {
    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Тест");
    await page.click('button[type="submit"]');

    await expect(page.locator("#formWrapper")).toBeHidden();
  });

  test("создаёт несколько задач подряд", async ({ page }) => {
    for (const name of ["Задача 1", "Задача 2", "Задача 3"]) {
      await page.click("#btnCreate");
      await page.fill("#taskTitle", name);
      await page.click('button[type="submit"]');
    }

    await expect(page.locator(".task-card")).toHaveCount(3);
    await expect(page.locator("#taskCount")).toContainText("3");
  });

  test("отображает дату создания", async ({ page }) => {
    await page.click("#btnCreate");
    await page.fill("#taskTitle", "С датой");
    await page.click('button[type="submit"]');

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();

    await expect(page.locator(".task-card")).toContainText(`${dd}.${mm}.${yyyy}`);
  });
});

test.describe("Редактирование задачи", () => {
  test.beforeEach(async ({ page }) => {
    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Для редактирования");
    await page.fill("#taskDesc", "Оригинальное описание");
    await page.click('button[type="submit"]');
  });

  test("открывает форму с заполненными данными", async ({ page }) => {
    await page.click(".btn-edit");
    await expect(page.locator("#formWrapper")).toBeVisible();
    await expect(page.locator("#taskTitle")).toHaveValue("Для редактирования");
    await expect(page.locator("#taskDesc")).toHaveValue("Оригинальное описание");
  });

  test("обновляет заголовок и описание", async ({ page }) => {
    await page.click(".btn-edit");
    await page.fill("#taskTitle", "Обновлённая задача");
    await page.fill("#taskDesc", "Новое описание");
    await page.click('button[type="submit"]');

    await expect(page.locator(".task-card")).toContainText("Обновлённая задача");
    await expect(page.locator(".task-card")).toContainText("Новое описание");
    await expect(page.locator(".task-card")).not.toContainText("Для редактирования");
  });

  test("сохраняет количество задач после редактирования", async ({ page }) => {
    await page.click(".btn-edit");
    await page.fill("#taskTitle", "Изменённая");
    await page.click('button[type="submit"]');

    await expect(page.locator(".task-card")).toHaveCount(1);
  });
});

test.describe("Удаление задачи", () => {
  test("удаляет задачу", async ({ page }) => {
    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Для удаления");
    await page.click('button[type="submit"]');

    await expect(page.locator(".task-card")).toHaveCount(1);
    await page.click(".btn-delete");
    await expect(page.locator(".task-card")).toHaveCount(0);
  });

  test("удаляет одну задачу из нескольких", async ({ page }) => {
    for (const name of ["Останется", "Удалится", "Тоже останется"]) {
      await page.click("#btnCreate");
      await page.fill("#taskTitle", name);
      await page.click('button[type="submit"]');
    }

    const targetCard = page.locator(".col-12", { hasText: "Удалится" }).filter({ hasNotText: "Тоже" });
    await targetCard.locator(".btn-delete").click();

    await expect(page.locator(".task-card")).toHaveCount(2);
    const texts = await page.locator(".task-card .card-title").allTextContents();
    expect(texts).toContain("Останется");
    expect(texts).toContain("Тоже останется");
    expect(texts).not.toContain("Удалится");
  });
});

test.describe("Отмена", () => {
  test("скрывает форму по кнопке «Отмена»", async ({ page }) => {
    await page.click("#btnCreate");
    await expect(page.locator("#formWrapper")).toBeVisible();

    await page.click("#btnCancel");
    await expect(page.locator("#formWrapper")).toBeHidden();
  });

  test("не сохраняет данные при отмене", async ({ page }) => {
    await page.click("#btnCreate");
    await page.fill("#taskTitle", "Не сохранится");
    await page.click("#btnCancel");

    await expect(page.locator(".task-card")).toHaveCount(0);
  });
});
