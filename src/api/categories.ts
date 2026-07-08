import type { Category } from '../types/product'
import { requestData } from './http'

export const SHOPIFY_CATEGORY_NAMES = [
  'Baden',
  'Duschen',
  'Geschenke & Co.',
  'Gesicht',
  'Haare',
  'Körper',
  'Düfte',
  'New',
  'Limited',
]

export async function getCategories(): Promise<Category[]> {
  return requestData<Category[]>('/v1/shop/categories')
}

export async function getShopifyCategories(): Promise<Category[]> {
  const categories = await getCategories()
  return categories.filter((category) => SHOPIFY_CATEGORY_NAMES.includes(category.name))
}
