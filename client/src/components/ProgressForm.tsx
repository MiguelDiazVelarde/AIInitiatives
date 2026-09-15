import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Course, ProgressEntry, OAKLEY_TECHNIQUES, ProgressStatus } from '../types';

interface ProgressFormProps {
  course: Course;
  onProgressAdded: (entry: ProgressEntry) => void;
  onCancel: () => void;
}

const ProgressForm: React.FC<ProgressFormProps> = ({ course, onProgressAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    module: course.modules[0].title,
    technique: course.modules[0].technique as string,
    minutesStudied: '',
    status: 'en-progreso' as ProgressStatus,
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'module') {
      const selectedModule = course.modules.find((m) => m.title === value);
      setFormData({
        ...formData,
        module: value,
        technique: selectedModule?.technique ?? formData.technique,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const entry = await apiService.registerProgress({
        courseId: course.id,
        module: formData.module,
        technique: formData.technique,
        minutesStudied: Number.parseInt(formData.minutesStudied, 10),
        status: formData.status,
        notes: formData.notes,
      });
      onProgressAdded(entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el avance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="progress-form-container">
      <h3>Registrar avance: {course.name}</h3>
      <form onSubmit={handleSubmit} className="progress-form">
        <div className="form-group">
          <label htmlFor="module">Módulo</label>
          <select id="module" name="module" value={formData.module} onChange={handleChange}>
            {course.modules.map((module) => (
              <option key={module.id} value={module.title}>{module.title}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="technique">Técnica de aprendizaje (Barbara Oakley)</label>
          <select id="technique" name="technique" value={formData.technique} onChange={handleChange}>
            {OAKLEY_TECHNIQUES.map((technique) => (
              <option key={technique} value={technique}>{technique}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minutesStudied">Minutos estudiados</label>
            <input
              id="minutesStudied"
              type="number"
              name="minutesStudied"
              placeholder="Minutos"
              value={formData.minutesStudied}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Estado del módulo</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="iniciado">Iniciado</option>
              <option value="en-progreso">En progreso</option>
              <option value="completado">Completado</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <textarea
            name="notes"
            placeholder="Notas (opcional)"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Guardando...' : 'Guardar avance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProgressForm;
