const form = document.getElementById("raceForm");

const errorsBox = document.getElementById("errorsBox");
const errorsList = document.getElementById("errorsList");

const resultsBox = document.getElementById("resultsBox");
const currentSpeedEl = document.getElementById("currentSpeed");
const requiredSpeedEl = document.getElementById("requiredSpeed");
const remainingDistanceEl = document.getElementById("remainingDistance");
const remainingTimeEl = document.getElementById("remainingTime");
const statusBox = document.getElementById("statusBox");

const historyBody = document.getElementById("historyBody");
const clearHistoryBtn = document.getElementById("clearHistory");

let history = [];

function calculateCurrentSpeed(coveredDistance, elapsedTime) {
  if (elapsedTime <= 0) return 0;
  return coveredDistance / elapsedTime; // km/h
}

function calculateRequiredSpeed(totalDistance, coveredDistance, elapsedTime, targetTime) {
  const remainingDistance = totalDistance - coveredDistance;
  const remainingTime = targetTime - elapsedTime;
  if (remainingTime <= 0) return 0;
  return remainingDistance / remainingTime; // km/h
}

function formatSpeed(speed) {
  if (speed === 0) return "0.00 km/h";
  return `${speed.toFixed(2)} km/h`;
}

function formatTime(hours) {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours === 0) return `${minutes} minutes`;
  if (minutes === 0) return `${wholeHours} hours`;
  return `${wholeHours} hours ${minutes} minutes`;
}

function validateInput(totalDistance, coveredDistance, elapsedTime, targetTime) {
  const errors = [];

  if (!(totalDistance > 0)) errors.push("Total distance must be greater than 0");
  if (coveredDistance < 0) errors.push("Covered distance cannot be negative");
  if (coveredDistance > totalDistance) errors.push("Covered distance cannot exceed total distance");
  if (elapsedTime < 0) errors.push("Elapsed time cannot be negative");
  if (!(targetTime > 0)) errors.push("Target time must be greater than 0");
  if (elapsedTime >= targetTime) errors.push("Elapsed time cannot be greater than or equal to target time");

  return errors;
}

function showErrors(errors) {
  errorsList.innerHTML = "";
  errors.forEach(err => {
    const li = document.createElement("li");
    li.textContent = err;
    errorsList.appendChild(li);
  });
  errorsBox.style.display = errors.length ? "block" : "none";
}

function renderHistory() {
  historyBody.innerHTML = "";
  [...history].reverse().forEach(row => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    historyBody.appendChild(tr);
  });
}

clearHistoryBtn.addEventListener("click", () => {
  history = [];
  renderHistory();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const totalDistance = Number(document.getElementById("total_distance").value);
  const coveredDistance = Number(document.getElementById("covered_distance").value);
  const elapsedTime = Number(document.getElementById("elapsed_time").value);
  const targetTime = Number(document.getElementById("target_time").value);

  const errors = validateInput(totalDistance, coveredDistance, elapsedTime, targetTime);
  showErrors(errors);

  if (errors.length) {
    resultsBox.style.display = "none";
    return;
  }

  const currentSpeed = calculateCurrentSpeed(coveredDistance, elapsedTime);
  const requiredSpeed = calculateRequiredSpeed(totalDistance, coveredDistance, elapsedTime, targetTime);

  const remainingDistance = totalDistance - coveredDistance;
  const remainingTime = targetTime - elapsedTime;

  // Fill results
  currentSpeedEl.textContent = formatSpeed(currentSpeed);
  requiredSpeedEl.textContent = formatSpeed(requiredSpeed);
  remainingDistanceEl.textContent = `${remainingDistance.toFixed(2)} km`;
  remainingTimeEl.textContent = formatTime(remainingTime);

  // Status message (same logic as your PHP)
  if (requiredSpeed > currentSpeed && currentSpeed > 0) {
    statusBox.className = "speed-warning";
    statusBox.textContent = `⚠️ You need to increase your pace by ${formatSpeed(requiredSpeed - currentSpeed)} to meet your target time!`;
  } else if (requiredSpeed <= 0) {
    statusBox.className = "speed-warning";
    statusBox.textContent = "⚠️ Your target time has already been exceeded!";
  } else {
    statusBox.className = "speed-warning";
    statusBox.style.background = "#d4edda";
    statusBox.style.color = "#155724";
    statusBox.textContent = "✅ You're on track to meet your target time!";
  }

  resultsBox.style.display = "block";

  // Add to demo history (session only)
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  history.push([
    now,
    `${totalDistance} km`,
    `${coveredDistance} km`,
    `${elapsedTime} h`,
    `${targetTime} h`,
    formatSpeed(currentSpeed),
    formatSpeed(requiredSpeed),
  ]);

  renderHistory();
});
