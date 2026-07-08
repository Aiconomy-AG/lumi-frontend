import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  createVariant, updateVariant, deleteVariant, updateVariantStock,
  getShopifyCategories,
} from '@/api/client'
import type { CreateProductPayload, UpdateProductPayload, VariantPayload } from '@/api/products'
import type { ProductFilters } from '@/types/product'

// toate cheile de query pentru stoc intr-un singur loc; mutatiile invalideaza
// prefixul ['products'] ca sa se refaca automat orice pagina/filtre active
export const stockKeys = {
  products: ['products'] as const,
  productList: (filters: ProductFilters) => ['products', filters] as const,
  categories: ['shopify-categories'] as const,
}

export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: stockKeys.productList(filters),
    queryFn: () => getProducts(filters),
    placeholderData: (previous) => previous,
  })
}

export function useShopifyCategories() {
  return useQuery({
    queryKey: stockKeys.categories,
    queryFn: getShopifyCategories,
    staleTime: 5 * 60 * 1000,
  })
}

function useInvalidateProducts() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: stockKeys.products })
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (vars: { id: number; payload: UpdateProductPayload }) =>
      updateProduct(vars.id, vars.payload),
    onSuccess: invalidate,
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: invalidate,
  })
}

export function useCreateVariant() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (vars: { productId: number; payload: VariantPayload }) =>
      createVariant(vars.productId, vars.payload),
    onSuccess: invalidate,
  })
}

export function useUpdateVariant() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (vars: { productId: number; variantId: number; payload: VariantPayload }) =>
      updateVariant(vars.productId, vars.variantId, vars.payload),
    onSuccess: invalidate,
  })
}

export function useDeleteVariant() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (vars: { productId: number; variantId: number }) =>
      deleteVariant(vars.productId, vars.variantId),
    onSuccess: invalidate,
  })
}

export function useUpdateVariantStock() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (vars: { productId: number; variantId: number; stock: number }) =>
      updateVariantStock(vars.productId, vars.variantId, vars.stock),
    onSuccess: invalidate,
  })
}
