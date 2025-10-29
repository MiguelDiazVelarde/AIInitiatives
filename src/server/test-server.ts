import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS más permisiva para tests
app.use(cors({
  origin: true,
  credentials: true
}));

// Configuración de middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesiones
app.use(session({
  secret: 'tu-secreto-super-seguro-aqui',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api', productRoutes);

// Ruta para verificar estado del servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running in test mode' });
});

// Servir archivos estáticos de React para tests
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