// tests/gwaCalculator.test.js
// Run with: node --test tests/

// NOTE: the "zero units" test near the bottom of this file is
// expected to FAIL on the first run. See public/gwaCalculator.js for
// the intentional bug this test is designed to catch.

// Uses Node's built-in test runner (node:test) and assertion library (node:assert/strict)

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  InvalidInputError,
  gradeToPoint,
  validateCourse,
  computeSemesterGwa,
  computeCumulativeGwa,
  evaluateStanding,
} from "../public/gwaCalculator.js";

test("gradeToPoint — boundary values", () => {
  assert.equal(gradeToPoint(100), 1.00);
  assert.equal(gradeToPoint(97), 1.00);
  assert.equal(gradeToPoint(96), 1.25);
  assert.equal(gradeToPoint(94), 1.25);
  assert.equal(gradeToPoint(93), 1.50);
  assert.equal(gradeToPoint(91), 1.50);
  assert.equal(gradeToPoint(90), 1.75);
  assert.equal(gradeToPoint(88), 1.75);
  assert.equal(gradeToPoint(87), 2.00);
  assert.equal(gradeToPoint(85), 2.00);
  assert.equal(gradeToPoint(84), 2.50);
  assert.equal(gradeToPoint(80), 2.50);
  assert.equal(gradeToPoint(79), 3.00);
  assert.equal(gradeToPoint(75), 3.00);
  assert.equal(gradeToPoint(74), 5.00);
  assert.equal(gradeToPoint(65), 5.00);
});

test("validateCourse — accepts a valid course", () => {
  assert.doesNotThrow(() => validateCourse({ code: "CS101", units: 3, grade: 90 }));
});

test("validateCourse — rejects grade above 100", () => {
  assert.throws(
    () => validateCourse({ code: "CS101", units: 3, grade: 101 }),
    InvalidInputError
  );
});

test("validateCourse — rejects grade below 65", () => {
  assert.throws(
    () => validateCourse({ code: "CS101", units: 3, grade: 64 }),
    InvalidInputError
  );
});

test("validateCourse — rejects zero units", () => {
  assert.throws(
    () => validateCourse({ code: "CS101", units: 0, grade: 90 }),
    InvalidInputError
  );
});

test("validateCourse — rejects negative units", () => {
  assert.throws(
    () => validateCourse({ code: "CS101", units: -3, grade: 90 }),
    InvalidInputError
  );
});

test("computeSemesterGwa — basic weighted average", () => {
  const courses = [
    { code: "CS101", units: 3, grade: 90 },
    { code: "MATH101", units: 3, grade: 85 },
  ];
  const gwa = computeSemesterGwa(courses);
  assert.equal(gwa, (90 * 3 + 85 * 3) / 6);
});

test("computeSemesterGwa — single course", () => {
  const courses = [{ code: "CS101", units: 3, grade: 95 }];
  assert.equal(computeSemesterGwa(courses), 95);
});

test("computeSemesterGwa — NSTP excluded by default", () => {
  const courses = [
    { code: "CS101", units: 3, grade: 90 },
    { code: "NSTP-CWTS 1", units: 3, grade: 100, isNstp: true },
  ];
  assert.equal(computeSemesterGwa(courses), 90);
});

test("computeSemesterGwa — NSTP included when excludeNstp is false", () => {
  const courses = [
    { code: "CS101", units: 3, grade: 90 },
    { code: "NSTP-CWTS 1", units: 3, grade: 100, isNstp: true },
  ];
  const gwa = computeSemesterGwa(courses, false);
  assert.equal(gwa, (90 * 3 + 100 * 3) / 6);
});

test("computeSemesterGwa — rejects an invalid grade in the list", () => {
  const courses = [{ code: "CS101", units: 3, grade: 40 }];
  assert.throws(() => computeSemesterGwa(courses), InvalidInputError);
});

test("computeSemesterGwa — zero included units throws InvalidInputError", () => {
  // Pedagogical checkpoint: a semester consisting ONLY of an NSTP
  // course has zero *included* units once NSTP is excluded.
  // computeSemesterGwa must throw InvalidInputError here instead of
  // silently returning NaN. THIS TEST IS EXPECTED TO FAIL initially.
  const courses = [{ code: "NSTP-CWTS 1", units: 3, grade: 95, isNstp: true }];
  assert.throws(() => computeSemesterGwa(courses), InvalidInputError);
});

test("computeCumulativeGwa — across multiple semesters", () => {
  const sem1 = [{ code: "CS101", units: 3, grade: 90 }];
  const sem2 = [{ code: "CS102", units: 3, grade: 94 }];
  const cumulative = computeCumulativeGwa([sem1, sem2]);
  assert.equal(cumulative, (90 * 3 + 94 * 3) / 6);
});

test("computeCumulativeGwa — excludes NSTP across semesters", () => {
  const sem1 = [
    { code: "CS101", units: 3, grade: 90 },
    { code: "NSTP-CWTS 1", units: 3, grade: 100, isNstp: true },
  ];
  const sem2 = [{ code: "CS102", units: 3, grade: 94 }];
  const cumulative = computeCumulativeGwa([sem1, sem2]);
  assert.equal(cumulative, (90 * 3 + 94 * 3) / 6);
});

test("evaluateStanding — thresholds", () => {
  assert.equal(evaluateStanding(95), "Summa Cum Laude Standing");
  assert.equal(evaluateStanding(93), "Summa Cum Laude Standing");
  assert.equal(evaluateStanding(92), "Magna Cum Laude Standing");
  assert.equal(evaluateStanding(91), "Magna Cum Laude Standing");
  assert.equal(evaluateStanding(90), "Cum Laude Standing");
  assert.equal(evaluateStanding(88), "Cum Laude Standing");
  assert.equal(evaluateStanding(87.9), "In Good Standing / Regular");
  assert.equal(evaluateStanding(75), "In Good Standing / Regular");
});