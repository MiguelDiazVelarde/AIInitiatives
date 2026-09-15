import { Course, COURSES } from '../models/Course';

export class CourseService {
  static getAllCourses(): Course[] {
    return COURSES;
  }

  static getCourseById(id: string): Course | undefined {
    return COURSES.find(c => c.id === id);
  }
}
