import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';
import { ProgressEntry, CreateProgressRequest, CourseStats, OverallStats } from '../models/Progress';
import { CourseService } from './CourseService';

// Student progress is logged to a plain file (CSV) so statistics can be
// generated without depending on a database.
const DATA_DIR = path.join(__dirname, '../../../data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress-log.csv');
const CSV_HEADER = 'id,userId,username,courseId,courseName,module,technique,minutesStudied,status,notes,timestamp';

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(PROGRESS_FILE, `${CSV_HEADER}\n`, 'utf-8');
  }
}

function escapeCsv(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function rowToEntry(row: string[]): ProgressEntry {
  const [id, userId, username, courseId, courseName, module, technique, minutesStudied, status, notes, timestamp] = row;
  return {
    id,
    userId,
    username,
    courseId,
    courseName,
    module,
    technique,
    minutesStudied: Number(minutesStudied) || 0,
    status: status as ProgressEntry['status'],
    notes,
    timestamp,
  };
}

export class ProgressService {
  static addEntry(userId: string, username: string, data: CreateProgressRequest): ProgressEntry {
    ensureFile();

    const course = CourseService.getCourseById(data.courseId);
    const entry: ProgressEntry = {
      id: uuidv4(),
      userId,
      username,
      courseId: data.courseId,
      courseName: course?.name ?? data.courseId,
      module: data.module,
      technique: data.technique,
      minutesStudied: data.minutesStudied,
      status: data.status,
      notes: data.notes ?? '',
      timestamp: new Date().toISOString(),
    };

    const line = [
      entry.id,
      entry.userId,
      entry.username,
      entry.courseId,
      entry.courseName,
      entry.module,
      entry.technique,
      entry.minutesStudied,
      entry.status,
      entry.notes,
      entry.timestamp,
    ].map(escapeCsv).join(',');

    fs.appendFileSync(PROGRESS_FILE, `${line}\n`, 'utf-8');
    return entry;
  }

  static getAllEntries(): ProgressEntry[] {
    ensureFile();
    const content = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    const [, ...dataLines] = lines; // skip header
    return dataLines.map(line => rowToEntry(parseCsvLine(line)));
  }

  static getEntriesByUser(userId: string): ProgressEntry[] {
    return this.getAllEntries().filter(e => e.userId === userId);
  }

  static getStatsForUser(userId: string): OverallStats {
    const entries = this.getEntriesByUser(userId);
    const courses = CourseService.getAllCourses();

    const byCourse: CourseStats[] = courses
      .map(course => {
        const courseEntries = entries.filter(e => e.courseId === course.id);
        if (courseEntries.length === 0) {
          return null;
        }

        const modulesCompleted = new Set(
          courseEntries.filter(e => e.status === 'completed').map(e => e.module)
        ).size;

        const techniqueBreakdown: Record<string, number> = {};
        for (const e of courseEntries) {
          techniqueBreakdown[e.technique] = (techniqueBreakdown[e.technique] ?? 0) + 1;
        }

        const lastStudied = courseEntries
          .map(e => e.timestamp)
          .sort((a, b) => a.localeCompare(b))
          .at(-1) ?? null;

        return {
          courseId: course.id,
          courseName: course.name,
          sessions: courseEntries.length,
          totalMinutes: courseEntries.reduce((sum, e) => sum + e.minutesStudied, 0),
          modulesCompleted,
          totalModules: course.modules.length,
          completionPercentage: Math.round((modulesCompleted / course.modules.length) * 100),
          lastStudied,
          techniqueBreakdown,
        } satisfies CourseStats;
      })
      .filter((s): s is CourseStats => s !== null);

    const studyDays = new Set(entries.map(e => e.timestamp.slice(0, 10)));
    const studyStreakDays = calculateStreak(studyDays);

    const techniqueCounts: Record<string, number> = {};
    for (const e of entries) {
      techniqueCounts[e.technique] = (techniqueCounts[e.technique] ?? 0) + 1;
    }
    const favoriteTechnique = Object.entries(techniqueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      totalSessions: entries.length,
      totalMinutes: entries.reduce((sum, e) => sum + e.minutesStudied, 0),
      coursesStarted: byCourse.length,
      studyStreakDays,
      favoriteTechnique,
      byCourse,
    };
  }
}

function calculateStreak(studyDays: Set<string>): number {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (studyDays.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
