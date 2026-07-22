import type {
  AttendanceSummary,
  ClassRegister,
  SchoolClass,
  Teacher,
  TimetableSession,
} from "@/models/school";

/** Defines all school information needed by the current interface. */
export interface SchoolDataSource {
  getCurrentTeacher(): Promise<Teacher | null>;
  getNextClass(): Promise<TimetableSession | null>;
  getTodaySchedule(): Promise<TimetableSession[]>;
  getWeeklySchedule(): Promise<TimetableSession[]>;
  getClasses(): Promise<SchoolClass[]>;
  getAttendanceSummary(): Promise<AttendanceSummary | null>;
  getClassRegister(classId: string): Promise<ClassRegister | null>;
}
