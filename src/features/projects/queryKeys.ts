export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: number) => [...projectKeys.all, id] as const,
}
