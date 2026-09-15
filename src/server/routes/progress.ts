import express, { Request, Response } from 'express';
import { ProgressService } from '../services/ProgressService';
import { CourseService } from '../services/CourseService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Register a new study progress entry
router.post('/progress', requireAuth, (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { courseId, module, technique, minutesStudied, status, notes } = req.body;

    if (!courseId || !module || !technique || minutesStudied === undefined || !status) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos',
      });
    }

    if (Number.isNaN(Number(minutesStudied)) || Number(minutesStudied) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Los minutos estudiados deben ser un número válido mayor a 0',
      });
    }

    const course = CourseService.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
      });
    }

    const entry = ProgressService.addEntry(authReq.user!.id, authReq.user!.username, {
      courseId,
      module,
      technique,
      minutesStudied: Number(minutesStudied),
      status,
      notes: notes?.trim() ?? '',
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error registering progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar el avance',
    });
  }
});

// Get progress entries for the logged in student
router.get('/progress', requireAuth, (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const entries = ProgressService.getEntriesByUser(authReq.user!.id);
    res.json(entries);
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el avance',
    });
  }
});

// Get aggregated statistics for the logged in student
router.get('/progress/stats', requireAuth, (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const stats = ProgressService.getStatsForUser(authReq.user!.id);
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
    });
  }
});

export default router;
