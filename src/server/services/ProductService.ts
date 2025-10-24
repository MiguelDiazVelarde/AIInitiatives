import { Product, CreateProductRequest, UpdateProductRequest } from '../models/Product';
import { v4 as uuidv4 } from 'uuid';

// Simulamos una base de datos en memoria
const products: Product[] = [];

export class ProductService {
  static createProduct(productData: CreateProductRequest, userId: string): Product {
    const newProduct: Product = {
      id: uuidv4(),
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      stock: productData.stock,
      createdAt: new Date(),
      createdBy: userId
    };

    products.push(newProduct);
    return newProduct;
  }

  static getAllProducts(): Product[] {
    return products;
  }

  static getProductById(id: string): Product | undefined {
    return products.find(p => p.id === id);
  }

  static updateProduct(id: string, updateData: UpdateProductRequest): Product | null {
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return null;
    }

    products[productIndex] = {
      ...products[productIndex],
      ...updateData
    };

    return products[productIndex];
  }

  static deleteProduct(id: string): boolean {
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return false;
    }

    products.splice(productIndex, 1);
    return true;
  }

  static getProductsByUser(userId: string): Product[] {
    return products.filter(p => p.createdBy === userId);
  }
}