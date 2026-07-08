export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
}

export interface OrderCustomer {
  id: number
  username: string
  email: string
}

export interface Order {
  id: number
  customer_id: number
  status: string
  subtotal: number
  shipping_cost: number
  total_amount: number
  shipping_address: string
  payment_method: string
  payment_status: string
  created_at: string
  customer?: OrderCustomer
  items: OrderItem[]
}

export interface PaginationMeta {
  current_page: number
  last_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}
