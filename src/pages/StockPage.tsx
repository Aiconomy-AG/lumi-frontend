import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { Product, ProductVariant, Category } from '@/types/product'
import {
  useProductsQuery,
  useShopifyCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  useUpdateVariantStockMutation,
} from '@/features/products'
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
import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'


const emptyProduct = { name: '', description: '', image_url: '', sku: '', categoryId: null as number | null, stock: '', price: '' }
const STOCK_CURRENCY = import.meta.env.VITE_CURRENCY ?? 'RON'
const PER_PAGE = 25

interface ProductForm {
  id: number
  name: string
  description: string
  image_url: string
  sku: string
  categoryId: number | null
  price: string
}

interface VariantForm {
  productId: number
  variantId: number | null
  sku: string
  name: string
  colour: string
  weight: string
  weight_unit: string
  price: string
  stock: string
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

// diferenta lizibila dintre variante: optiuni ("120 g" / "Blue / M"), altfel
// culoare + greutate, altfel numele variantei; niciodata SKU
function variantLabel(product: Product, variant: ProductVariant, t: TFunction): string {
  if (variant.options && Object.keys(variant.options).length > 0) {
    return Object.values(variant.options).join(' / ')
  }
  const parts: string[] = []
  if (variant.colour) {
    parts.push(variant.colour)
  }
  if (variant.weight && Number(variant.weight) > 0) {
    parts.push(`${Number(variant.weight)}${variant.weight_unit ?? ''}`)
  }
  if (parts.length) {
    return parts.join(' / ')
  }
  if (variant.name && variant.name !== product.name) {
    return variant.name
  }
  return t('stock.defaultVariant')
}

function formatPrice(value: number): string {
  return `${value.toFixed(2)} ${STOCK_CURRENCY}`
}

// pretul pe randul produsului: pretul variantei unice sau intervalul min-max
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

interface FieldProps {
  label: string
  children: React.ReactNode
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
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

  const [productForm, setProductForm] = useState<ProductForm | null>(null)
  const [variantForm, setVariantForm] = useState<VariantForm | null>(null)

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

  const { data: productPage, isLoading } = useProductsQuery(filters)
  const { data: categories = [] } = useShopifyCategoriesQuery()

  const products = productPage?.data ?? []
  const meta = productPage?.meta

  const createProduct = useCreateProductMutation()
  const updateProduct = useUpdateProductMutation()
  const deleteProduct = useDeleteProductMutation()
  const createVariant = useCreateVariantMutation()
  const updateVariant = useUpdateVariantMutation()
  const deleteVariant = useDeleteVariantMutation()
  const updateVariantStock = useUpdateVariantStockMutation()

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

  function startStockEdit(variant: ProductVariant) {
    setEditingId(variant.id)
    setEditValue(variant.stock_quantity)
  }

  function selectCategory(value: number | null) {
    setCategoryId(value)
    setPage(1)
  }

