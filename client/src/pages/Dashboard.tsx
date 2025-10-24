import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Product } from '../types';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productList = await apiService.getProducts();
      setProducts(productList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      logout();
    } catch (err) {
      console.error('Logout error:', err);
      logout(); // Force logout even if API call fails
    }
  };

  const handleProductAdded = (newProduct: Product) => {
    setProducts([...products, newProduct]);
    setShowForm(false);
  };

  const handleProductDeleted = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  if (loading) {
    return <div className="loading">Cargando productos...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard - Products App</h1>
        <div className="user-info">
          <span>Bienvenido, {user?.username}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="products-section">
          <div className="products-header">
            <h2>Productos</h2>
            <button 
              onClick={() => setShowForm(!showForm)} 
              className="add-product-btn"
            >
              {showForm ? 'Cancelar' : 'Agregar Producto'}
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          {showForm && (
            <ProductForm 
              onProductAdded={handleProductAdded}
              onCancel={() => setShowForm(false)}
            />
          )}

          <ProductList 
            products={products}
            onProductDeleted={handleProductDeleted}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;