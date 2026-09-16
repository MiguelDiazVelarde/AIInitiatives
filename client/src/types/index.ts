export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  createdAt?: Date;
}

export const OAKLEY_TECHNIQUES = [
  'Focused and diffuse mode',
  'Active recall',
  'Spaced repetition',
  'Chunking',
  'Interleaving',
  'Pomodoro technique',
  'Analogies and metaphors',
  'Teach what you learned (Feynman technique)',
] as const;

export interface CourseModule {
  id: string;
  title: string;
  objectives: string[];
  content: string[];
  technique: string;
  estimatedMinutes: number;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  modules: CourseModule[];
  recommendedTechniques: string[];
}

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

export interface CreateProgressData {
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

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}