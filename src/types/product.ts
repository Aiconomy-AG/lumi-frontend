export interface Category {
    id: number
    parent_id?: number
    name: string
}

export interface ProductVariant {
    id: number
    product_id: number
    sku: string
    name?: string | null
    price: number
    weight: number
    weight_unit: string
    colour?: string | null
    stock_quantity: number
    options?: Record<string, string> | null
}

export interface PaginationMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export interface Paginated<T> {
    data: T[]
    meta: PaginationMeta
}

export interface ProductFilters {
    search?: string
    category_id?: number
    stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock'
    page?: number
    per_page?: number
}

export interface Product {
    id: number
    sku?: string | null
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