const { test, expect } = require("@playwright/test");
const { clearTasks, openApp, waitForListState } = require("./helpers");

test.beforeEach(async ({ page, request }) => {
  await clearTasks(request);
  await openApp(page);

  await page.click("#btnCreate");
  await page.fill("#taskTitle", "Первая");
  await page.click('button[type="submit"]');
  await page.click("#btnCreate");
  await page.fill("#taskTitle", "Вторая");
  await page.click('button[type="submit"]');
  await page.click("#btnCreate");
  await page.fill("#taskTitle", "Третья");
  await page.click('button[type="submit"]');

  await expect(page.locator(".col-12")).toHaveCount(3);
});

test.describe("Drag & Drop перетаскивание", () => {
  test("перемещает задачу с позиции 1 на позицию 3", async ({ page }) => {
    const cards = page.locator(".col-12");
    await expect(cards).toHaveCount(3);

    const firstCard = cards.nth(0);
    const thirdCard = cards.nth(2);

    const firstBox = await firstCard.boundingBox();
    const thirdBox = await thirdCard.boundingBox();

    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      thirdBox.x + thirdBox.width / 2,
      thirdBox.y + thirdBox.height / 2,
      { steps: 10 }
    );
    await page.mouse.up();

    await expect(cards.nth(0)).toContainText("Вторая");
    await expect(cards.nth(1)).toContainText("Третья");
    await expect(cards.nth(2)).toContainText("Первая");
  });

  test("перемещает задачу с позиции 3 на позицию 1", async ({ page }) => {
    const cards = page.locator(".col-12");

    const thirdCard = cards.nth(2);
    const firstCard = cards.nth(0);

    const thirdBox = await thirdCard.boundingBox();
    const firstBox = await firstCard.boundingBox();

    await page.mouse.move(thirdBox.x + thirdBox.width / 2, thirdBox.y + thirdBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      firstBox.x + firstBox.width / 2,
      firstBox.y + firstBox.height / 2,
      { steps: 10 }
    );
    await page.mouse.up();

    await expect(cards.nth(0)).toContainText("Третья");
    await expect(cards.nth(1)).toContainText("Первая");
    await expect(cards.nth(2)).toContainText("Вторая");
  });

  test("сохраняет порядок после перетаскивания при перезагрузке", async ({ page }) => {
    const cards = page.locator(".col-12");
    await expect(cards).toHaveCount(3);

    const firstCard = cards.nth(0);
    const thirdCard = cards.nth(2);

    const firstBox = await firstCard.boundingBox();
    const thirdBox = await thirdCard.boundingBox();

    await page.mouse.move(firstBox.x + firstBox.width / 2, firstBox.y + firstBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      thirdBox.x + thirdBox.width / 2,
      thirdBox.y + thirdBox.height / 2,
      { steps: 10 }
    );
    await page.mouse.up();
    await waitForListState(page);

    await page.reload();

    await expect(cards.nth(0)).toContainText("Вторая");
    await expect(cards.nth(1)).toContainText("Третья");
    await expect(cards.nth(2)).toContainText("Первая");
  });
});
