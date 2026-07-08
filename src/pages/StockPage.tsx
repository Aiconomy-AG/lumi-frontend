import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  getProducts, createProduct, updateProduct, updateVariantStock, deleteProduct, getShopifyCategories,
} from '@/api/client'
import type { Product, ProductVariant } from '@/types/product'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Check, X, ChevronLeft, ChevronRight, ChevronDown, CornerDownRight } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import type { Category } from '@/types/product'


const emptyProduct = { name: '', description: '', image_url: '', sku: '', categoryId: null as number | null, stock: '', price: '' }
const STOCK_CURRENCY = import.meta.env.VITE_CURRENCY ?? 'RON'
const PER_PAGE = 25

interface EditForm {
  id: number
  name: string
  description: string
  image_url: string
  sku: string
  categoryId: number | null
  price: string
}

function renderStock(stock: number, t: TFunction) {
  if (stock === 0) {
    return <span className="font-medium text-red-500">{t('stock.outOfStockLabel')}</span>
  }
  if (stock <= 5) {
    return <span className="font-medium text-yellow-500">{stock}</span>
  }
  return <span className="font-medium text-green-600">{stock}</span>
}

function variantLabel(product: Product, variant: ProductVariant): string | null {
  if (variant.options && Object.keys(variant.options).length > 0) {
    return Object.values(variant.options).join(' / ')
  }
  if (variant.name && variant.name !== product.name) {
    return variant.name
  }
  if (variant.weight && Number(variant.weight) > 0) {
    return `${Number(variant.weight)}${variant.weight_unit ?? ''}`
  }
  return null
}

function formatPrice(value: number): string {
  return `${value.toFixed(2)} ${STOCK_CURRENCY}`
}


