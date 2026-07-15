export interface MostWishlistedProduct {
  id: number
  name: string
  sku?: string | null
  price?: number | null
  image_url?: string | null
  category_name?: string | null
  shopify_product_id?: string | null
  wishlist_count: number
}
