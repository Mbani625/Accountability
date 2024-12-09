const taskList = document.getElementById("task-list");
const completedList = document.getElementById("completed-list");
const failedList = document.getElementById("failed-list");
const taskModal = document.getElementById("task-modal");
const editTaskModal = document.getElementById("edit-task-modal");
const openTaskModal = document.getElementById("open-task-modal");
const closeTaskModal = document.getElementById("close-task-modal");
const closeEditTaskModal = document.getElementById("close-edit-task-modal");
const addTaskButton = document.getElementById("add-task");
const saveTaskButton = document.getElementById("save-task");

let currentTaskElement = null; // To store the task being edited
let delayedCompletedTasks = 0; // Counter for delayed completed tasks

// Open Add Task Modal
openTaskModal.addEventListener("click", () => {
  taskModal.style.display = "flex";
  document.getElementById("task-name").focus();
});

// Close Add Task Modal
closeTaskModal.addEventListener("click", () => {
  taskModal.style.display = "none";
});

// Close Edit Task Modal
closeEditTaskModal.addEventListener("click", () => {
  editTaskModal.style.display = "none";
});

// Add New Task
addTaskButton.addEventListener("click", () => {
  const taskName = document.getElementById("task-name").value;
  const taskDuration = document.getElementById("task-duration").value;
  const reminder = document.getElementById("reminder-interval").value;

  if (!taskName || !taskDuration) {
    alert("Please fill out all fields");
    return;
  }

  const taskItem = document.createElement("li");
  taskItem.classList.add("task-item");
  taskItem.dataset.name = taskName;
  taskItem.dataset.duration = taskDuration;
  taskItem.dataset.reminder = reminder;
  taskItem.dataset.completed = 0;

  taskItem.innerHTML = `
        <h3>${taskName} <span>${0}%</span>
            <div class="gear-icon" title="Edit Task"></div>
        </h3>
        <div class="progress-bar">
            <div class="progress-bar-inner"></div>
        </div>
        <div class="task-buttons">
            <button class="update-tracker">Update</button>
            <button class="close-task">Close</button>
        </div>
    `;

  // Add gear icon click functionality
  taskItem.querySelector(".gear-icon").addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent triggering other events
    openEditTaskModal(taskItem);
  });

  // Add update and close functionality
  taskItem.querySelector(".update-tracker").addEventListener("click", () => {
    updateTaskProgress(taskItem);
  });

  taskItem.querySelector(".close-task").addEventListener("click", () => {
    moveTaskToFailed(taskItem);
  });

  taskList.appendChild(taskItem);
  updateCounts();
  taskModal.style.display = "none";
  document.getElementById("task-name").value = "";
  document.getElementById("task-duration").value = "";
});

// Open Edit Task Modal
function openEditTaskModal(taskItem) {
  currentTaskElement = taskItem;
  document.getElementById("edit-task-name").value = taskItem.dataset.name;
  document.getElementById("edit-task-duration").value =
    taskItem.dataset.duration;
  document.getElementById("edit-reminder-interval").value =
    taskItem.dataset.reminder;

  editTaskModal.style.display = "flex";
}

// Save Edited Task
saveTaskButton.addEventListener("click", () => {
  const taskName = document.getElementById("edit-task-name").value;
  const taskDuration = document.getElementById("edit-task-duration").value;
  const reminder = document.getElementById("edit-reminder-interval").value;

  if (!taskName || !taskDuration) {
    alert("Please fill out all fields");
    return;
  }

  currentTaskElement.dataset.name = taskName;
  currentTaskElement.dataset.duration = taskDuration;
  currentTaskElement.dataset.reminder = reminder;

  currentTaskElement.querySelector("h3").innerHTML = `
        ${taskName} <span>${currentTaskElement.dataset.completed}%</span>
        <div class="gear-icon" title="Edit Task"></div>
    `;

  currentTaskElement
    .querySelector(".gear-icon")
    .addEventListener("click", (e) => {
      e.stopPropagation();
      openEditTaskModal(currentTaskElement);
    });

  editTaskModal.style.display = "none";
});

// Update Task Progress
function updateTaskProgress(taskItem) {
  const duration = parseInt(taskItem.dataset.duration);
  const completed = parseInt(taskItem.dataset.completed) + 1;
  taskItem.dataset.completed = completed;

  const progress = Math.floor((completed / duration) * 100);
  taskItem.querySelector(".progress-bar-inner").style.width = `${progress}%`;
  taskItem.querySelector("h3 span").textContent = `${progress}%`;

  if (progress >= 100) {
    moveTaskToCompleted(taskItem);
  }
}

// Move Task to Failed
function moveTaskToFailed(taskItem) {
  taskItem.classList.add("failed");
  failedList.appendChild(taskItem);
  updateCounts();
}

// Move Task to Completed
function moveTaskToCompleted(taskItem) {
  taskItem.classList.add("completed");
  taskItem.querySelector(".update-tracker").remove();
  taskItem.querySelector(".close-task").remove();

  if (failedList.contains(taskItem)) {
    delayedCompletedTasks++;
  }

  completedList.appendChild(taskItem);
  updateCounts();
}

// Update Counts
function updateCounts() {
  const activeCount = taskList.childElementCount;
  const completedCount = completedList.childElementCount;
  const failedCount = failedList.childElementCount;

  document.getElementById("profile-active-count").textContent = activeCount;
  document.getElementById("profile-completed-count").textContent =
    completedCount;
  document.getElementById("profile-delayed-completed-count").textContent =
    delayedCompletedTasks;
  document.getElementById("profile-failed-count").textContent = failedCount;

  const totalTasks = activeCount + completedCount + failedCount;
  const successRate =
    totalTasks > 0 ? Math.floor((completedCount / totalTasks) * 100) : 0;
  const delayedRatio =
    totalTasks > 0 ? Math.floor((delayedCompletedTasks / totalTasks) * 100) : 0;

  document.getElementById(
    "profile-success-rate"
  ).textContent = `${successRate}%`;
  document.getElementById(
    "profile-delayed-ratio"
  ).textContent = `${delayedRatio}%`;

  const level = Math.floor(completedCount / 5) + 1; // Example level calculation
  document.getElementById("profile-level").textContent = level;
}
