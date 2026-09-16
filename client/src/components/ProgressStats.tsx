import React from 'react';
import { OverallStats } from '../types';

interface ProgressStatsProps {
  stats: OverallStats | null;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ stats }) => {
  if (!stats || stats.totalSessions === 0) {
    return (
      <div className="no-stats">
        <p>No progress registered yet. Log your first study session!</p>
      </div>
    );
  }

  return (
    <div className="progress-stats">
      <div className="stats-summary">
        <div className="stat-box">
          <span className="stat-value">{stats.totalSessions}</span>
          <span className="stat-label">Sessions</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{stats.totalMinutes}</span>
          <span className="stat-label">Minutes studied</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{stats.coursesStarted}</span>
          <span className="stat-label">Courses started</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{stats.studyStreakDays}</span>
          <span className="stat-label">Day streak</span>
        </div>
      </div>

      {stats.favoriteTechnique && (
        <p className="favorite-technique">
          Most used technique: <strong>{stats.favoriteTechnique}</strong>
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
            <p>{courseStat.completionPercentage}% completed ({courseStat.modulesCompleted}/{courseStat.totalModules} modules)</p>
            <p>{courseStat.sessions} sessions · {courseStat.totalMinutes} minutes</p>
            {courseStat.lastStudied && (
              <p className="last-studied">
                Last session: {new Date(courseStat.lastStudied).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressStats;
