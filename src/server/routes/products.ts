import express, { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get all products
router.get('/products', requireAuth, (req: Request, res: Response) => {
  try {
    const products = ProductService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener productos' 
    });
  }
});

// Get product by ID
router.get('/products/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = ProductService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener producto' 
    });
  }
});

// Create new product
router.post('/products', requireAuth, (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { name, description, price, category, stock } = req.body;
    
    if (!name || !description || price === undefined || !category || stock === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos' 
      });
    }

    // Validate price and stock are numbers
    if (Number.isNaN(Number(price)) || Number.isNaN(Number(stock))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Precio y stock deben ser números válidos' 
      });
    }

    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      stock: Number(stock)
    };

    const newProduct = ProductService.createProduct(productData, authReq.user!.id);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear producto' 
    });
  }
});

// Update product
router.put('/products/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;

    if (!name || !description || price === undefined || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    if (Number.isNaN(Number(price)) || Number.isNaN(Number(stock))) {
      return res.status(400).json({
        success: false,
        message: 'Precio y stock deben ser números válidos'
      });
    }

    const updateData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      stock: Number(stock)
    };

    const updatedProduct = ProductService.updateProduct(id, updateData);
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar producto'
    });
  }
});

// Delete product
router.delete('/products/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const success = ProductService.deleteProduct(id);
    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Producto no encontrado' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Producto eliminado exitosamente' 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al eliminar producto' 
    });
  }
});

export default router;