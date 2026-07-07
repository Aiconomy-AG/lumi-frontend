import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface TimeTrackingContextValue {
    activeTaskId: number | null
    todaySeconds: number
    isRunning: boolean
    start: (taskId: number) => void
    stop: () => void
}

const TimeTrackingContext = createContext<TimeTrackingContextValue | null>(null)

function todayKey() {
    return `timeTracking:${new Date().toISOString().slice(0, 10)}`
}

export function TimeTrackingProvider({ children }: { children: ReactNode }) {
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null)
    const [todaySeconds, setTodaySeconds] = useState<number>(() => {
        const stored = localStorage.getItem(todayKey())
        return stored ? parseInt(stored, 10) : 0
    })

    useEffect(() => {
        localStorage.setItem(todayKey(), String(todaySeconds))
    }, [todaySeconds])

    useEffect(() => {
        if (activeTaskId === null) return
        const interval = setInterval(() => {
            setTodaySeconds((prev) => prev + 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [activeTaskId])

    const start = (taskId: number) => setActiveTaskId(taskId)
    const stop = () => setActiveTaskId(null)

    return (
        <TimeTrackingContext.Provider
            value={{ activeTaskId, todaySeconds, isRunning: activeTaskId !== null, start, stop }}
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