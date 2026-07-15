import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { User } from '@/types/user'

export function useProfileDialog(candidates: (User | undefined)[][]) {
    const [searchParams, setSearchParams] = useSearchParams()
    const profileIdFromSearch = searchParams.get('profile')

    const profileUser = useMemo(() => {
        if (!profileIdFromSearch) return null

        const profileId = Number(profileIdFromSearch)
        if (!Number.isFinite(profileId)) return null

        for (const list of candidates) {
            const match = list.find((candidate) => candidate?.id === profileId)
            if (match) return match
        }

        return null
    }, [profileIdFromSearch, candidates])

    const openProfile = useCallback(
        (userId: number) => {
            const nextParams = new URLSearchParams(searchParams)
            nextParams.set('profile', String(userId))
            setSearchParams(nextParams)
        },
        [searchParams, setSearchParams]
    )

    const closeProfile = useCallback(() => {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.delete('profile')
        setSearchParams(nextParams, { replace: true })
    }, [searchParams, setSearchParams])

    return { profileUser, openProfile, closeProfile }
}
