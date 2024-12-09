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

let currentTaskElement = null;
let delayedCompletedTasks = 0;
let totalXP = 0;
let currentLevelXP = 0;
let currentLevel = 1;
let nextLevelXP = 100;

function calculateNextLevelXP(level) {
  return Math.floor(nextLevelXP + level * 10 * level);
}

function updateLevelProgress() {
  while (currentLevelXP >= nextLevelXP) {
    currentLevelXP -= nextLevelXP;
    currentLevel++;
    nextLevelXP = calculateNextLevelXP(currentLevel);
  }

  document.getElementById("profile-level").textContent = currentLevel;

  const progressPercentage = Math.min(
    (currentLevelXP / nextLevelXP) * 100,
    100
  );
  const progressBarInner = document.getElementById("level-progress-bar-inner");

  progressBarInner.style.width = `${progressPercentage}%`;
  progressBarInner.textContent = `${Math.floor(progressPercentage)}%`;
  progressBarInner.style.textAlign = "center";
  progressBarInner.style.color = "#fff";
  progressBarInner.style.fontWeight = "bold";
}

openTaskModal.addEventListener("click", () => {
  taskModal.style.display = "flex";
  document.getElementById("task-name").focus();
});

closeTaskModal.addEventListener("click", () => {
  taskModal.style.display = "none";
});

closeEditTaskModal.addEventListener("click", () => {
  editTaskModal.style.display = "none";
});

addTaskButton.addEventListener("click", () => {
  const taskName = document.getElementById("task-name").value;
  const taskDuration = parseInt(
    document.getElementById("task-duration").value,
    10
  );
  const taskNotes = document.getElementById("task-notes").value;
  const reminder = document.getElementById("reminder-interval").value;

  if (!taskName || !taskDuration) {
    alert("Please fill out all fields");
    return;
  }

  const taskItem = document.createElement("li");
  taskItem.classList.add("task-item");
  taskItem.dataset.name = taskName;
  taskItem.dataset.duration = taskDuration;
  taskItem.dataset.notes = taskNotes;
  taskItem.dataset.reminder = reminder;
  taskItem.dataset.completed = 0;

  taskItem.innerHTML = `
        <h3>${taskName} <span>${0}%</span>
            <div class="gear-icon" title="Edit Task"></div>
        </h3>
        <p class="task-notes">${taskNotes || "No notes provided"}</p>
        <div class="progress-bar">
            <div class="progress-bar-inner"></div>
        </div>
        <div class="task-buttons">
            <button class="update-tracker">Update</button>
            <button class="close-task">Close</button>
        </div>
    `;

  taskItem.querySelector(".gear-icon").addEventListener("click", (e) => {
    e.stopPropagation();
    openEditTaskModal(taskItem);
  });

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
  document.getElementById("task-notes").value = "";
});

function openEditTaskModal(taskItem) {
  currentTaskElement = taskItem;
  document.getElementById("edit-task-name").value = taskItem.dataset.name;
  document.getElementById("edit-task-duration").value =
    taskItem.dataset.duration;
  document.getElementById("edit-task-notes").value =
    taskItem.dataset.notes || "";
  document.getElementById("edit-reminder-interval").value =
    taskItem.dataset.reminder;

  editTaskModal.style.display = "flex";
}

saveTaskButton.addEventListener("click", () => {
  const taskName = document.getElementById("edit-task-name").value;
  const taskDuration = document.getElementById("edit-task-duration").value;
  const taskNotes = document.getElementById("edit-task-notes").value;
  const reminder = document.getElementById("edit-reminder-interval").value;

  if (!taskName || !taskDuration) {
    alert("Please fill out all fields");
    return;
  }

  currentTaskElement.dataset.name = taskName;
  currentTaskElement.dataset.duration = taskDuration;
  currentTaskElement.dataset.notes = taskNotes;
  currentTaskElement.dataset.reminder = reminder;

  currentTaskElement.querySelector("h3").innerHTML = `
        ${taskName} <span>${currentTaskElement.dataset.completed}%</span>
        <div class="gear-icon" title="Edit Task"></div>
    `;
  currentTaskElement.querySelector(".task-notes").textContent =
    taskNotes || "No notes provided";

  editTaskModal.style.display = "none";
});

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

function moveTaskToFailed(taskItem) {
  taskItem.classList.add("failed");
  failedList.appendChild(taskItem);
  updateCounts();
}

function moveTaskToCompleted(taskItem) {
  taskItem.classList.add("completed");
  taskItem.querySelector(".update-tracker").remove();
  taskItem.querySelector(".close-task").remove();

  if (failedList.contains(taskItem)) {
    delayedCompletedTasks++;
  }

  const taskDuration = parseInt(taskItem.dataset.duration, 10);
  const xpGained = taskDuration * 50;
  totalXP += xpGained;
  currentLevelXP += xpGained;

  updateLevelProgress();
  document.getElementById("profile-total-xp").textContent = totalXP;

  completedList.appendChild(taskItem);
  updateCounts();
}

function updateCounts() {
  const activeCount = taskList.childElementCount;
  const completedCount = completedList.childElementCount;
  const failedCount = failedList.childElementCount;

  document.getElementById("active-count").textContent = activeCount;
  document.getElementById("completed-count").textContent = completedCount;
  document.getElementById("failed-count").textContent = failedCount;

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
}
