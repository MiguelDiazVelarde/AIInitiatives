import React from 'react';
import { Course } from '../types';

interface CourseListProps {
  courses: Course[];
  onRegisterProgress: (course: Course) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onRegisterProgress }) => {
  if (courses.length === 0) {
    return (
      <div className="no-courses">
        <p>No hay cursos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="course-list">
      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <span className="course-category">{course.category}</span>
            <h3>{course.name}</h3>
            <p className="course-description">{course.description}</p>
            <p className="course-level">Nivel: {course.level}</p>
            <div className="course-techniques">
              {course.recommendedTechniques.map((technique) => (
                <span key={technique} className="technique-badge">{technique}</span>
              ))}
            </div>
            <ul className="course-modules">
              {course.modules.map((module) => (
                <li key={module}>{module}</li>
              ))}
            </ul>
            <div className="course-actions">
              <button
                onClick={() => onRegisterProgress(course)}
                className="register-progress-btn"
              >
                Registrar avance
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
