import { useEffect, useState } from 'react'
import { getProducts, createProduct, updateProductStock, deleteProduct } from '@/api/client'
import type { Product } from '@/types/product'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

const emptyProduct = { name: '', sku: '', category: '', stock: 0, price: 0 }

function renderStock(stock: number) {
  if (stock === 0) {
    return <span className="font-medium text-red-500">Out of stock</span>
  }
  if (stock <= 5) {
    return <span className="font-medium text-yellow-500">{stock}</span>
  }
  return <span className="font-medium text-green-600">{stock}</span>
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newProduct, setNewProduct] = useState(emptyProduct)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length
  const outOfStock = products.filter((p) => p.stock === 0).length

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault()
    const created = await createProduct(newProduct)
    setProducts((prev) => [...prev, created])
    setNewProduct(emptyProduct)
    setIsAddOpen(false)
  }

  function startEdit(product: Product) {
    setEditingId(product.id)
    setEditValue(product.stock)
  }

  async function saveEdit(id: number) {
    const updated = await updateProductStock(id, editValue)
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    setEditingId(null)
  }

  async function handleDelete(id: number) {
    await deleteProduct(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{products.length} products</span>
          {lowStock > 0 && <span className="text-yellow-500">{lowStock} low stock</span>}
          {outOfStock > 0 && <span className="text-red-500">{outOfStock} out of stock</span>}
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger
              render={
                <Button>
                  <Plus className="mr-1 h-4 w-4" />
                  Add product
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="flex flex-col gap-3">
                <Input
                  placeholder="Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  required
                />
                <Input
                  placeholder="SKU"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  required
                />
                <Input
                  placeholder="Category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                />
                <DialogFooter>
                  <Button type="submit">Add</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>
                  {editingId === product.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        className="h-7 w-20"
                        autoFocus
                      />
                      <Button size="icon-sm" variant="ghost" onClick={() => saveEdit(product.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {renderStock(product.stock)}
                      <Button size="icon-sm" variant="ghost" onClick={() => startEdit(product)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">{product.price.toFixed(2)} lei</TableCell>
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