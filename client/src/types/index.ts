export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  createdAt?: Date;
}

export const OAKLEY_TECHNIQUES = [
  'Modo enfocado y difuso',
  'Recuerdo activo',
  'Repetición espaciada',
  'Fragmentación (chunking)',
  'Intercalado (interleaving)',
  'Técnica Pomodoro',
  'Analogías y metáforas',
  'Enseñar lo aprendido (técnica Feynman)',
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

export type ProgressStatus = 'iniciado' | 'en-progreso' | 'completado';

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