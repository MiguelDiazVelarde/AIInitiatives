import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS para permitir requests desde React
app.use(cors({
  origin: 'http://localhost:5173', // Puerto de Vite en desarrollo
  credentials: true
}));

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);

// Route to verify server status
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve React static files in production or test
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));
  
  // All non-API routes should serve React's index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Test user: admin / password`);
  console.log(`🌐 Open browser at: http://localhost:${PORT}`);
});

export default app;