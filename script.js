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
let totalXP = 0; // Initialize total XP
let currentLevelXP = 0; // XP towards current level
let currentLevel = 1; // Start at level 1
let nextLevelXP = 100; // XP needed for the next level

// Calculate XP needed for a level
function calculateNextLevelXP(level) {
  return Math.floor(nextLevelXP + level * 10 * level); // Increment by 10% of the previous level's XP
}

// Update progress bar and level
function updateLevelProgress() {
  while (currentLevelXP >= nextLevelXP) {
    currentLevelXP -= nextLevelXP; // Subtract the XP for the completed level
    currentLevel++; // Increment the level
    nextLevelXP = calculateNextLevelXP(currentLevel); // Calculate the next level's XP
  }

  document.getElementById("profile-level").textContent = currentLevel;

  const progressPercentage = Math.min(
    (currentLevelXP / nextLevelXP) * 100,
    100
  );
  document.getElementById(
    "level-progress-bar-inner"
  ).style.width = `${progressPercentage}%`;
}

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
  const taskDuration = parseInt(
    document.getElementById("task-duration").value,
    10
  );
  const taskNotes = document.getElementById("task-notes").value; // Capture notes
  const reminder = document.getElementById("reminder-interval").value;

  if (!taskName || !taskDuration) {
    alert("Please fill out all fields");
    return;
  }

  const taskItem = document.createElement("li");
  taskItem.classList.add("task-item");
  taskItem.dataset.name = taskName;
  taskItem.dataset.duration = taskDuration;
  taskItem.dataset.notes = taskNotes; // Store notes in dataset
  taskItem.dataset.reminder = reminder;
  taskItem.dataset.completed = 0;

  taskItem.innerHTML = `
        <h3>${taskName} <span>${0}%</span>
            <div class="gear-icon" title="Edit Task"></div>
        </h3>
        <p class="task-notes">${
          taskNotes || "No notes provided"
        }</p> <!-- Display notes -->
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
  document.getElementById("task-notes").value = ""; // Clear notes field
});

// Open Edit Task Modal
function openEditTaskModal(taskItem) {
  currentTaskElement = taskItem;
  document.getElementById("edit-task-name").value = taskItem.dataset.name;
  document.getElementById("edit-task-duration").value =
    taskItem.dataset.duration;
  document.getElementById("edit-task-notes").value =
    taskItem.dataset.notes || ""; // Populate notes
  document.getElementById("edit-reminder-interval").value =
    taskItem.dataset.reminder;

  editTaskModal.style.display = "flex";
}

// Save Edited Task
saveTaskButton.addEventListener("click", () => {
  const taskName = document.getElementById("edit-task-name").value;
  const taskDuration = document.getElementById("edit-task-duration").value;
  const taskNotes = document.getElementById("edit-task-notes").value; // Capture edited notes
  const reminder = document.getElementById("edit-reminder-interval").value;

  if (!taskName || !taskDuration) {
    alert("Please fill out all fields");
    return;
  }

  currentTaskElement.dataset.name = taskName;
  currentTaskElement.dataset.duration = taskDuration;
  currentTaskElement.dataset.notes = taskNotes; // Update notes in dataset
  currentTaskElement.dataset.reminder = reminder;

  currentTaskElement.querySelector("h3").innerHTML = `
        ${taskName} <span>${currentTaskElement.dataset.completed}%</span>
        <div class="gear-icon" title="Edit Task"></div>
    `;
  currentTaskElement.querySelector(".task-notes").textContent =
    taskNotes || "No notes provided"; // Update displayed notes

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

  const taskDuration = parseInt(taskItem.dataset.duration, 10);
  const xpGained = taskDuration * 50;
  totalXP += xpGained; // Cumulative XP
  currentLevelXP += xpGained; // XP towards current level

  updateLevelProgress();
  document.getElementById("profile-total-xp").textContent = totalXP;

  completedList.appendChild(taskItem);
  updateCounts();
}

// Update Counts
function updateCounts() {
  const activeCount = taskList.childElementCount;
  const completedCount = completedList.childElementCount;
  const failedCount = failedList.childElementCount;

  // Update profile counters
  document.getElementById("profile-active-count").textContent = activeCount;
  document.getElementById("profile-completed-count").textContent =
    completedCount;
  document.getElementById("profile-delayed-completed-count").textContent =
    delayedCompletedTasks;
  document.getElementById("profile-failed-count").textContent = failedCount;

  // Update header panel counters
  document.getElementById("active-count").textContent = activeCount;
  document.getElementById("completed-count").textContent = completedCount;
  document.getElementById("failed-count").textContent = failedCount;

  // Calculate success rate and delayed ratio
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
