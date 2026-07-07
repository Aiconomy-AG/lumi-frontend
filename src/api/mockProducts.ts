import type { Category, Product } from '../types/product'

export const mockCategories: Category[] = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Peripherals' },
    { id: 3, name: 'Accessories' },
]

export const mockProducts: Product[] = [
    { id: 1, name: 'Dell XPS 15 Laptop',   price: 5499.99, category_id: 1, category: mockCategories[0], variants: [{ id: 1, product_id: 1, sku: 'DEL-XPS-001',  price: 5499.99, weight: 2, weight_unit: 'kg', stock_quantity: 12 }] },
    { id: 2, name: 'LG 27" 4K Monitor',    price: 1899.99, category_id: 2, category: mockCategories[1], variants: [{ id: 2, product_id: 2, sku: 'LG-MON-027',   price: 1899.99, weight: 5, weight_unit: 'kg', stock_quantity: 8  }] },
    { id: 3, name: 'Keychron K2 Keyboard', price: 449.99,  category_id: 2, category: mockCategories[1], variants: [{ id: 3, product_id: 3, sku: 'KEY-K2-001',   price: 449.99,  weight: 1, weight_unit: 'kg', stock_quantity: 25 }] },
    { id: 4, name: 'Logitech MX Master 3', price: 349.99,  category_id: 2, category: mockCategories[1], variants: [{ id: 4, product_id: 4, sku: 'LOG-MX3-001',  price: 349.99,  weight: 1, weight_unit: 'kg', stock_quantity: 3  }] },
    { id: 5, name: 'USB-C Cable 2m',       price: 49.99,   category_id: 3, category: mockCategories[2], variants: [{ id: 5, product_id: 5, sku: 'CBL-USC-002',  price: 49.99,   weight: 1, weight_unit: 'kg', stock_quantity: 50 }] },
    { id: 6, name: 'Logitech C920 Webcam', price: 599.99,  category_id: 2, category: mockCategories[1], variants: [{ id: 6, product_id: 6, sku: 'LOG-C920-001', price: 599.99,  weight: 1, weight_unit: 'kg', stock_quantity: 0  }] },
]