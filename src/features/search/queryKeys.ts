export const searchKeys = {
  all: ['search'] as const,
  query: (q: string, types?: string[], includeCompleted?: boolean) =>
    [...searchKeys.all, 'query', q, types ?? [], includeCompleted ?? false] as const,
}
