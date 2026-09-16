import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import progressRoutes from './routes/progress';

const app = express();
const PORT = process.env.PORT || 3000;

// More permissive CORS configuration for tests
app.use(cors({
  origin: true,
  credentials: true
}));

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'your-super-secure-secret-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);
app.use('/api', progressRoutes);

// Ruta para verificar estado del servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running in test mode' });
});

// Serve React static files for tests
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Todas las rutas no-API deben servir el index.html de React
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  }
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Handle not found routes
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📝 Test user: admin / password`);
  console.log(`🧪 Mode: Tests with React static files`);
});

export default app;