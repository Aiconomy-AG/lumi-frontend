import type { Product } from '../types/product'

export const mockProducts: Product[] = [
    { id: 1, name: 'Dell XPS 15 Laptop',    sku: 'DEL-XPS-001',  category: 'Electronics', stock: 12, price: 5499.99 },
    { id: 2, name: 'LG 27" 4K Monitor',     sku: 'LG-MON-027',   category: 'Peripherals', stock: 8,  price: 1899.99 },
    { id: 3, name: 'Keychron K2 Keyboard',  sku: 'KEY-K2-001',   category: 'Peripherals', stock: 25, price: 449.99  },
    { id: 4, name: 'Logitech MX Master 3',  sku: 'LOG-MX3-001',  category: 'Peripherals', stock: 3,  price: 349.99  },
    { id: 5, name: 'USB-C Cable 2m',        sku: 'CBL-USC-002',  category: 'Accessories', stock: 50, price: 49.99   },
    { id: 6, name: 'Logitech C920 Webcam',  sku: 'LOG-C920-001', category: 'Peripherals', stock: 0,  price: 599.99  },
]