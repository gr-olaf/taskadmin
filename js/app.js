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
    const date = formatDate(t.created_at);
    const col = document.createElement("div");
    col.className = "col-12";
    col.draggable = true;
    col.dataset.id = t.id;
    col.innerHTML = `
      <div class="card shadow-sm h-100 task-card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div class="task-card-content">
              <h3 class="card-title h6 mb-1">${escapeHtml(t.title)}</h3>
              <p class="card-text mb-1">${escapeHtml(t.description)}</p>
              <p class="card-text text-muted small mb-0">${date}</p>
            </div>
            <div class="d-flex flex-column flex-sm-row gap-2 flex-shrink-0">
              <button class="btn btn-sm btn-outline-secondary btn-edit" data-id="${t.id}">Редактировать</button>
              <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${t.id}">Удалить</button>
            </div>
          </div>
        </div>
      </div>
    `;
    col.addEventListener("dragstart", handleDragStart);
    col.addEventListener("dragover", handleDragOver);
    col.addEventListener("dragleave", handleDragLeave);
    col.addEventListener("drop", handleDrop);
    col.addEventListener("dragend", handleDragEnd);
    taskListEl.appendChild(col);
  });
}

let dragItem = null;

function handleDragStart(e) {
  dragItem = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", this.dataset.id);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  this.classList.add("drag-over");
}

function handleDragLeave() {
  this.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove("drag-over");
  if (dragItem === this) return;
  const list = [...taskListEl.children];
  const fromIndex = list.indexOf(dragItem);
  const toIndex = list.indexOf(this);
  reorderTasks(fromIndex, toIndex);
}

function handleDragEnd() {
  this.classList.remove("dragging");
  dragItem = null;
  document.querySelectorAll(".drag-over, .dragging").forEach((el) => {
    el.classList.remove("drag-over", "dragging");
  });
}

function reorderTasks(fromIndex, toIndex) {
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
  const [moved] = tasks.splice(fromIndex, 1);
  tasks.splice(toIndex, 0, moved);
  saveTasks();
  renderTasks();
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
  formWrapper.classList.remove("d-none");
  clearErrors();
  editTaskIdInput.value = task ? task.id : "";
  inputTitle.value = task ? task.title : "";
  inputDesc.value = task ? task.description : "";
  inputTitle.focus();
}

function hideForm() {
  formWrapper.classList.add("d-none");
  clearErrors();
}

function clearErrors() {
  errorTitle.textContent = "";
  errorDesc.textContent = "";
  inputTitle.classList.remove("is-invalid");
  inputDesc.classList.remove("is-invalid");
}

function validate() {
  let valid = true;

  inputTitle.classList.remove("is-invalid");
  inputDesc.classList.remove("is-invalid");
  errorTitle.textContent = "";
  errorDesc.textContent = "";

  if (!inputTitle.value.trim()) {
    errorTitle.textContent = "Заголовок обязателен для заполнения";
    inputTitle.classList.add("is-invalid");
    valid = false;
  } else if (inputTitle.value.length > 255) {
    errorTitle.textContent = "Заголовок не должен превышать 255 символов";
    inputTitle.classList.add("is-invalid");
    valid = false;
  }

  if (inputDesc.value.length > 2000) {
    errorDesc.textContent = "Описание не должно превышать 2000 символов";
    inputDesc.classList.add("is-invalid");
    valid = false;
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
