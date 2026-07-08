import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { startTimeEntry, stopTimeEntry } from '@/api/client'

interface TimeTrackingContextValue {
    activeTaskId: number | null
    elapsedSeconds: number
    isRunning: boolean
    start: (taskId: number) => Promise<void>
    stop: () => Promise<void>
}

const TimeTrackingContext = createContext<TimeTrackingContextValue | null>(null)

export function TimeTrackingProvider({ children }: { children: ReactNode }) {
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
    const [activeEntryId, setActiveEntryId] = useState<number | null>(null)
    const [startedAt, setStartedAt] = useState<number | null>(null)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)

    useEffect(() => {
        if (startedAt === null) return
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000))
        }, 1000)
        return () => clearInterval(interval)
    }, [startedAt])

    const start = async (taskId: number) => {
        const entry = await startTimeEntry(taskId)
        setActiveTaskId(taskId)
        setActiveEntryId(entry.id)
        setStartedAt(new Date(entry.started_at).getTime())
        setElapsedSeconds(0)
    }

    const stop = async () => {
        if (activeTaskId === null || activeEntryId === null) return
        await stopTimeEntry(activeTaskId, activeEntryId)
        setActiveTaskId(null)
        setActiveEntryId(null)
        setStartedAt(null)
        setElapsedSeconds(0)
    }

    return (
        <TimeTrackingContext.Provider
            value={{ activeTaskId, elapsedSeconds, isRunning: activeTaskId !== null, start, stop }}
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