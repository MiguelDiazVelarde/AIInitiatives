import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Course, ProgressEntry, OverallStats } from '../types';
import CourseList from '../components/CourseList';
import ProgressForm from '../components/ProgressForm';
import ProgressStats from '../components/ProgressStats';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<'courses' | 'stats'>('courses');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [courseList, statsData] = await Promise.all([
        apiService.getCourses(),
        apiService.getStats(),
      ]);
      setCourses(courseList);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading courses');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      logout();
    } catch (err) {
      console.error('Logout error:', err);
      logout(); // Force logout even if API call fails
    }
  };

  const handleProgressAdded = async (_entry: ProgressEntry) => {
    setSelectedCourse(null);
    const statsData = await apiService.getStats();
    setStats(statsData);
    setView('stats');
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>AI Academy - Learn with Barbara Oakley's principles</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="courses-section">
          <div className="courses-header">
            <h2>{view === 'courses' ? 'My courses' : 'My statistics'}</h2>
            <div className="view-toggle">
              <button
                className={view === 'courses' ? 'toggle-btn active' : 'toggle-btn'}
                onClick={() => setView('courses')}
              >
                Courses
              </button>
              <button
                className={view === 'stats' ? 'toggle-btn active' : 'toggle-btn'}
                onClick={() => setView('stats')}
              >
                Statistics
              </button>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {selectedCourse && (
            <ProgressForm
              course={selectedCourse}
              onProgressAdded={handleProgressAdded}
              onCancel={() => setSelectedCourse(null)}
            />
          )}

          {!selectedCourse && view === 'courses' && (
            <CourseList courses={courses} onRegisterProgress={setSelectedCourse} />
          )}

          {!selectedCourse && view === 'stats' && (
            <ProgressStats stats={stats} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;