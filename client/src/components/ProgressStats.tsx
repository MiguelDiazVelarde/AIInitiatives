import React from 'react';
import { OverallStats } from '../types';

interface ProgressStatsProps {
  stats: OverallStats | null;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ stats }) => {
  if (!stats || stats.totalSessions === 0) {
    return (
      <div className="no-stats">
        <p>Todavía no hay avance registrado. ¡Registra tu primera sesión de estudio!</p>
      </div>
    );
  }

  return (
    <div className="progress-stats">
      <div className="stats-summary">
        <div className="stat-box">
          <span className="stat-value">{stats.totalSessions}</span>
          <span className="stat-label">Sesiones</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{stats.totalMinutes}</span>
          <span className="stat-label">Minutos estudiados</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{stats.coursesStarted}</span>
          <span className="stat-label">Cursos iniciados</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{stats.studyStreakDays}</span>
          <span className="stat-label">Días seguidos</span>
        </div>
      </div>

      {stats.favoriteTechnique && (
        <p className="favorite-technique">
          Técnica más usada: <strong>{stats.favoriteTechnique}</strong>
        </p>
      )}

      <div className="course-stats-list">
        {stats.byCourse.map((courseStat) => (
          <div key={courseStat.courseId} className="course-stat-card">
            <h4>{courseStat.courseName}</h4>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${courseStat.completionPercentage}%` }}
              />
            </div>
            <p>{courseStat.completionPercentage}% completado ({courseStat.modulesCompleted}/{courseStat.totalModules} módulos)</p>
            <p>{courseStat.sessions} sesiones · {courseStat.totalMinutes} minutos</p>
            {courseStat.lastStudied && (
              <p className="last-studied">
                Última sesión: {new Date(courseStat.lastStudied).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressStats;
