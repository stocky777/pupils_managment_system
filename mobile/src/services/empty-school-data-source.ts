import type { SchoolDataSource } from "@/services/school-data-source";

/**
 * Initial data source used before SQLite or the backend API is connected.
 * It intentionally contains no teacher, pupil, class, or attendance records.
 */
export class EmptySchoolDataSource implements SchoolDataSource {
  async getCurrentTeacher() { return null; }
  async getNextClass() { return null; }
  async getTodaySchedule() { return []; }
  async getWeeklySchedule() { return []; }
  async getClasses() { return []; }
  async getAttendanceSummary() { return null; }
  async getClassRegister(_classId: string) { return null; }
}
