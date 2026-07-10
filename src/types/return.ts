export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'received' | 'refunded'

export interface ReturnItemSnapshot {
  shopify_line_item_id?: string | null
  title?: string | null
  sku?: string | null
  quantity: number
  unit_price?: number
}

export interface ReturnItem {
  id: number
  return_request_id: number
  order_item_id: number
  quantity: number
  order_item?: {
    id: number
    product_variant_id: number
    quantity: number
    unit_price: number
    variant?: {
      id: number
      sku: string
      name: string
      colour?: string | null
    }
  }
}

export interface ReturnRequest {
  id: number
  order_id?: number | null
  customer_id?: number | null
  shop_domain?: string | null
  shopify_customer_id?: string | null
  shopify_order_id?: string | null
  shopify_order_name?: string | null
  email: string
  items: ReturnItemSnapshot[]
  reason: string
  notes?: string | null
  status: ReturnStatus
  refund_amount: number
  received_at?: string | null
  refunded_at?: string | null
  created_at: string
  updated_at: string
  order?: {
    id: number
    shopify_order_name?: string | null
    total_amount: number
    status: string
  }
  customer?: {
    id: number
    email: string
    username: string
  }
  return_items?: ReturnItem[]
}

export interface ReturnFilters {
  page?: number
  per_page?: number
  status?: ReturnStatus
  order_id?: number
  search?: string
  from?: string
  to?: string
}