function productPrice(product: Product): string {
  if (!product.variants.length) {
    return formatPrice(product.price)
  }
  const prices = product.variants.map((v) => v.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return min === max ? formatPrice(min) : `${min.toFixed(2)} – ${formatPrice(max)}`
}

interface CategorySelectProps {
  value: number | null
  onChange: (value: number | null) => void
  categories: Category[]
  nullLabel: string
  className?: string
}

function CategorySelect({ value, onChange, categories, nullLabel, className }: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          {(selected: number | null) =>
            selected === null
              ? nullLabel
              : categories.find((c) => c.id === selected)?.name ?? selected
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>{nullLabel}</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function StockPage() {
  const { t } = useTranslation()
  const { isAdmin } = useAuth()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newProduct, setNewProduct] = useState(emptyProduct)

  const [editForm, setEditForm] = useState<EditForm | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const filters = {
    search: debouncedSearch || undefined,
    category_id: categoryId ?? undefined,
    page,
    per_page: PER_PAGE,
  }

  const { data: productPage, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    placeholderData: (previous) => previous,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['shopify-categories'],
    queryFn: getShopifyCategories,
  })

  const products = productPage?.data ?? []
  const meta = productPage?.meta

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; payload: Parameters<typeof updateProduct>[1] }) =>
        updateProduct(vars.id, vars.payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const updateStockMutation = useMutation({
    mutationFn: (vars: { productId: number; variantId: number; stock: number }) =>
        updateVariantStock(vars.productId, vars.variantId, vars.stock),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const variantCount = products.reduce((sum, p) => sum + p.variants.length, 0)
  const lowStock = products.reduce(
    (sum, p) => sum + p.variants.filter((v) => v.stock_quantity > 0 && v.stock_quantity <= 5).length, 0)
  const outOfStock = products.reduce(
    (sum, p) => sum + p.variants.filter((v) => v.stock_quantity === 0).length, 0)

  function toggleExpanded(productId: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  function startEdit(variant: ProductVariant) {
    setEditingId(variant.id)
    setEditValue(variant.stock_quantity)
  }

  function selectCategory(value: number | null) {
    setCategoryId(value)
    setPage(1)
  }

  function openEditProduct(product: Product) {
    setEditForm({
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      image_url: product.image_url ?? '',
      sku: product.sku ?? '',
      categoryId: product.category_id ?? null,
      price: String(product.price),
    })
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    const parsedPrice = Number(newProduct.price)
    const parsedStock = Number(newProduct.stock)

    await createMutation.mutateAsync({
      name: newProduct.name,
      description: newProduct.description || undefined,
      image_url: newProduct.image_url || undefined,
      price: parsedPrice,
      category_id: newProduct.categoryId ?? undefined,
      variants: [{
        sku: newProduct.sku,
        price: parsedPrice,
        weight: 1,
        weight_unit: 'kg',
        stock_quantity: parsedStock,
      }],
    })
    setNewProduct(emptyProduct)
    setIsAddOpen(false)
  }

  async function handleEditProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!editForm) return

    await updateMutation.mutateAsync({
      id: editForm.id,
      payload: {
        name: editForm.name,
        price: Number(editForm.price),
        description: editForm.description || undefined,
        image_url: editForm.image_url || undefined,
        sku: editForm.sku || undefined,
        category_id: editForm.categoryId ?? undefined,
      },
    })
    setEditForm(null)
  }

  async function saveEdit(productId: number, variantId: number) {
    await updateStockMutation.mutateAsync({ productId, variantId, stock: editValue })
    setEditingId(null)
  }

  async function handleDelete(id: number) {
    await deleteMutation.mutateAsync(id)
  }

  function renderStockEditor(product: Product, variant: ProductVariant) {
    if (editingId === variant.id) {
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(Number(e.target.value))}
            className="h-7 w-20"
            autoFocus
          />
          <Button size="icon-sm" variant="ghost" onClick={() => saveEdit(product.id, variant.id)}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2">
        {renderStock(variant.stock_quantity, t)}
        <Button size="icon-sm" variant="ghost" onClick={() => startEdit(variant)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{t('stock.productsCount', { count: meta?.total ?? products.length })}</span>
          <span className="text-muted-foreground">{t('stock.variantsCount', { count: variantCount })}</span>
          {lowStock > 0 && <span className="text-yellow-500">{t('stock.lowStock', { count: lowStock })}</span>}
          {outOfStock > 0 && <span className="text-red-500">{t('stock.outOfStock', { count: outOfStock })}</span>}
        </div>
        <div className="flex items-center gap-3">
          <CategorySelect
            value={categoryId}
            onChange={selectCategory}
            categories={categories}
            nullLabel={t('stock.allCategories')}
            className="w-44"
          />
          <Input
            placeholder={t('stock.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-1 h-4 w-4" />
                  {t('stock.addButton')}
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('stock.newProductTitle')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldName')}</label>
                  <Input
                    placeholder={t('stock.fieldNamePlaceholder')}
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldDescription')}</label>
                  <Input
                    placeholder={t('stock.fieldDescriptionPlaceholder')}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldImageUrl')}</label>
                  <Input
                    placeholder={t('stock.fieldImageUrlPlaceholder')}
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldSku')}</label>
                  <Input
                    placeholder={t('stock.fieldSkuPlaceholder')}
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldCategory')}</label>
                  <CategorySelect
                    value={newProduct.categoryId}
                    onChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}
                    categories={categories}
                    nullLabel={t('stock.noCategory')}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldStock')}</label>
                  <Input
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldPrice')}</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">{t('stock.add')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={editForm !== null} onOpenChange={(open) => !open && setEditForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('stock.editProductTitle')}</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditProduct} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldName')}</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldDescription')}</label>
                <Input
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldImageUrl')}</label>
                <Input
                  value={editForm.image_url}
                  onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldSku')}</label>
                <Input
                  value={editForm.sku}
                  onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldCategory')}</label>
                <CategorySelect
                  value={editForm.categoryId}
                  onChange={(value) => setEditForm({ ...editForm, categoryId: value })}
                  categories={categories}
                  nullLabel={t('stock.noCategory')}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldPrice')}</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">{t('stock.save')}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <p className="text-muted-foreground">{t('admin.loading')}</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('stock.columnProduct')}</TableHead>
                <TableHead>{t('stock.columnVariant')}</TableHead>
                <TableHead>{t('stock.columnSku')}</TableHead>
                <TableHead>{t('stock.columnCategory')}</TableHead>
                <TableHead>{t('stock.columnStock')}</TableHead>
                <TableHead className="text-right">{t('stock.columnPrice')}</TableHead>
                <TableHead className="text-right">{t('stock.columnActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.flatMap((product) => {
                const multiVariant = product.variants.length > 1
                const single = product.variants.length === 1 ? product.variants[0] : null
                const totalStock = product.variants.reduce((sum, v) => sum + v.stock_quantity, 0)
                const isExpanded = expanded.has(product.id)

                const productRow = (
                  <TableRow key={`p-${product.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        {multiVariant && (
                          <Button size="icon-sm" variant="ghost" onClick={() => toggleExpanded(product.id)}>
                            {isExpanded
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        )}
                        <span className={multiVariant ? '' : 'pl-8'}>{product.name || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {multiVariant ? (
                        <button
                          type="button"
                          className="cursor-pointer underline-offset-2 hover:underline"
                          onClick={() => toggleExpanded(product.id)}
                        >
                          {t('stock.variantsCount', { count: product.variants.length })}
                        </button>
                      ) : (
                        single ? variantLabel(product, single) ?? '-' : '-'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.sku ?? single?.sku ?? '-'}</TableCell>
                    <TableCell>{product.category_name ?? product.category?.name ?? '-'}</TableCell>
                    <TableCell>
                      {single ? (
                        renderStockEditor(product, single)
                      ) : multiVariant ? (
                        renderStock(totalStock, t)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{productPrice(product)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon-sm" variant="ghost" onClick={() => openEditProduct(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )

                if (!multiVariant || !isExpanded) {
                  return [productRow]
                }

                return [
                  productRow,
                  ...product.variants.map((variant) => (
                    <TableRow key={`v-${variant.id}`} className="bg-muted/30">
                      <TableCell />
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-2 pl-2">
                          <CornerDownRight className="h-3.5 w-3.5" />
                          {variantLabel(product, variant) ?? variant.sku}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
                      <TableCell />
                      <TableCell>{renderStockEditor(product, variant)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatPrice(variant.price)}</TableCell>
                      <TableCell />
                    </TableRow>
                  )),
                ]
              })}
            </TableBody>
          </Table>
          {meta && meta.last_page > 1 && (
            <div className="mt-4 flex items-center justify-end gap-3 text-sm">
              <span className="text-muted-foreground">
                {t('stock.pageOf', { page: meta.current_page, pages: meta.last_page })}
              </span>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={meta.current_page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
