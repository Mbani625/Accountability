const taskList = document.getElementById("task-list");
const completedList = document.getElementById("completed-list");
const failedList = document.getElementById("failed-list");
const taskModal = document.getElementById("task-modal");
const updateModal = document.getElementById("update-modal");
const updateModalInput = document.getElementById("update-modal-input");
const updateModalSave = document.getElementById("update-modal-save");
const updateModalClose = document.getElementById("update-modal-close");
let currentTaskForUpdate = null;
const openTaskModal = document.getElementById("open-task-modal");
const closeTaskModal = document.getElementById("close-task-modal");
const addTaskButton = document.getElementById("add-task");
const WARNING_HOURS = 0.012; // SET THIS TO 24 ON GO LIVE
const FAILURE_HOURS = 0.025; // SET THIS TO 48 ON GO LIVE

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

// Open the update modal and focus the text input
updateModalClose.addEventListener("click", () => {
  updateModal.style.display = "none";
  currentTaskForUpdate = null;
});

updateModalSave.addEventListener("click", saveUpdate);

updateModalInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveUpdate(); // Trigger save action
  }
});

function saveUpdate() {
  const updateText = updateModalInput.value.trim();
  if (updateText && currentTaskForUpdate) {
    const updateCount = parseInt(currentTaskForUpdate.dataset.updateCount, 10) + 1;
    currentTaskForUpdate.dataset.updateCount = updateCount;

    const updateList = currentTaskForUpdate.querySelector(".update-list");
    const updateItem = document.createElement("li");
    updateItem.textContent = `Update ${updateCount}: ${updateText}`;
    updateList.appendChild(updateItem);

    updateModalInput.value = "";
    updateModal.style.display = "none";

    updateTaskProgress(currentTaskForUpdate);
    currentTaskForUpdate = null;
  }
}

// Ensure the cursor focuses on the input when opening the modal
document.querySelectorAll(".update-tracker").forEach((button) => {
  button.addEventListener("click", () => {
    currentTaskForUpdate = button.closest(".task-item");
    const updateCount = parseInt(currentTaskForUpdate.dataset.updateCount, 10) + 1;
    updateModalInput.placeholder = `Update ${updateCount}`;
    updateModalInput.value = ""; // Clear previous input
    updateModal.style.display = "flex";

    // Focus cursor in the input field
    updateModalInput.focus();
  });
});


function handleCloseTask(taskItem) {
  const progress = parseInt(
    taskItem.querySelector(".progress-bar-inner").style.width,
    10
  );

  if (progress >= 100) {
    moveTaskToCompleted(taskItem);
  } else {
    moveTaskToFailed(taskItem);
  }
}

function createTaskElement(taskData) {
  const taskItem = document.createElement("li");
  taskItem.classList.add("task-item");
  taskItem.dataset.name = taskData.name;
  taskItem.dataset.duration = taskData.duration;
  taskItem.dataset.notes = taskData.notes;
  taskItem.dataset.completed = 0;
  taskItem.dataset.updateCount = 0;

  taskItem.innerHTML = `
        <h3>${taskData.name} (Duration: ${taskData.duration} days) <span>${0}%</span></h3>
        <p class="task-notes">${taskData.notes || "No notes provided"}</p>
        <ul class="update-list"></ul>
        <div class="progress-bar">
            <div class="progress-bar-inner"></div>
        </div>
        <div class="task-buttons">
            <button class="clone-button">Clone</button>
            <button class="update-tracker">Update</button>
            <button class="close-task">Close</button>
        </div>
    `;

  taskItem.querySelector(".clone-button").addEventListener("click", (e) => {
    e.stopPropagation();
    const clonedTaskData = { ...taskData };
    const clonedTask = createTaskElement(clonedTaskData);
    taskList.appendChild(clonedTask);
    updateCounts();
  });

  taskItem.querySelector(".update-tracker").addEventListener("click", () => {
    currentTaskForUpdate = taskItem;
    const updateCount = parseInt(taskItem.dataset.updateCount, 10) + 1;
    updateModalInput.placeholder = `Update ${updateCount}`;
    updateModal.style.display = "flex";
  });

  taskItem.querySelector(".close-task").addEventListener("click", () => {
    handleCloseTask(taskItem);
  });

  return taskItem;
}

addTaskButton.addEventListener("click", () => {
  // Retrieve input values
  const taskName = document.getElementById("task-name").value.trim();
  const taskDuration = parseInt(
    document.getElementById("task-duration").value.trim(),
    10
  );
  const taskNotes = document.getElementById("task-notes").value.trim();

  // Validate input values
  if (!taskName || isNaN(taskDuration) || taskDuration <= 0) {
    alert("Please enter a valid task name and duration.");
    return;
  }

  // Create task data object
  const taskData = {
    name: taskName,
    duration: taskDuration,
    notes: taskNotes,
  };

  // Create and add the task to the active tasks list
  const taskItem = createTaskElement(taskData);
  taskList.appendChild(taskItem);

  // Update counts and close the modal
  updateCounts();
  taskModal.style.display = "none";

  // Clear the input fields
  document.getElementById("task-name").value = "";
  document.getElementById("task-duration").value = "";
  document.getElementById("task-notes").value = "";

  // Start the timer for the new task
  startTaskTimer(taskItem);
});


