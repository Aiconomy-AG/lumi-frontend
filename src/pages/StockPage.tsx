import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { getProducts, createProduct, updateVariantStock, deleteProduct } from '@/api/client'
import type { Product, ProductVariant } from '@/types/product'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {useState} from "react";


const emptyProduct = { name: '', description: '', image_url: '', sku: '', categoryName: '', stock: 0, price: 0 }

function renderStock(stock: number, t: TFunction) {
  if (stock === 0) {
    return <span className="font-medium text-red-500">{t('stock.outOfStockLabel')}</span>
  }
  if (stock <= 5) {
    return <span className="font-medium text-yellow-500">{stock}</span>
  }
  return <span className="font-medium text-green-600">{stock}</span>
}

interface StockRow {
  product: Product
  variant: ProductVariant
}

export default function StockPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newProduct, setNewProduct] = useState(emptyProduct)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createProduct,
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


  const rows: StockRow[] = products.flatMap((product) =>
    product.variants.map((variant) => ({ product, variant }))
  )

  const filtered = rows.filter((row) =>
    row.product.name.toLowerCase().includes(search.toLowerCase())
  )

  const lowStock = rows.filter((r) => r.variant.stock_quantity > 0 && r.variant.stock_quantity <= 5).length
  const outOfStock = rows.filter((r) => r.variant.stock_quantity === 0).length


  function startEdit(variant: ProductVariant) {
    setEditingId(variant.id)
    setEditValue(variant.stock_quantity)
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    const productId = Date.now()
    await createMutation.mutateAsync({
      name: newProduct.name,
      description: newProduct.description || undefined,
      image_url: newProduct.image_url || undefined,
      price: newProduct.price,
      category: newProduct.categoryName ? { id: Date.now(), name: newProduct.categoryName } : undefined,
      variants: [{ id: productId + 1, product_id: productId, sku: newProduct.sku, price: newProduct.price, weight: 1, weight_unit: 'kg', stock_quantity: newProduct.stock }],
    })
    setNewProduct(emptyProduct)
    setIsAddOpen(false)
  }

  async function saveEdit(productId: number, variantId: number) {
    await updateStockMutation.mutateAsync({ productId, variantId, stock: editValue })
    setEditingId(null)
  }

  async function handleDelete(id: number) {
    await deleteMutation.mutateAsync(id)
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{t('stock.productsCount', { count: products.length })}</span>
          <span className="text-muted-foreground">{t('stock.variantsCount', { count: rows.length })}</span>
          {lowStock > 0 && <span className="text-yellow-500">{t('stock.lowStock', { count: lowStock })}</span>}
          {outOfStock > 0 && <span className="text-red-500">{t('stock.outOfStock', { count: outOfStock })}</span>}
        </div>
        <div className="flex items-center gap-3">
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
                  <Input
                    placeholder={t('stock.fieldCategoryPlaceholder')}
                    value={newProduct.categoryName}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldStock')}</label>
                  <Input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">{t('stock.fieldPrice')}</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
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

      {isLoading ? (
        <p className="text-muted-foreground">{t('admin.loading')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('stock.columnProduct')}</TableHead>
              <TableHead>{t('stock.columnSku')}</TableHead>
              <TableHead>{t('stock.columnCategory')}</TableHead>
              <TableHead>{t('stock.columnStock')}</TableHead>
              <TableHead className="text-right">{t('stock.columnPrice')}</TableHead>
              <TableHead className="text-right">{t('stock.columnActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(({ product, variant }) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{variant.sku}</TableCell>
                <TableCell>{product.category?.name}</TableCell>
                <TableCell>
                  {editingId === variant.id ? (
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
                  ) : (
                    <div className="flex items-center gap-2">
                      {renderStock(variant.stock_quantity, t)}
                      <Button size="icon-sm" variant="ghost" onClick={() => startEdit(variant)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">{variant.price.toFixed(2)} lei</TableCell>
                <TableCell className="text-right">
                  <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}