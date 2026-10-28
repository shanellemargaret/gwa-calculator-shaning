export class InvalidInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidInputError";
  }
}

export const GRADE_POINT_TABLE = [
  [97, 1.00],
  [94, 1.25],
  [91, 1.50],
  [88, 1.75],
  [85, 2.00],
  [80, 2.50],
  [75, 3.00],
];

export function gradeToPoint(grade) {
  for (const [threshold, point] of GRADE_POINT_TABLE) {
    if (grade >= threshold) return point;
  }
  return 5.00; // Below 75 => Failed
}

export function validateCourse(course) {
  if (!(course.units > 0)) {
    throw new InvalidInputError(
      `Units for "${course.code}" must be greater than 0.`
    );
  }
  if (!(course.grade >= 65 && course.grade <= 100)) {
    throw new InvalidInputError(
      `Grade for "${course.code}" must be between 65 and 100 (got ${course.grade}).`
    );
  }
}

export function computeSemesterGwa(courses, excludeNstp = true) {
  const included = courses.filter((c) => !(excludeNstp && c.isNstp));
  included.forEach(validateCourse);

  const totalWeighted = included.reduce((sum, c) => sum + c.grade * c.units, 0);
  const totalUnits = included.reduce((sum, c) => sum + c.units, 0);

  // INTENTIONAL BUG (workshop checkpoint): totalUnits can
  // legitimately be 0 (e.g. an NSTP-only semester). This should
  // guard and throw InvalidInputError, but it does not yet
  return totalWeighted / totalUnits;
}

export function computeCumulativeGwa(semesters, excludeNstp = true) {
  const allCourses = semesters.flat();
  const included = allCourses.filter((c) => !(excludeNstp && c.isNstp));
  included.forEach(validateCourse);

  const totalWeighted = included.reduce((sum, c) => sum + c.grade * c.units, 0);
  const totalUnits = included.reduce((sum, c) => sum + c.units, 0);
  return totalWeighted / totalUnits;
}

export function evaluateStanding(cumulativeGwaOn100Scale) {
  if (cumulativeGwaOn100Scale >= 93) return "Summa Cum Laude Standing";
  if (cumulativeGwaOn100Scale >= 91) return "Magna Cum Laude Standing";
  if (cumulativeGwaOn100Scale >= 88) return "Cum Laude Standing";
  return "In Good Standing / Regular";
}