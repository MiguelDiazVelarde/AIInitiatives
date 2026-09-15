import express, { Request, Response } from 'express';
import { CourseService } from '../services/CourseService';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Get all courses
router.get('/courses', requireAuth, (req: Request, res: Response) => {
  try {
    const courses = CourseService.getAllCourses();
    res.json(courses);
  } catch (error) {
    console.error('Error getting courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cursos',
    });
  }
});

// Get course by ID
router.get('/courses/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = CourseService.getCourseById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
      });
    }

    res.json(course);
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener curso',
    });
  }
});

export default router;
