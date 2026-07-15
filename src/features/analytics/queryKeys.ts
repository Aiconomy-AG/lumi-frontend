export const analyticsKeys = {
  all: ['analytics'] as const,
  mostWishlistedProducts: () => [...analyticsKeys.all, 'products', 'most-wishlisted'] as const,
}
