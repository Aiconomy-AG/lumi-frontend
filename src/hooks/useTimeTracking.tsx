import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useStartTimeEntryMutation, useStopTimeEntryMutation } from '@/features/timeTracking'
import { timeEntryKeys } from '@/features/timeTracking/queryKeys'
import { getActiveTimeEntry } from '@/api/timeEntries'
import { useAuth } from '@/features/auth/AuthContext'
import { connectEcho } from '@/lib/echo'
import type { TaskTimeEntry } from '@/types/task'

interface TimeTrackingContextValue {
    activeTaskId: number | null
    startedAt: number | null
    isRunning: boolean
    start: (taskId: number) => Promise<void>
    stop: () => Promise<void>
}

const TimeTrackingContext = createContext<TimeTrackingContextValue | null>(null)

export function TimeTrackingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const queryClient = useQueryClient()
    const startMutation = useStartTimeEntryMutation()
    const stopMutation = useStopTimeEntryMutation()

    const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
    const [activeEntryId, setActiveEntryId] = useState<number | null>(null)
    const [startedAt, setStartedAt] = useState<number | null>(null)

    const activeEntryIdRef = useRef<number | null>(null)
    const activeTaskIdRef = useRef<number | null>(null)
    useEffect(() => {
        activeEntryIdRef.current = activeEntryId
        activeTaskIdRef.current = activeTaskId
    }, [activeEntryId, activeTaskId])

    const applyEntry = useCallback((entry: TaskTimeEntry | null) => {
        if (entry && !entry.stopped_at) {
            setActiveTaskId(entry.task_id)
            setActiveEntryId(entry.id)
            setStartedAt(new Date(entry.started_at).getTime())
        } else {
            setActiveTaskId(null)
            setActiveEntryId(null)
            setStartedAt(null)
        }
    }, [])

    const activeQuery = useQuery({
        queryKey: ['timeTracking', 'active', user?.id],
        queryFn: getActiveTimeEntry,
        enabled: !!user,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    })

    useEffect(() => {
        if (!user) {
            applyEntry(null)
            return
        }
        if (activeQuery.data !== undefined) {
            applyEntry(activeQuery.data)
        }
    }, [user, activeQuery.data, applyEntry])

    useEffect(() => {
        if (!user) return
        const echo = connectEcho()
        if (!echo) return

        const channelName = `users.${user.id}`
        const channel = echo.private(channelName)

        const invalidate = (taskId: number) => {
            void queryClient.invalidateQueries({ queryKey: timeEntryKeys.list(taskId) })
            void queryClient.invalidateQueries({ queryKey: ['timeTracking', 'dailyTotal'] })
            void queryClient.invalidateQueries({ queryKey: ['timeTracking', 'active', user.id] })
        }

        channel.listen('.time-entry.started', (entry: TaskTimeEntry) => {
            applyEntry(entry)
            invalidate(entry.task_id)
        })

        channel.listen('.time-entry.stopped', (entry: TaskTimeEntry) => {
            if (activeEntryIdRef.current === entry.id) {
                applyEntry(null)
            }
            invalidate(entry.task_id)
        })

        channel.listen('.notification.delivered', (notification: any) => {
            if (notification?.event?.type === 'task_unassigned') {
                const taskId = notification.event.task_id
                const currentTaskId = activeTaskIdRef.current
                const currentEntryId = activeEntryIdRef.current
                if (currentTaskId !== null && currentEntryId !== null && currentTaskId === taskId) {
                    stopMutation.mutate({ taskId: currentTaskId, entryId: currentEntryId })
                    applyEntry(null)
                }
            }
        })

        return () => {
            echo.leave(channelName)
        }
    }, [user?.id, applyEntry, queryClient])

    const start = async (taskId: number) => {
        const entry = await startMutation.mutateAsync(taskId)
        applyEntry(entry)
    }

    const stop = async () => {
        if (activeTaskId === null || activeEntryId === null) return
        await stopMutation.mutateAsync({ taskId: activeTaskId, entryId: activeEntryId })
        applyEntry(null)
    }

    return (
        <TimeTrackingContext.Provider
            value={{ activeTaskId, startedAt, isRunning: activeTaskId !== null, start, stop }}
        >
            {children}
        </TimeTrackingContext.Provider>
    )
}

export function useTimeTracking() {
    const ctx = useContext(TimeTrackingContext)
    if (!ctx) throw new Error('useTimeTracking must be used within TimeTrackingProvider')
    return ctx
}

export function useElapsedSeconds(startedAt: number | null) {
    const [elapsedSeconds, setElapsedSeconds] = useState(() =>
        startedAt === null ? 0 : Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
    )

    useEffect(() => {
        if (startedAt === null) {
            setElapsedSeconds(0)
            return
        }
        const update = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)))
        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [startedAt])

    return elapsedSeconds
}
