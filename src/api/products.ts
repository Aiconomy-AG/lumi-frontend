import type { Paginated, Product, ProductFilters } from '../types/product'
import { request, requestData } from './http'

export interface CreateProductPayload {
  name: string
  price: number
  description?: string
  image_url?: string
  category_id?: number
  category_name?: string
  sku?: string
  variants?: Array<{
    sku: string
    price?: number
    weight?: number
    weight_unit?: string
    stock_quantity?: number
  }>
}

export async function getProducts(filters: ProductFilters = {}): Promise<Paginated<Product>> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
  )
  const page = await request<Paginated<Product>>('/v1/admin/products', { params })
  return {
    ...page,
    data: page.data.map((product) => ({
      ...product,
      price: Number(product.price),
      variants: product.variants.map((variant) => ({
        ...variant,
        price: Number(variant.price),
        stock_quantity: Number(variant.stock_quantity),
      })),
    })),
  }
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return requestData<Product>('/v1/admin/products', {
    method: 'POST',
    data: payload,
  })
}

export interface UpdateProductPayload {
  name?: string
  price?: number
  description?: string
  image_url?: string
  category_id?: number
  sku?: string
}

export async function updateProduct(id: number, payload: UpdateProductPayload): Promise<Product> {
  return requestData<Product>(`/v1/admin/products/${id}`, {
    method: 'PUT',
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
