import type { ProductVariant } from './product'

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'successful' | 'failed'

export interface OrderItem {
  id: number
  order_id: number
  product_variant_id: number
  quantity: number
  unit_price: number
  variant?: ProductVariant
}

export interface OrderCustomer {
  id: number
  username: string
  email: string
}

export interface OrderReturnSummary {
  id: number
  status: string
  reason: string
  refund_amount: number
  created_at: string
}

export interface Order {
  id: number
  customer_id: number
  shopify_order_id?: string | null
  shopify_order_name?: string | null
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  total_amount: number
  shipping_address: string
  payment_method: string
  payment_status: PaymentStatus
  created_at: string
  customer?: OrderCustomer
  items: OrderItem[]
  return_requests?: OrderReturnSummary[]
}

export interface OrderFilters {
  page?: number
  per_page?: number
  status?: OrderStatus
  customer_id?: number
  search?: string
  from?: string
  to?: string
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  total?: number
  per_page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
