import { useAuth } from '@/features/auth/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

export default function RequireStaff() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!user || user.role === 'client') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
