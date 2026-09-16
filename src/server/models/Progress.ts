export type ProgressStatus = 'started' | 'in-progress' | 'completed';

export interface ProgressEntry {
  id: string;
  userId: string;
  username: string;
  courseId: string;
  courseName: string;
  module: string;
  technique: string;
  minutesStudied: number;
  status: ProgressStatus;
  notes: string;
  timestamp: string;
}

export interface CreateProgressRequest {
  courseId: string;
  module: string;
  technique: string;
  minutesStudied: number;
  status: ProgressStatus;
  notes?: string;
}

export interface CourseStats {
  courseId: string;
  courseName: string;
  sessions: number;
  totalMinutes: number;
  modulesCompleted: number;
  totalModules: number;
  completionPercentage: number;
  lastStudied: string | null;
  techniqueBreakdown: Record<string, number>;
}

export interface OverallStats {
  totalSessions: number;
  totalMinutes: number;
  coursesStarted: number;
  studyStreakDays: number;
  favoriteTechnique: string | null;
  byCourse: CourseStats[];
}
