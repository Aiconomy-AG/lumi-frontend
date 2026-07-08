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

export interface VariantPayload {
  sku?: string
  name?: string | null
  price?: number
  weight?: number | null
  weight_unit?: string | null
  colour?: string | null
  stock_quantity?: number
  options?: Record<string, string> | null
}

export async function createVariant(productId: number, payload: VariantPayload): Promise<Product> {
  return requestData<Product>(`/v1/admin/products/${productId}/variants`, {
    method: 'POST',
    data: payload,
  })
}

export async function updateVariant(productId: number, variantId: number, payload: VariantPayload): Promise<Product> {
  return requestData<Product>(`/v1/admin/products/${productId}/variants/${variantId}`, {
    method: 'PUT',
    data: payload,
  })
}

export async function deleteVariant(productId: number, variantId: number): Promise<void> {
  await request<void>(`/v1/admin/products/${productId}/variants/${variantId}`, { method: 'DELETE' })
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
