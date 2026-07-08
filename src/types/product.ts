export interface Category {
    id: number
    parent_id?: number
    name: string
}

export interface ProductVariant {
    id: number
    product_id: number
    sku: string
    price: number
    weight: number
    weight_unit: string
    stock_quantity: number
}

export interface Product {
    id: number
    name: string
    description?: string
    price: number
    image_url?: string
    category_id?: number
    category_name?: string | null
    category?: Category
    shopify_product_id?: string
    shopify_sync_status?: 'synced' | 'unsynced' | 'syncing' | 'error'
    variants: ProductVariant[]
}