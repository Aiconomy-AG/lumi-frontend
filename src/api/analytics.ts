import type { MostWishlistedProduct } from '@/types/analytics'
import { requestData } from './http'

function normalizeProduct(product: MostWishlistedProduct): MostWishlistedProduct {
  return {
    ...product,
    price: product.price === null || product.price === undefined ? null : Number(product.price),
    wishlist_count: Number(product.wishlist_count ?? 0),
  }
}

export async function getMostWishlistedProducts(): Promise<MostWishlistedProduct[]> {
  const products = await requestData<MostWishlistedProduct[]>('/analytics/products/most-wishlisted')
  return products.map(normalizeProduct)
}
