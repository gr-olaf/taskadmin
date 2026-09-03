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
const editTaskIdInput = document.getElementById("editTaskId");
const btnSave = document.getElementById("btnSave");

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
    const date = formatDate(t.created_at);
    card.innerHTML = `
      <div class="task-card-content">
        <h3>${escapeHtml(t.title)}</h3>
        <p>${escapeHtml(t.description)}</p>
        <div class="task-card-date">${date}</div>
      </div>
      <div class="task-card-actions">
        <button class="btn-edit" data-id="${t.id}">Редактировать</button>
        <button class="btn-delete" data-id="${t.id}">Удалить</button>
      </div>
    `;
    taskListEl.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function formatDate(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function showForm(task) {
  formWrapper.classList.add("open");
  clearErrors();
  editTaskIdInput.value = task ? task.id : "";
  inputTitle.value = task ? task.title : "";
  inputDesc.value = task ? task.description : "";
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

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) showForm(task);
}

function updateTask(id, title, description) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.title = title;
    task.description = description;
    saveTasks();
  }
}

btnCreate.addEventListener("click", () => showForm());

btnFormCancel.addEventListener("click", hideForm);

btnForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!validate()) return;

  const id = editTaskIdInput.value;
  const title = inputTitle.value.trim();
  const description = inputDesc.value.trim();

  if (id) {
    updateTask(id, title, description);
  } else {
    const task = createTask(title, description);
    tasks.push(task);
    saveTasks();
  }

  hideForm();
  renderTasks();
});

taskListEl.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".btn-edit");
  if (editBtn) {
    editTask(editBtn.dataset.id);
    return;
  }
  const deleteBtn = e.target.closest(".btn-delete");
  if (deleteBtn) deleteTask(deleteBtn.dataset.id);
});

loadTasks();
renderTasks();
