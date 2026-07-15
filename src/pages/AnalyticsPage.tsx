import { Heart, ImageIcon, RefreshCw, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMostWishlistedProductsQuery } from '@/features/analytics'
import type { MostWishlistedProduct } from '@/types/analytics'

const CURRENCY = import.meta.env.VITE_CURRENCY ?? 'RON'

function formatPrice(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-'
  }

  return `${value.toFixed(2)} ${CURRENCY}`
}

function productSubtitle(product: MostWishlistedProduct): string {
  if (product.category_name) return product.category_name
  if (product.shopify_product_id) return product.shopify_product_id
  return '-'
}

export default function AnalyticsPage() {
  const { t } = useTranslation()
  const {
    data: products = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useMostWishlistedProductsQuery()

  const totalWishlistAdds = products.reduce((sum, product) => sum + product.wishlist_count, 0)
  const topProduct = products[0]

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t('analytics.eyebrow')}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            {t('analytics.title')}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            {t('analytics.subtitle')}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {t('analytics.refresh')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            {t('analytics.productsTracked')}
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{products.length}</p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Heart className="h-4 w-4 text-red-400" />
            {t('analytics.totalWishlistAdds')}
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">{totalWishlistAdds}</p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Heart className="h-4 w-4 text-red-400" />
            {t('analytics.topProduct')}
          </div>
          <p className="mt-3 truncate text-lg font-semibold text-white">
            {topProduct?.name ?? '-'}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
        <Table containerClassName="max-h-full bg-zinc-900">
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-zinc-400">{t('analytics.columnRank')}</TableHead>
              <TableHead className="text-zinc-400">{t('analytics.columnProduct')}</TableHead>
              <TableHead className="text-zinc-400">{t('analytics.columnSku')}</TableHead>
              <TableHead className="text-right text-zinc-400">{t('analytics.columnPrice')}</TableHead>
              <TableHead className="text-right text-zinc-400">{t('analytics.columnWishlistCount')}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={5}>
                    <div className="h-12 animate-pulse rounded-md bg-zinc-800/70" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-sm text-red-400">
                  {t('analytics.error')}
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-sm text-zinc-400">
                  {t('analytics.empty')}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, index) => (
                <TableRow key={product.id} className="hover:bg-zinc-800/60">
                  <TableCell className="font-medium text-zinc-400">#{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-zinc-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{product.name}</p>
                        <p className="truncate text-xs text-zinc-500">{productSubtitle(product)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-300">{product.sku || '-'}</TableCell>
                  <TableCell className="text-right text-zinc-300">{formatPrice(product.price)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className="gap-1 border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/10">
                      <Heart className="h-3 w-3 fill-current" />
                      {product.wishlist_count}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
