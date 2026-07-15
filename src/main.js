// --- CONFIG ---
// Local storage key for keeping your routine history
const STORAGE_KEY = "routine_tracker_history";

// --- SCHEDULE DATA ---
const schedule = [
  {
    id: "task1",
    time: "07:00 AM - 08:00 AM",
    title: "Morning Cardio",
    desc: "1 hour on the treadmill. Hydrate.",
  },
  {
    id: "task2",
    time: "08:00 AM - 08:45 AM",
    title: "Fuel Window & Prep",
    desc: "Breakfast, shower, prep desk.",
  },
  {
    id: "task3",
    time: "08:45 AM - 10:45 AM",
    title: "German Block 1: Schritte & AI",
    desc: "A2.1 Review. Chapters & AI drills.",
  },
  {
    id: "task4",
    time: "10:45 AM - 11:00 AM",
    title: "Forced Buffer",
    desc: "15-Minute Rest. No screens.",
  },
  {
    id: "task5",
    time: "11:00 AM - 12:30 PM",
    title: "German Block 2: Zaban Master",
    desc: "Course watching, active notes.",
  },
  {
    id: "task6",
    time: "12:30 PM - 01:30 PM",
    title: "Lunch & Brain Reset",
    desc: "Completely disconnect from study.",
  },
  {
    id: "task7",
    time: "01:30 PM - 03:30 PM",
    title: "Tech Block 1: C# & .NET Core",
    desc: "Variables, OOP, LINQ, APIs.",
  },
  {
    id: "task8",
    time: "03:30 PM - 03:45 PM",
    title: "Forced Buffer",
    desc: "15-Minute Rest. Stretch.",
  },
  {
    id: "task9",
    time: "03:45 PM - 05:45 PM",
    title: "Tech Block 2: SQL & Databases",
    desc: "CRUD, design, EF Core.",
  },
  {
    id: "task10",
    time: "05:45 PM - 06:00 PM",
    title: "Transitional Buffer",
    desc: "Close IDE. Prep for walk.",
  },
  {
    id: "task11",
    time: "06:00 PM - 07:00 PM",
    title: "Afternoon Walk",
    desc: "1 hour walking outside.",
  },
  {
    id: "task12",
    time: "07:00 PM - 08:00 PM",
    title: "Dinner & Wind Down",
    desc: "Eat, relax, family time.",
  },
  {
    id: "task13",
    time: "08:00 PM - 09:30 PM",
    title: "Tech Block 3: Project Building",
    desc: "Build backend connecting C# to SQL.",
  },
  {
    id: "task14",
    time: "09:30 PM - 10:15 PM",
    title: "German Block 3: Vocab & Immersion",
    desc: "Flashcards, YouTube/Show.",
  },
  {
    id: "task15",
    time: "10:15 PM - 10:30 PM",
    title: "Executive Shutdown",
    desc: "Clear desk, log wins, sleep.",
  },
];

const todayDateString = new Date().toISOString().split("T")[0];
let todayData = {};
let dbHistory = [];

function init() {
  // 1. Fetch data from local storage
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    dbHistory = savedData ? JSON.parse(savedData) : [];
  } catch (e) {
    console.error("Local Storage Reading Failed", e);
    dbHistory = [];
  }

  // 2. Find today's data in the stored history
  const todayRecord = dbHistory.find(
    (record) => record.date === todayDateString,
  );

  if (todayRecord && todayRecord.tasks) {
    todayData = todayRecord.tasks;
  } else {
    // Initialize today's tasks if they don't exist
    todayData = {};
    schedule.forEach((t) => (todayData[t.id] = false));
  }

  renderTasks();
  renderHabitTracker();
}

function toggleTask(id) {
  todayData[id] = !todayData[id];

  // Calculate percentage
  const completedCount = Object.values(todayData).filter(Boolean).length;
  const percentage = Math.round((completedCount / schedule.length) * 100);

  // Update or insert today's entry in our history array
  const recordIndex = dbHistory.findIndex((r) => r.date === todayDateString);
  const updatedRecord = {
    date: todayDateString,
    tasks: todayData,
    percentage,
  };

  if (recordIndex !== -1) {
    dbHistory[recordIndex] = updatedRecord;
  } else {
    dbHistory.push(updatedRecord);
  }

  // Save to local storage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dbHistory));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }

  // Instantly update the entire UI
  renderTasks();
  renderHabitTracker();
}

function renderTasks() {
  const taskListEl = document.getElementById("task-list");
  taskListEl.innerHTML = "";

  schedule.forEach((task) => {
    const isChecked = todayData[task.id];
    const card = document.createElement("div");
    card.className = `task-card ${isChecked ? "completed" : ""}`;
    card.onclick = (e) => {
      if (e.target.tagName !== "INPUT") toggleTask(task.id);
    };

    card.innerHTML = `
            <div class="mt-1"><input type="checkbox" class="w-6 h-6 text-green-600 rounded cursor-pointer pointer-events-none" ${isChecked ? "checked" : ""}></div>
            <div>
                <p class="text-xs font-bold text-green-600">${task.time}</p>
                <h3 class="text-md font-semibold ${isChecked ? "line-through text-gray-500" : "text-gray-900"}">${task.title}</h3>
                <p class="text-sm text-gray-500 mt-1">${task.desc}</p>
            </div>
        `;
    taskListEl.appendChild(card);
  });

  updateProgress();
}

let congratsShown = sessionStorage.getItem("congratsShown") === "true";

function updateProgress() {
  const completedCount = Object.values(todayData).filter(Boolean).length;
  const percentage = Math.round((completedCount / schedule.length) * 100);

  document.getElementById("progress-text").innerText = `${percentage}%`;
  document.getElementById("progress-bar").style.width = `${percentage}%`;

  if (percentage === 100 && !congratsShown) {
    sessionStorage.setItem("congratsShown", "true");
    congratsShown = true;
    document.getElementById("congrats-modal").classList.remove("hidden");
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }
}

function renderHabitTracker() {
  const grid = document.getElementById("habit-grid");
  grid.innerHTML = "";

  // Loop past 28 days to create a nice 4x7 grid
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Find this date in our stored history
    const record = dbHistory.find((r) => r.date === dateStr);
    const dayPercent = record ? record.percentage : 0;

    // Determine color
    let colorClass = "bg-gray-100";
    if (dayPercent > 0) colorClass = "bg-green-200";
    if (dayPercent > 33) colorClass = "bg-green-400";
    if (dayPercent > 66) colorClass = "bg-green-600";
    if (dayPercent === 100) colorClass = "bg-green-800";

    const square = document.createElement("div");
    square.className = `w-full aspect-square rounded-md ${colorClass} ${i === 0 ? "ring-2 ring-blue-400 ring-offset-2" : ""}`;
    grid.appendChild(square);
  }
}

// Start the app
init();

// Register Service Worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope,
        );
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });
}
