import express, { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { redirectIfAuthenticated } from '../middleware/auth';

const router = express.Router();

// Página de login
router.get('/login', redirectIfAuthenticated, (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - Products App</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
        form { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .error { color: red; margin: 10px 0; }
        a { display: block; text-align: center; margin-top: 15px; }
      </style>
    </head>
    <body>
      <h2>Iniciar Sesión</h2>
      <form action="/auth/login" method="POST">
        <input type="text" name="username" placeholder="Usuario" required>
        <input type="password" name="password" placeholder="Contraseña" required>
        <button type="submit">Iniciar Sesión</button>
      </form>
      <a href="/auth/register">¿No tienes cuenta? Regístrate</a>
      <p><small>Usuario de prueba: admin / Contraseña: password</small></p>
    </body>
    </html>
  `);
});

// Página de registro
router.get('/register', redirectIfAuthenticated, (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Registro - Products App</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 100px auto; padding: 20px; }
        form { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
        button { width: 100%; padding: 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #1e7e34; }
        .error { color: red; margin: 10px 0; }
        a { display: block; text-align: center; margin-top: 15px; }
      </style>
    </head>
    <body>
      <h2>Crear Cuenta</h2>
      <form action="/auth/register" method="POST">
        <input type="text" name="username" placeholder="Usuario" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="password" name="password" placeholder="Contraseña" required>
        <button type="submit">Registrarse</button>
      </form>
      <a href="/auth/login">¿Ya tienes cuenta? Inicia sesión</a>
    </body>
    </html>
  `);
});

// Procesar login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const user = await UserService.authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Procesar registro
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const user = await UserService.createUser({ username, email, password });
    
    req.session.userId = user.id;
    req.session.username = user.username;

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error en registro:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.redirect('/auth/login');
  });
});

export default router;