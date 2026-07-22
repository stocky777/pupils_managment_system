export type AttendanceStatus = "present" | "absent" | "late";

export interface Teacher {
  id: string;
  firstName: string;
  initials: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  details?: string;
}

export interface TimetableSession {
  id: string;
  classId: string;
  name: string;
  startTime: string;
  endTime?: string;
  room?: string;
}

export interface Pupil {
  id: string;
  displayName: string;
}

export interface ClassRegister {
  classId: string;
  className: string;
  sessionDetails?: string;
  pupils: Pupil[];
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  updatedAt?: string;
}
