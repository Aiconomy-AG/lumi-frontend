import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import {
  getProducts,
  getShopifyCategories,
  createProduct,
  updateProduct,
  updateVariantStock,
  deleteProduct,
  type CreateProductPayload,
  type UpdateProductPayload,
} from '@/api/client'
import type { Paginated, Product, ProductFilters } from '@/types/product'
import { productKeys } from './queryKeys'

export function useProductsQuery(filters: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    placeholderData: (previous) => previous,
  })
}

export function useShopifyCategoriesQuery() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: getShopifyCategories,
  })
}

type ProductListSnapshot = Array<[readonly unknown[], Paginated<Product> | undefined]>

function snapshotProductLists(queryClient: QueryClient): ProductListSnapshot {
  return queryClient.getQueriesData<Paginated<Product>>({ queryKey: productKeys.lists() })
}

function restoreProductLists(queryClient: QueryClient, snapshot: ProductListSnapshot) {
  snapshot.forEach(([key, page]) => queryClient.setQueryData(key, page))
}

function patchProductInLists(
  queryClient: QueryClient,
  productId: number,
  updater: (product: Product) => Product
) {
  queryClient.setQueriesData<Paginated<Product>>({ queryKey: productKeys.lists() }, (page) => {
    if (!page) return page
    return { ...page, data: page.data.map((p) => (p.id === productId ? updater(p) : p)) }
  })
}

function removeProductFromLists(queryClient: QueryClient, productId: number) {
  queryClient.setQueriesData<Paginated<Product>>({ queryKey: productKeys.lists() }, (page) => {
    if (!page) return page
    return { ...page, data: page.data.filter((p) => p.id !== productId) }
  })
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: number; payload: UpdateProductPayload }) => updateProduct(vars.id, vars.payload),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })
      const snapshot = snapshotProductLists(queryClient)
      patchProductInLists(queryClient, vars.id, (product) => ({ ...product, ...vars.payload }))
      return { snapshot }
    },
    onError: (_error, _vars, context) => {
      if (context) restoreProductLists(queryClient, context.snapshot)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}

export function useUpdateVariantStockMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { productId: number; variantId: number; stock: number }) =>
      updateVariantStock(vars.productId, vars.variantId, vars.stock),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })
      const snapshot = snapshotProductLists(queryClient)
      patchProductInLists(queryClient, vars.productId, (product) => ({
        ...product,
        variants: product.variants.map((variant) =>
          variant.id === vars.variantId ? { ...variant, stock_quantity: vars.stock } : variant
        ),
      }))
      return { snapshot }
    },
    onError: (_error, _vars, context) => {
      if (context) restoreProductLists(queryClient, context.snapshot)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.lists() })
      const snapshot = snapshotProductLists(queryClient)
      removeProductFromLists(queryClient, id)
      return { snapshot }
    },
    onError: (_error, _id, context) => {
      if (context) restoreProductLists(queryClient, context.snapshot)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
  })
}
