export const timeEntryKeys = {
  all: ['time-entries'] as const,
  list: (taskId: number) => [...timeEntryKeys.all, taskId] as const,
}