  function openEditProduct(product: Product) {
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      image_url: product.image_url ?? '',
      sku: product.sku ?? '',
      categoryId: product.category_id ?? null,
      price: String(product.price),
    })
  }

  function openCreateVariant(product: Product) {
    setVariantForm({
      productId: product.id,
      variantId: null,
      sku: '',
      name: '',
      colour: '',
      weight: '',
      weight_unit: 'g',
      price: String(product.price),
      stock: '0',
    })
  }

  function openEditVariant(product: Product, variant: ProductVariant) {
    setVariantForm({
      productId: product.id,
      variantId: variant.id,
      sku: variant.sku,
      name: variant.name ?? '',
      colour: variant.colour ?? '',
      weight: variant.weight ? String(Number(variant.weight)) : '',
      weight_unit: variant.weight_unit ?? '',
      price: String(variant.price),
      stock: String(variant.stock_quantity),
    })
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    const parsedPrice = Number(newProduct.price)
    const parsedStock = Number(newProduct.stock)

    await createProduct.mutateAsync({
      name: newProduct.name,
      description: newProduct.description || undefined,
      image_url: newProduct.image_url || undefined,
      price: parsedPrice,
      category_id: newProduct.categoryId ?? undefined,
      variants: [{
        sku: newProduct.sku,
        price: parsedPrice,
        stock_quantity: parsedStock,
      }],
    })
    setNewProduct(emptyProduct)
    setIsAddOpen(false)
  }

  async function handleEditProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!productForm) return

    const price = Number(productForm.price)

    await updateProduct.mutateAsync({
      id: productForm.id,
      payload: {
        name: productForm.name,
        price,
        description: productForm.description || undefined,
        image_url: productForm.image_url || undefined,
        sku: productForm.sku || undefined,
        category_id: productForm.categoryId ?? undefined,
      },
    })

    // pretul afisat in tabel vine din variante; la produsele cu o singura
    // varianta tinem pretul variantei sincron cu cel al produsului
    const product = products.find((p) => p.id === productForm.id)
    if (product && product.variants.length === 1 && product.variants[0].price !== price) {
      await updateVariant.mutateAsync({
        productId: productForm.id,
        variantId: product.variants[0].id,
        payload: { price },
      })
    }

    setProductForm(null)
  }

  async function handleSaveVariant(e: React.FormEvent) {
    e.preventDefault()
    if (!variantForm) return

    const payload = {
      sku: variantForm.sku,
      name: variantForm.name || null,
      colour: variantForm.colour || null,
      weight: variantForm.weight === '' ? null : Number(variantForm.weight),
      weight_unit: variantForm.weight_unit || null,
      price: Number(variantForm.price),
      stock_quantity: Number(variantForm.stock),
    }

    if (variantForm.variantId === null) {
      await createVariant.mutateAsync({ productId: variantForm.productId, payload })
    } else {
      await updateVariant.mutateAsync({
        productId: variantForm.productId,
        variantId: variantForm.variantId,
        payload,
      })
    }

    setVariantForm(null)
  }

  async function saveStockEdit(productId: number, variantId: number) {
    await updateVariantStock.mutateAsync({ productId, variantId, stock: editValue })
    setEditingId(null)
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
          <Button size="icon-sm" variant="ghost" onClick={() => saveStockEdit(product.id, variant.id)}>
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
        <Button size="icon-sm" variant="ghost" onClick={() => startStockEdit(variant)}>
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
                <Field label={t('stock.fieldName')}>
                  <Input
                    placeholder={t('stock.fieldNamePlaceholder')}
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </Field>
                <Field label={t('stock.fieldDescription')}>
                  <Input
                    placeholder={t('stock.fieldDescriptionPlaceholder')}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </Field>
                <Field label={t('stock.fieldImageUrl')}>
                  <Input
                    placeholder={t('stock.fieldImageUrlPlaceholder')}
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  />
                </Field>
                <Field label={t('stock.fieldSku')}>
                  <Input
                    placeholder={t('stock.fieldSkuPlaceholder')}
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    required
                  />
                </Field>
                <Field label={t('stock.fieldCategory')}>
                  <CategorySelect
                    value={newProduct.categoryId}
                    onChange={(value) => setNewProduct({ ...newProduct, categoryId: value })}
                    categories={categories}
                    nullLabel={t('stock.noCategory')}
                  />
                </Field>
                <Field label={t('stock.fieldStock')}>
                  <Input
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    required
                  />
                </Field>
                <Field label={t('stock.fieldPrice')}>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </Field>
                <DialogFooter>
                  <Button type="submit">{t('stock.add')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={productForm !== null} onOpenChange={(open) => !open && setProductForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('stock.editProductTitle')}</DialogTitle>
          </DialogHeader>
          {productForm && (
            <form onSubmit={handleEditProduct} className="flex flex-col gap-3">
              <Field label={t('stock.fieldName')}>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </Field>
              <Field label={t('stock.fieldDescription')}>
                <Input
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </Field>
              <Field label={t('stock.fieldImageUrl')}>
                <Input
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                />
              </Field>
              <Field label={t('stock.fieldSku')}>
                <Input
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                />
              </Field>
              <Field label={t('stock.fieldCategory')}>
                <CategorySelect
                  value={productForm.categoryId}
                  onChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                  categories={categories}
                  nullLabel={t('stock.noCategory')}
                />
              </Field>
              <Field label={t('stock.fieldPrice')}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                />
              </Field>
              <DialogFooter>
                <Button type="submit">{t('stock.save')}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={variantForm !== null} onOpenChange={(open) => !open && setVariantForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {variantForm?.variantId === null ? t('stock.newVariantTitle') : t('stock.editVariantTitle')}
            </DialogTitle>
          </DialogHeader>
          {variantForm && (
            <form onSubmit={handleSaveVariant} className="flex flex-col gap-3">
              <Field label={t('stock.fieldSku')}>
                <Input
                  value={variantForm.sku}
                  onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                  required
                />
              </Field>
              <Field label={t('stock.fieldVariantName')}>
                <Input
                  value={variantForm.name}
                  onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                />
              </Field>
              <Field label={t('stock.fieldColour')}>
                <Input
                  value={variantForm.colour}
                  onChange={(e) => setVariantForm({ ...variantForm, colour: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('stock.fieldWeight')}>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={variantForm.weight}
                    onChange={(e) => setVariantForm({ ...variantForm, weight: e.target.value })}
                  />
                </Field>
                <Field label={t('stock.fieldWeightUnit')}>
                  <Input
                    placeholder="g / kg / ml"
                    value={variantForm.weight_unit}
                    onChange={(e) => setVariantForm({ ...variantForm, weight_unit: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t('stock.fieldPrice')}>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={variantForm.price}
                    onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                    required
                  />
                </Field>
                <Field label={t('stock.fieldStock')}>
                  <Input
                    type="number"
                    min="0"
                    value={variantForm.stock}
                    onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                    required
                  />
                </Field>
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
                        <Button size="icon-sm" variant="ghost" onClick={() => toggleExpanded(product.id)}>
                          {isExpanded
                            ? <ChevronDown className="h-4 w-4" />
                            : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        <span>{product.name || '-'}</span>
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
                        single ? variantLabel(product, single, t) : '-'
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
                        <Button size="icon-sm" variant="ghost" onClick={() => deleteProduct.mutateAsync(product.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )

                if (!isExpanded) {
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
                          {variantLabel(product, variant, t)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
                      <TableCell />
                      <TableCell>{renderStockEditor(product, variant)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatPrice(variant.price)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="icon-sm" variant="ghost" onClick={() => openEditVariant(product, variant)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => deleteVariant.mutateAsync({ productId: product.id, variantId: variant.id })}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )),
                  <TableRow key={`add-v-${product.id}`} className="bg-muted/30">
                    <TableCell />
                    <TableCell colSpan={6}>
                      <Button size="sm" variant="ghost" onClick={() => openCreateVariant(product)}>
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        {t('stock.addVariant')}
                      </Button>
                    </TableCell>
                  </TableRow>,
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
