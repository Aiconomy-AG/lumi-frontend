export const callKeys = {
  all: ['workspace-calls'] as const,
  active: (clientInstanceId: string) => [...callKeys.all, 'active', clientInstanceId] as const,
}

