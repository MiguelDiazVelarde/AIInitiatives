import express, { Response } from 'express';
import { ProductService } from '../services/ProductService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(requireAuth);

// Dashboard con lista de productos y formulario
router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  const products = ProductService.getAllProducts();
  
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard - Products App</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .header { background: #007bff; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .container { max-width: 1200px; margin: 0 auto; }
        .grid { display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        button { padding: 12px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #1e7e34; }
        .logout-btn { background: #dc3545; }
        .logout-btn:hover { background: #c82333; }
        .product-list { max-height: 600px; overflow-y: auto; }
        .product-item { border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 4px; }
        .product-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .product-name { font-weight: bold; color: #007bff; }
        .product-price { color: #28a745; font-weight: bold; }
        .product-actions { margin-top: 10px; }
        .btn-small { padding: 5px 10px; margin-right: 5px; font-size: 12px; }
        .btn-danger { background: #dc3545; }
        .btn-warning { background: #ffc107; color: #212529; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Dashboard - Bienvenido ${req.user?.username}</h1>
          <form action="/auth/logout" method="POST" style="margin: 0;">
            <button type="submit" class="logout-btn">Cerrar Sesión</button>
          </form>
        </div>

        <div class="grid">
          <div class="card">
            <h2>Agregar Producto</h2>
            <form action="/products" method="POST">
              <div class="form-group">
                <label for="name">Nombre del Producto:</label>
                <input type="text" id="name" name="name" required>
              </div>
              
              <div class="form-group">
                <label for="description">Descripción:</label>
                <textarea id="description" name="description" rows="3" required></textarea>
              </div>
              
              <div class="form-group">
                <label for="price">Precio:</label>
                <input type="number" id="price" name="price" step="0.01" min="0" required>
              </div>
              
              <div class="form-group">
                <label for="category">Categoría:</label>
                <select id="category" name="category" required>
                  <option value="">Seleccionar categoría</option>
                  <option value="electronics">Electrónicos</option>
                  <option value="clothing">Ropa</option>
                  <option value="books">Libros</option>
                  <option value="home">Hogar</option>
                  <option value="sports">Deportes</option>
                  <option value="other">Otros</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="stock">Stock:</label>
                <input type="number" id="stock" name="stock" min="0" required>
              </div>
              
              <button type="submit">Agregar Producto</button>
            </form>
          </div>

          <div class="card">
            <h2>Lista de Productos (${products.length})</h2>
            <div class="product-list">
              ${products.length === 0 ? 
                '<p>No hay productos registrados.</p>' : 
                products.map(product => `
                  <div class="product-item">
                    <div class="product-header">
                      <span class="product-name">${product.name}</span>
                      <span class="product-price">$${product.price.toFixed(2)}</span>
                    </div>
                    <p><strong>Descripción:</strong> ${product.description}</p>
                    <p><strong>Categoría:</strong> ${product.category}</p>
                    <p><strong>Stock:</strong> ${product.stock}</p>
                    <p><strong>Creado:</strong> ${product.createdAt.toLocaleDateString()}</p>
                    <div class="product-actions">
                      <button class="btn-small btn-warning" onclick="editProduct('${product.id}')">Editar</button>
                      <button class="btn-small btn-danger" onclick="deleteProduct('${product.id}')">Eliminar</button>
                    </div>
                  </div>
                `).join('')
              }
            </div>
          </div>
        </div>
      </div>

      <script>
        function deleteProduct(id) {
          if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            fetch('/products/' + id, {
              method: 'DELETE'
            }).then(() => {
              location.reload();
            });
          }
        }

        function editProduct(id) {
          // Implementar edición (simplificado)
          alert('Función de edición no implementada en esta versión simple');
        }
      </script>
    </body>
    </html>
  `);
});

// Crear producto
router.post('/products', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, price, category, stock } = req.body;
    
    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock)
    };

    ProductService.createProduct(productData, req.user!.id);
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los productos (API)
router.get('/api/products', (req: AuthenticatedRequest, res: Response) => {
  const products = ProductService.getAllProducts();
  res.json(products);
});

// Obtener producto por ID (API)
router.get('/api/products/:id', (req: AuthenticatedRequest, res: Response) => {
  const product = ProductService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json(product);
});

// Actualizar producto
router.put('/api/products/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const updatedProduct = ProductService.updateProduct(req.params.id, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar producto
router.delete('/products/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = ProductService.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;