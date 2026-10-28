/**
 * College GWA Calculator — DOM / UI logic
 */

import { computeSemesterGwa, evaluateStanding } from "./gwaCalculator.js";

let semesterCounter = 0;
let courseCounter = 0;

/** In-memory state: array of { id, label, courses: [{id, code, units, grade, isNstp}] } */
const state = { semesters: [] };

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createCourse() {
  courseCounter += 1;
  return { id: uid("course"), code: `Course ${courseCounter}`, units: 3, grade: 90, isNstp: false };
}

function createSemester() {
  semesterCounter += 1;
  return { id: uid("sem"), label: `Semester ${semesterCounter}`, courses: [createCourse()] };
}

function addSemester() {
  state.semesters.push(createSemester());
  render();
}

function removeSemester(semId) {
  state.semesters = state.semesters.filter((s) => s.id !== semId);
  render();
}

function addCourse(semId) {
  const sem = state.semesters.find((s) => s.id === semId);
  if (sem) sem.courses.push(createCourse());
  render();
}

function removeCourse(semId, courseId) {
  const sem = state.semesters.find((s) => s.id === semId);
  if (sem) sem.courses = sem.courses.filter((c) => c.id !== courseId);
  render();
}

function updateCourseField(semId, courseId, field, value) {
  const sem = state.semesters.find((s) => s.id === semId);
  if (!sem) return;
  const course = sem.courses.find((c) => c.id === courseId);
  if (!course) return;
  if (field === "units" || field === "grade") {
    course[field] = Number(value);
  } else {
    course[field] = value;
  }
  computeAndRenderResults();
}

function computeAndRenderResults() {
  const errorBox = document.getElementById("error-box");
  const semResultsEl = document.getElementById("semester-results");
  const overallEl = document.getElementById("overall-gwa");
  const standingEl = document.getElementById("academic-standing");

  errorBox.hidden = true;
  errorBox.textContent = "";
  semResultsEl.innerHTML = "";

  try {
    let grandWeighted = 0;
    let grandUnits = 0;

    state.semesters.forEach((sem) => {
      const gwa = computeSemesterGwa(sem.courses);
      const row = document.createElement("div");
      row.className = "semester-result-row";
      row.innerHTML = `<span class="result-label">${sem.label} GWA:</span>
        <span class="result-value">${gwa.toFixed(2)}</span>`;
      semResultsEl.appendChild(row);

      const included = sem.courses.filter((c) => !c.isNstp);
      grandWeighted += included.reduce((s, c) => s + c.grade * c.units, 0);
      grandUnits += included.reduce((s, c) => s + c.units, 0);
    });

    if (grandUnits > 0) {
      const overallGwa = grandWeighted / grandUnits;
      overallEl.textContent = overallGwa.toFixed(2);
      standingEl.textContent = evaluateStanding(overallGwa);
    } else {
      overallEl.textContent = "--";
      standingEl.textContent = "--";
    }
  } catch (err) {
    errorBox.hidden = false;
    errorBox.textContent = err.message;
    overallEl.textContent = "--";
    standingEl.textContent = "--";
  }
}

function render() {
  const container = document.getElementById("semesters-container");
  container.innerHTML = "";

  state.semesters.forEach((sem) => {
    const semEl = document.createElement("div");
    semEl.className = "semester-card";

    const header = document.createElement("div");
    header.className = "semester-card-header";
    header.innerHTML = `
      <input type="text" class="semester-label-input" value="${sem.label}" data-sem="${sem.id}">
      <div class="semester-actions">
        <button type="button" class="btn btn-secondary add-course-btn" data-sem="${sem.id}">+ Add Course</button>
        <button type="button" class="btn btn-danger remove-semester-btn" data-sem="${sem.id}">Remove Semester</button>
      </div>`;
    semEl.appendChild(header);

    const table = document.createElement("table");
    table.className = "course-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Course Code</th>
          <th>Units</th>
          <th>Numerical Grade</th>
          <th>Is NSTP?</th>
          <th></th>
        </tr>
      </thead>
      <tbody></tbody>`;
    const tbody = table.querySelector("tbody");

    sem.courses.forEach((course) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input type="text" class="course-code-input" value="${course.code}"
              data-sem="${sem.id}" data-course="${course.id}" data-field="code"></td>
        <td><input type="number" min="0.5" step="0.5" class="course-units-input" value="${course.units}"
              data-sem="${sem.id}" data-course="${course.id}" data-field="units"></td>
        <td><input type="number" min="65" max="100" step="1" class="course-grade-input" value="${course.grade}"
              data-sem="${sem.id}" data-course="${course.id}" data-field="grade"></td>
        <td class="center"><input type="checkbox" class="course-nstp-input" ${course.isNstp ? "checked" : ""}
              data-sem="${sem.id}" data-course="${course.id}" data-field="isNstp"></td>
        <td><button type="button" class="btn btn-danger btn-small remove-course-btn"
              data-sem="${sem.id}" data-course="${course.id}">Remove</button></td>`;
      tbody.appendChild(tr);
    });

    semEl.appendChild(table);
    container.appendChild(semEl);
  });

  attachDynamicListeners();
  computeAndRenderResults();
}

function attachDynamicListeners() {
  document.querySelectorAll(".add-course-btn").forEach((btn) => {
    btn.addEventListener("click", () => addCourse(btn.dataset.sem));
  });
  document.querySelectorAll(".remove-semester-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeSemester(btn.dataset.sem));
  });
  document.querySelectorAll(".remove-course-btn").forEach((btn) => {
    btn.addEventListener("click", () => removeCourse(btn.dataset.sem, btn.dataset.course));
  });
  document.querySelectorAll(".semester-label-input").forEach((input) => {
    input.addEventListener("change", () => {
      const sem = state.semesters.find((s) => s.id === input.dataset.sem);
      if (sem) sem.label = input.value;
    });
  });
  document.querySelectorAll(
    ".course-code-input, .course-units-input, .course-grade-input, .course-nstp-input"
  ).forEach((input) => {
    const eventName = input.type === "checkbox" ? "change" : "input";
    input.addEventListener(eventName, () => {
      const field = input.dataset.field;
      const value = input.type === "checkbox" ? input.checked : input.value;
      updateCourseField(input.dataset.sem, input.dataset.course, field, value);
    });
  });
}

document.getElementById("add-semester-btn").addEventListener("click", addSemester);

// Bootstrap with one semester so the UI is never empty.
addSemester();