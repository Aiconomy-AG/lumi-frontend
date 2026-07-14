export const WORKSPACE_TIMEZONE = 'Europe/Bucharest'

export interface WorkspaceDateParts {
    year: string
    month: string
    day: string
    hour: number
    weekdayShort: string
    isWeekend: boolean
    dateKey: string
}

function readZonedPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
    return parts.find((part) => part.type === type)?.value ?? ''
}

export function getWorkspaceDateParts(date = new Date()): WorkspaceDateParts {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: WORKSPACE_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        hour12: false,
        weekday: 'short',
    }).formatToParts(date)

    const year = readZonedPart(parts, 'year')
    const month = readZonedPart(parts, 'month')
    const day = readZonedPart(parts, 'day')
    const weekdayShort = readZonedPart(parts, 'weekday')

    return {
        year,
        month,
        day,
        hour: Number(readZonedPart(parts, 'hour')),
        weekdayShort,
        isWeekend: weekdayShort === 'Sat' || weekdayShort === 'Sun',
        dateKey: `${year}-${month}-${day}`,
    }
}

export function getDashboardGreetingKey(date = new Date()): string {
    const { hour, isWeekend } = getWorkspaceDateParts(date)

    if (hour >= 5 && hour < 9) {
        return isWeekend ? 'dashboard.greetings.earlyMorningWeekend' : 'dashboard.greetings.earlyMorningWeekday'
    }

    if (hour >= 9 && hour < 12) {
        return 'dashboard.greetings.lateMorning'
    }

    if (hour >= 12 && hour < 17) {
        return 'dashboard.greetings.afternoon'
    }

    if (hour >= 17 && hour < 22) {
        return isWeekend ? 'dashboard.greetings.eveningWeekend' : 'dashboard.greetings.eveningWeekday'
    }

    return 'dashboard.greetings.night'
}

export function formatWorkspaceDate(date = new Date(), locale: string): string {
    return date.toLocaleDateString(locale, {
        timeZone: WORKSPACE_TIMEZONE,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })
}
