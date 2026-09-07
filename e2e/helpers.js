const API_URL = "http://localhost:8080/api/tasks";

async function clearTasks(request) {
  const res = await request.get(API_URL);
  if (!res.ok()) return;
  const tasks = await res.json();
  for (const task of tasks) {
    await request.delete(`${API_URL}/${task.id}`);
  }
}

async function openApp(page) {
  await page.goto("/");
  await page.locator(".empty-state").waitFor();
}

async function createTasks(page, names) {
  for (const name of names) {
    await page.click("#btnCreate");
    await page.fill("#taskTitle", name);
    await page.click('button[type="submit"]');
  }
}

function waitForListState(page) {
  return page.waitForLoadState("networkidle");
}

module.exports = { clearTasks, openApp, createTasks, waitForListState };