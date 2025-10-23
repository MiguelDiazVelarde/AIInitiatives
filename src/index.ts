import express from 'express';
import session from 'express-session';
import path from 'path';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Configuración de sesiones
app.use(session({
  secret: 'tu-secreto-super-seguro-aqui', // En producción usar variable de entorno
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // En producción con HTTPS poner en true
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Rutas
app.use('/auth', authRoutes);
app.use('/', productRoutes);

// Ruta raíz - redirigir al login o dashboard
app.get('/', (req: express.Request, res: express.Response) => {
  if (req.session && req.session.userId) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/auth/login');
  }
});

// Middleware de manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📝 Usuario de prueba: admin / password`);
  console.log(`🌐 Abre tu navegador en: http://localhost:${PORT}`);
});

export default app;