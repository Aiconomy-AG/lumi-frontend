import { useTranslation } from 'react-i18next'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog'
import { PaginationFooter } from '@/components/ui/pagination-footer'
import { useState, useRef, useEffect } from 'react'
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
    const [pendingDelete, setPendingDelete] = useState<User | null>(null)
    
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0)
    }, [page, perPage])

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

    const total = filtered.length
    const last_page = Math.ceil(total / perPage) || 1
    const meta = { current_page: page, last_page, total }
    const paginatedUsers = filtered.slice((page - 1) * perPage, page * perPage)

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

    async function handleConfirmDelete() {
        if (!pendingDelete) return
        await deleteMutation.mutateAsync(pendingDelete.id)
        setPendingDelete(null)
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
        <div className="p-6 h-full flex flex-col overflow-hidden ">
            <div className="mb-6 flex items-center justify-between gap-4">
                    <Input
                        placeholder={t('admin.searchPlaceholder')}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                        className="max-w-xs"
                    />
                    {isAdmin && (
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger
                                render={<Button className="shrink-0">{t('admin.addButton')}</Button>}
                            />
                            <DialogContent className="max-w-110">
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
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            {t('admin.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={createMutation.isPending}
                                        >
                                            {t('admin.save')}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
            </div>

            {isLoading ? (
                <p className="text-muted-foreground">{t('admin.loading')}</p>
            ) : (
                <div ref={scrollRef} className="flex-1 bg-zinc-900 overflow-y-auto min-h-0 pr-2 border rounded-md ">
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
                        {paginatedUsers.map((user) => (
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
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleResendInvite(user)}
                                                        disabled={resendInviteMutation.isPending}
                                                    >
                                                        Resend invite
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => setPendingDelete(user)}
                                                    disabled={user.id === currentUser?.id || deleteMutation.isPending}
                                                >
                                                    {t('admin.delete')}
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleReactivate(user)}
                                                disabled={reactivateMutation.isPending}
                                            >
                                                {t('admin.reactivate')}
                                            </Button>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>
            )}

            {filtered.length > 0 && (
                <PaginationFooter 
                    page={page} 
                    setPage={setPage} 
                    perPage={perPage} 
                    setPerPage={setPerPage} 
                    lastPage={meta.last_page} 
                    total={meta.total} 
                />
            )}

            <ConfirmDeleteDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => { if (!open) setPendingDelete(null) }}
                title={t('admin.delete')}
                description={t('admin.deleteConfirm')}
                confirmLabel={t('admin.delete')}
                cancelLabel={t('admin.cancel')}
                onConfirm={handleConfirmDelete}
                isPending={deleteMutation.isPending}
            />
        </div>
    )
}
