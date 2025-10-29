import React from 'react';
import { Product } from '../types';
import { apiService } from '../services/api';

interface ProductListProps {
  products: Product[];
  onProductDeleted: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onProductDeleted }) => {
  const handleDelete = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await apiService.deleteProduct(productId);
        onProductDeleted(productId);
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Error al eliminar el producto');
      }
    }
  };

  if (products.length === 0) {
    return (
      <div className="no-products">
        <p>No products registered.</p>
        <p>Add your first product!</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <div className="product-details">
              <span className="product-price">${product.price}</span>
              <span className="product-category">{product.category}</span>
              <span className="product-stock">Stock: {product.stock}</span>
            </div>
            <button 
              onClick={() => handleDelete(product.id)}
              className="delete-btn"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;