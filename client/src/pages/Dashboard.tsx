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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleProductEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleProductDeleted = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard - Products App</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="products-section">
          <div className="products-header">
            <h2>Products</h2>
            <button 
              onClick={() => {
                setShowForm(!showForm);
                setEditingProduct(null);
              }} 
              className="add-product-btn"
            >
              {showForm ? 'Cancel' : 'Add Product'}
            </button>
          </div>

          {error && <div className="error">{error}</div>}

          {showForm && (
            <ProductForm 
              onProductAdded={handleProductAdded}
              onProductUpdated={handleProductUpdated}
              onCancel={() => { setShowForm(false); setEditingProduct(null); }}
              editingProduct={editingProduct}
            />
          )}

          <ProductList 
            products={products}
            onProductDeleted={handleProductDeleted}
            onProductEdit={handleProductEdit}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;