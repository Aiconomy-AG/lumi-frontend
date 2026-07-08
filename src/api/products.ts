import type { Product } from '../types/product'
import { request, requestData } from './http'

export async function getProducts(): Promise<Product[]> {
  const products = await requestData<Product[]>('/v1/admin/products')
  return products.map((product) => ({
    ...product,
    price: Number(product.price),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: Number(variant.price),
      stock_quantity: Number(variant.stock_quantity),
    })),
  }))
}

export async function createProduct(payload: Partial<Product> & Pick<Product, 'name' | 'price'>): Promise<Product> {
  return requestData<Product>('/v1/admin/products', {
    method: 'POST',
    data: payload,
  })
}

export async function updateVariantStock(productId: number, variantId: number, stockQuantity: number): Promise<Product> {
  return requestData<Product>(`/v1/admin/products/${productId}/variants/${variantId}`, {
    method: 'PATCH',
    data: { stock_quantity: stockQuantity },
  })
}

export async function deleteProduct(id: number): Promise<void> {
  await request<void>(`/v1/admin/products/${id}`, { method: 'DELETE' })
}
