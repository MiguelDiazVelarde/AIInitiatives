import React, { useState } from 'react';
import { Course } from '../types';

interface CourseListProps {
  courses: Course[];
  onRegisterProgress: (course: Course) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onRegisterProgress }) => {
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  if (courses.length === 0) {
    return (
      <div className="no-courses">
        <p>No courses available.</p>
      </div>
    );
  }

  return (
    <div className="course-list">
      <div className="courses-grid">
        {courses.map((course) => {
          const isExpanded = expandedCourseId === course.id;
          return (
            <div key={course.id} className="course-card">
              <span className="course-category">{course.category}</span>
              <h3>{course.name}</h3>
              <p className="course-description">{course.description}</p>
              <p className="course-level">Level: {course.level}</p>
              <div className="course-techniques">
                {course.recommendedTechniques.map((technique) => (
                  <span key={technique} className="technique-badge">{technique}</span>
                ))}
              </div>

              <button
                type="button"
                className="toggle-syllabus-btn"
                onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
              >
                {isExpanded ? 'Hide syllabus' : `View syllabus (${course.modules.length} modules)`}
              </button>

              {isExpanded && (
                <ol className="course-modules">
                  {course.modules.map((module) => (
                    <li key={module.id} className="course-module-item">
                      <div className="module-title-row">
                        <span className="module-title">{module.title}</span>
                        <span className="module-duration">{module.estimatedMinutes} min</span>
                      </div>
                      <span className="technique-badge module-technique">{module.technique}</span>
                      <p className="module-subheading">Objectives</p>
                      <ul>
                        {module.objectives.map((objective) => (
                          <li key={objective}>{objective}</li>
                        ))}
                      </ul>
                      <p className="module-subheading">Content</p>
                      <ul>
                        {module.content.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              )}

              <div className="course-actions">
                <button
                  onClick={() => onRegisterProgress(course)}
                  className="register-progress-btn"
                >
                  Register progress
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseList;

