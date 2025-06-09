import { AttendanceSession } from "@/types/attendance";

/**
 * Determines the status of an attendance session based on its start time, end time, and active state
 */
export function getSessionStatus(session: AttendanceSession): "active" | "upcoming" | "past" {
  const now = new Date();
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  if (session.is_active && endTime > now) {
    return "active";
  } else if (startTime > now) {
    return "upcoming";
  } else {
    return "past";
  }
}

/**
 * Formats a date for display
 */
export function formatSessionDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

/**
 * Formats a time for display
 */
export function formatSessionTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * Calculates the attendance percentage
 */
export function calculateAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

/**
 * Gets the color for attendance percentage display
 */
export function getAttendanceRateColor(rate: number): string {
  if (rate >= 80) return "bg-green-600";
  if (rate >= 60) return "bg-yellow-500";
  return "bg-red-500";
}
