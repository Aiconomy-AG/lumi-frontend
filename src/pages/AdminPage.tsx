import { useTranslation } from 'react-i18next'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'
import type { User } from '@/types/user'
import { useAuth } from '@/features/auth/AuthContext'
import {
    useCreateUserMutation,
    useDeactivateUserMutation,
    useResendInviteMutation,
    useReactivateUserMutation,
    useUsersQuery,
} from '@/features/users'

export default function AdminPage() {
    const { t } = useTranslation()
    const { user: currentUser, isAdmin } = useAuth()

    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [email, setEmail] = useState('')
    const [role, setRole] = useState<User['role']>('employee')

    const { data: users = [], isLoading } = useUsersQuery()
    const createMutation = useCreateUserMutation()
    const deleteMutation = useDeactivateUserMutation()
    const reactivateMutation = useReactivateUserMutation()
    const resendInviteMutation = useResendInviteMutation()

    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
    )

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        await createMutation.mutateAsync({
            email: email.trim().toLowerCase(),
            role: role as 'admin' | 'employee',
        })
        setEmail('')
        setRole('employee')
        setIsModalOpen(false)
    }

    function handleDelete(user: User) {
        if (window.confirm(t('admin.deleteConfirm'))) {
            void deleteMutation.mutateAsync(user.id)
        }
    }

    function handleReactivate(user: User) {
        void reactivateMutation.mutateAsync(user.id)
    }

    function handleResendInvite(user: User) {
        void resendInviteMutation.mutateAsync(user.id)
    }

    const roleLabels: Record<User['role'], string> = {
        admin: t('admin.roleAdmin'),
        employee: t('admin.roleEmployee'),
        client: t('admin.roleClient'),
    }
    const statusClassNames: Record<User['status'], string> = {
        available: 'text-green-600',
        busy: 'text-rose-500',
        away: 'text-amber-500',
        offline: 'text-muted-foreground',
    }

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">{t('admin.usersCount', { count: users.length })}</p>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder={t('admin.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-xs"
                    />
                    {isAdmin && (
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger className="btn shrink-0">
                                {t('admin.addButton')}
                            </DialogTrigger>
                            <DialogContent className="max-w-[440px]">
                                <DialogHeader>
                                    <DialogTitle>{t('admin.newUserTitle')}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="flex flex-col gap-4 mt-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">{t('admin.fieldEmail')}</label>
                                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('admin.emailPlaceholder')} required />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">{t('admin.fieldRole')}</label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value as User['role'])}
                                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus:border-ring cursor-pointer"
                                        >
                                            <option value="employee">{roleLabels.employee}</option>
                                            <option value="admin">{roleLabels.admin}</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="rounded-md px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            {t('admin.cancel')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createMutation.isPending}
                                            className="btn disabled:opacity-50"
                                        >
                                            {t('admin.save')}
                                        </button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {isLoading ? (
                <p className="text-muted-foreground">{t('admin.loading')}</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.columnUser')}</TableHead>
                            <TableHead>{t('admin.columnEmail')}</TableHead>
                            <TableHead>{t('admin.columnPhone')}</TableHead>
                            <TableHead>{t('admin.columnRole')}</TableHead>
                            <TableHead>{t('admin.columnStatus')}</TableHead>
                            {isAdmin && <TableHead className="text-right">{t('admin.columnActions')}</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                <TableCell>{user.phone_number}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                        {roleLabels[user.role]}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className={statusClassNames[user.status]}>
                                        {t(`userStatus.${user.status}`)}
                                    </span>
                                    {!user.is_active && <span className="ml-2 text-xs text-red-400">{t('admin.inactive')}</span>}
                                </TableCell>
                                {isAdmin && (
                                    <TableCell className="text-right">
                                        {user.is_active ? (
                                            <div className="flex justify-end gap-2">
                                                {user.must_change_password && (
                                                    <button
                                                        onClick={() => handleResendInvite(user)}
                                                        disabled={resendInviteMutation.isPending}
                                                        className="btn-sm disabled:opacity-30"
                                                    >
                                                        Resend invite
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    disabled={user.id === currentUser?.id || deleteMutation.isPending}
                                                    className="btn-sm disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    {t('admin.delete')}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleReactivate(user)}
                                                disabled={reactivateMutation.isPending}
                                                className="btn-sm disabled:opacity-30"
                                            >
                                                {t('admin.reactivate')}
                                            </button>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
