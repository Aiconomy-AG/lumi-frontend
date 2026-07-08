export const orderKeys = {
  all: ['orders'] as const,
  list: (page: number) => [...orderKeys.all, page] as const,
}
