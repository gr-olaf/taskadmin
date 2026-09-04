const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  for (const name of ["Первая", "Вторая", "Третья"]) {
    await page.click("#btnCreate");
    await page.fill("#taskTitle", name);
    await page.click('button[type="submit"]');
  }
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

    await page.reload();

    await expect(cards.nth(0)).toContainText("Вторая");
    await expect(cards.nth(1)).toContainText("Третья");
    await expect(cards.nth(2)).toContainText("Первая");
  });
});
