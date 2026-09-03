const STORAGE_KEY = "taskadmin_tasks";

let tasks = [];

const btnCreate = document.getElementById("btnCreate");
const btnForm = document.getElementById("taskForm");
const btnFormCancel = document.getElementById("btnCancel");
const formWrapper = document.getElementById("formWrapper");
const inputTitle = document.getElementById("taskTitle");
const inputDesc = document.getElementById("taskDesc");
const errorTitle = document.getElementById("errorTitle");
const errorDesc = document.getElementById("errorDesc");
const taskListEl = document.getElementById("taskList");
const taskCountEl = document.getElementById("taskCount");

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  taskListEl.innerHTML = "";

  if (tasks.length === 0) {
    taskListEl.innerHTML = '<div class="empty-state">Задач пока нет</div>';
    taskCountEl.textContent = "";
    return;
  }

  taskCountEl.textContent = `Список из ${tasks.length} задач`;

  tasks.forEach((t) => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.innerHTML = `<h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.description)}</p>`;
    taskListEl.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function showForm() {
  formWrapper.classList.add("open");
  inputTitle.value = "";
  inputDesc.value = "";
  clearErrors();
  inputTitle.focus();
}

function hideForm() {
  formWrapper.classList.remove("open");
  clearErrors();
}

function clearErrors() {
  errorTitle.textContent = "";
  errorDesc.textContent = "";
}

function validate() {
  let valid = true;

  if (!inputTitle.value.trim()) {
    errorTitle.textContent = "Заголовок обязателен для заполнения";
    valid = false;
  } else if (inputTitle.value.length > 255) {
    errorTitle.textContent = "Заголовок не должен превышать 255 символов";
    valid = false;
  } else {
    errorTitle.textContent = "";
  }

  if (inputDesc.value.length > 2000) {
    errorDesc.textContent = "Описание не должно превышать 2000 символов";
    valid = false;
  } else {
    errorDesc.textContent = "";
  }

  return valid;
}

function createTask(title, description) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title,
    description,
    created_at: new Date().toISOString(),
  };
}

btnCreate.addEventListener("click", showForm);

btnFormCancel.addEventListener("click", hideForm);

btnForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validate()) return;

  const task = createTask(inputTitle.value.trim(), inputDesc.value.trim());
  tasks.push(task);
  saveTasks();
  hideForm();
  renderTasks();
});

loadTasks();
renderTasks();
