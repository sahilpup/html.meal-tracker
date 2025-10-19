// ========== DOM ELEMENTS ==========
const loginPage = document.getElementById("login-page");
const mainPage = document.getElementById("main-page");
const loginBtn = document.getElementById("login-btn");
const passwordInput = document.getElementById("admin-password");
const logoutBtn = document.getElementById("logout-btn");

const addStudentBtn = document.getElementById("add-student");
const studentNameInput = document.getElementById("student-name");
const studentList = document.getElementById("student-list");
const attendanceList = document.getElementById("attendance-list");
const attendanceDate = document.getElementById("attendance-date");
const mealSelect = document.getElementById("meal-select");
const saveAttendanceBtn = document.getElementById("save-attendance");
const summary = document.getElementById("summary");
const attendanceHistory = document.getElementById("attendance-history");
const clearDataBtn = document.getElementById("clear-data");

const ADMIN_PASSWORD = "Sahilmuskan"; // You can change this

// ========== DATA ==========
let isAdmin = false;
let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

// ========== LOGIN ==========
loginBtn.onclick = () => {
  const password = passwordInput.value.trim();
  if (password === ADMIN_PASSWORD) {
    isAdmin = true;
    localStorage.setItem("isAdmin", true);
    showMainPage();
  } else {
    alert("Incorrect password. View-only mode enabled.");
    isAdmin = false;
    localStorage.setItem("isAdmin", false);
    showMainPage();
  }
};

logoutBtn.onclick = () => {
  localStorage.removeItem("isAdmin");
  window.location.reload();
};

function showMainPage() {
  loginPage.style.display = "none";
  mainPage.style.display = "block";

  // Hide admin-only features if not admin
  document.querySelectorAll(".admin-only").forEach((el) => {
    el.style.display = isAdmin ? "block" : "none";
  });

  renderStudents();
  renderAttendanceList();
  renderSummary();
  renderHistory();
}

// ========== DATA SAVE / LOAD ==========
function saveData() {
  localStorage.setItem("students", JSON.stringify(students));
  localStorage.setItem("attendance", JSON.stringify(attendance));
}

// ========== STUDENTS ==========
function renderStudents() {
  studentList.innerHTML = "";
  students.forEach((student, index) => {
    const li = document.createElement("li");
    li.textContent = student;

    if (isAdmin) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "delete-btn";
      delBtn.onclick = () => {
        students.splice(index, 1);
        saveData();
        renderStudents();
        renderAttendanceList();
        renderSummary();
      };
      li.appendChild(delBtn);
    }

    studentList.appendChild(li);
  });
}

addStudentBtn.onclick = () => {
  const name = studentNameInput.value.trim();
  if (name && !students.includes(name)) {
    students.push(name);
    saveData();
    renderStudents();
    renderAttendanceList();
    studentNameInput.value = "";
  }
};

// ========== ATTENDANCE ==========
function renderAttendanceList() {
  attendanceList.innerHTML = "";
  students.forEach((student) => {
    const div = document.createElement("div");
    div.className = "attendance-item";
    div.innerHTML = `
      <span>${student}</span>
      ${
        isAdmin
          ? `<select id="status-${student}">
              <option value="Ate">Ate</option>
              <option value="Skipped">Skipped</option>
            </select>`
          : ""
      }
    `;
    attendanceList.appendChild(div);
  });
}

saveAttendanceBtn.onclick = () => {
  if (!isAdmin) return alert("Only admin can mark attendance.");
  const date = attendanceDate.value;
  const meal = mealSelect.value;
  if (!date) {
    alert("Please select a date.");
    return;
  }

  let record = { date, meal, data: [] };
  students.forEach((student) => {
    const status = document.getElementById(`status-${student}`).value;
    record.data.push({ student, status });
  });
  attendance.push(record);
  saveData();
  renderSummary();
  renderHistory();
};

// ========== SUMMARY ==========
function renderSummary() {
  if (attendance.length === 0) {
    summary.textContent = "No data yet";
    return;
  }

  let text = "";
  let totalAte = 0,
    totalSkipped = 0;

  students.forEach((student) => {
    const meals = { Breakfast: "-", Lunch: "-", Dinner: "-" };
    let ateCount = 0,
      skipCount = 0;

    attendance.forEach((a) => {
      a.data.forEach((entry) => {
        if (entry.student === student) {
          meals[a.meal] = entry.status;
          if (entry.status === "Ate") ateCount++;
          else skipCount++;
        }
      });
    });

    totalAte += ateCount;
    totalSkipped += skipCount;

    text += `<b>${student}</b>: 🍳 ${meals.Breakfast}, 🍛 ${meals.Lunch}, 🍽️ ${meals.Dinner}
             <br>✅ Ate: ${ateCount} | ❌ Skipped: ${skipCount}<br><br>`;
  });

  text += `<hr><b>Total Meals Ate:</b> ${totalAte} | <b>Skipped:</b> ${totalSkipped}`;
  summary.innerHTML = text;
}

// ========== HISTORY ==========
function renderHistory() {
  attendanceHistory.innerHTML = `
    <table class="history-table">
      <tr><th>Date</th><th>Meal</th><th>Student</th><th>Status</th></tr>
      ${attendance
        .map((a) =>
          a.data
            .map(
              (entry) => `
          <tr>
            <td>${a.date}</td>
            <td>${a.meal}</td>
            <td>${entry.student}</td>
            <td class="status-${entry.status}">${entry.status}</td>
          </tr>
        `
            )
            .join("")
        )
        .join("")}
    </table>
  `;
}

// ========== CLEAR DATA ==========
clearDataBtn.onclick = () => {
  if (!isAdmin) return alert("Only admin can clear data.");
  if (confirm("Clear all data?")) {
    students = [];
    attendance = [];
    saveData();
    renderStudents();
    renderAttendanceList();
    renderSummary();
    renderHistory();
  }
};

// ========== AUTO LOGIN MODE ==========
window.onload = () => {
  const saved = localStorage.getItem("isAdmin");
  if (saved !== null) {
    isAdmin = saved === "true";
    showMainPage();
  }
};
