import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Product } from '../types';

interface ProductFormProps {
  onProductAdded: (product: Product) => void;
  onProductUpdated?: (product: Product) => void;
  onCancel: () => void;
  editingProduct?: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ onProductAdded, onProductUpdated, onCancel, editingProduct }) => {
  const [formData, setFormData] = useState({
    name: editingProduct?.name ?? '',
    description: editingProduct?.description ?? '',
    price: editingProduct?.price?.toString() ?? '',
    category: editingProduct?.category ?? '',
    stock: editingProduct?.stock?.toString() ?? '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditing = !!editingProduct;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        stock: Number.parseInt(formData.stock, 10),
      };

      if (isEditing && editingProduct) {
        const updatedProduct = await apiService.updateProduct(editingProduct.id, productData);
        onProductUpdated?.(updatedProduct);
      } else {
        const newProduct = await apiService.createProduct(productData);
        onProductAdded(newProduct);
      }
    } catch (err) {
      const fallback = isEditing ? 'Error updating product' : 'Error creating product';
      setError(err instanceof Error ? err.message : fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-container">
      <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <input
            type="text"
            name="name"
            placeholder="Product name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {(() => {
              if (loading) return isEditing ? 'Saving...' : 'Adding...';
              return isEditing ? 'Save Changes' : 'Add Product';
            })()}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;