function startTaskTimer(taskItem) {
  const creationTime = Date.now();
  taskItem.dataset.creationTime = creationTime;

  const intervalId = setInterval(() => {
    const currentTime = Date.now();
    const elapsedHours = (currentTime - creationTime) / (1000 * 60 * 60);

    if (elapsedHours >= FAILURE_HOURS) {
      clearInterval(intervalId);
      moveTaskToFailed(taskItem);
    } else if (elapsedHours >= WARNING_HOURS) {
      taskItem.classList.add("warning");
    }
  }, 15000);

  taskItem.dataset.intervalId = intervalId;
}

function updateTaskProgress(taskItem) {
  clearInterval(taskItem.dataset.intervalId);
  delete taskItem.dataset.creationTime;
  taskItem.classList.remove("warning");

  startTaskTimer(taskItem);

  const duration = parseInt(taskItem.dataset.duration, 10);
  const completed = parseInt(taskItem.dataset.completed, 10) + 1;
  taskItem.dataset.completed = completed;

  const progress = Math.floor((completed / duration) * 100);
  taskItem.querySelector(".progress-bar-inner").style.width = `${progress}%`;
  taskItem.querySelector("h3 span").textContent = `${progress}%`;

  if (progress >= 100) {
    moveTaskToCompleted(taskItem);
  } else {
    if (failedList.contains(taskItem)) {
      // Remove from "Failed" section and re-add to "Active"
      failedList.removeChild(taskItem);
      taskList.appendChild(taskItem);
      taskItem.classList.remove("failed");

      // Re-add the "Close" button
      const closeButton = document.createElement("button");
      closeButton.classList.add("close-task");
      closeButton.textContent = "Close";
      closeButton.addEventListener("click", () => {
        handleCloseTask(taskItem);
      });

      const taskButtons = taskItem.querySelector(".task-buttons");
      taskButtons.appendChild(closeButton);
    }
    updateCounts();
  }
}


function moveTaskToFailed(taskItem) {
  clearInterval(taskItem.dataset.intervalId);
  delete taskItem.dataset.intervalId;

  taskItem.classList.remove("warning");
  taskItem.classList.add("failed");

  // Remove the "Close" button
  const closeButton = taskItem.querySelector(".close-task");
  if (closeButton) {
    closeButton.remove();
  }

  failedList.appendChild(taskItem);
  updateCounts();
}


function moveTaskToCompleted(taskItem) {
  clearInterval(taskItem.dataset.intervalId);
  delete taskItem.dataset.intervalId;

  taskItem.classList.add("completed");
  taskItem.classList.remove("warning");

  // Remove "Update" and "Close" buttons
  const updateButton = taskItem.querySelector(".update-tracker");
  const closeButton = taskItem.querySelector(".close-task");

  if (updateButton) {
    updateButton.remove();
  }

  if (closeButton) {
    closeButton.remove();
  }

  // Ensure "Clone" button remains
  const cloneButton = taskItem.querySelector(".clone-button");
  if (!cloneButton) {
    const newCloneButton = document.createElement("button");
    newCloneButton.classList.add("clone-button");
    newCloneButton.textContent = "Clone";
    newCloneButton.addEventListener("click", (e) => {
      e.stopPropagation();
      const clonedTaskData = {
        name: taskItem.dataset.name,
        duration: taskItem.dataset.duration,
        notes: taskItem.dataset.notes,
        reminder: taskItem.dataset.reminder,
      };
      const clonedTask = createTaskElement(clonedTaskData);
      taskList.appendChild(clonedTask);
      updateCounts();
    });
    taskItem.querySelector(".task-buttons").appendChild(newCloneButton);
  }

  // Add to the completed list
  completedList.appendChild(taskItem);

  // Update XP
  const taskDuration = parseInt(taskItem.dataset.duration, 10);
  const xpGained = taskDuration * 50;
  totalXP += xpGained;
  currentLevelXP += xpGained;

  updateLevelProgress();
  document.getElementById("profile-total-xp").textContent = totalXP;

  updateCounts();
}


function updateCounts() {
  const activeCount = taskList.childElementCount;
  const completedCount = completedList.childElementCount;
  const failedCount = failedList.childElementCount;

  // Update the counters in the task sections
  document.getElementById("active-count").textContent = activeCount;
  document.getElementById("completed-count").textContent = completedCount;
  document.getElementById("failed-count").textContent = failedCount;

  // Update the counters in the user card
  document.getElementById("profile-active-count").textContent = activeCount;
  document.getElementById("profile-completed-count").textContent = completedCount;
  document.getElementById("profile-failed-count").textContent = failedCount;

  // Update the success rate in the user card
  const totalTasks = activeCount + completedCount + failedCount;
  const successRate =
    totalTasks > 0 ? Math.floor((completedCount / totalTasks) * 100) : 0;
  document.getElementById("profile-success-rate").textContent = `${successRate}%`;
}

// Dark Mode Toggle
const darkModeSwitch = document.getElementById("dark-mode-switch");

// Load saved preference from localStorage
if (localStorage.getItem("dark-mode") === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeSwitch.checked = true;
}

darkModeSwitch.addEventListener("change", () => {
  if (darkModeSwitch.checked) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("dark-mode", "enabled");
  } else {
    document.body.classList.remove("dark-mode");
    localStorage.setItem("dark-mode", "disabled");
  }
});

