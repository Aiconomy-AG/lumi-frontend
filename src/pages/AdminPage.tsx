import { useTranslation } from 'react-i18next'
import { getUsers } from '@/api/client'
import {useQuery} from '@tanstack/react-query'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {useState} from "react";

export default function AdminPage() {
    const { t } = useTranslation()

    const [search, setSearch] = useState('')

    const { data: users = [], isLoading} = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
    })

    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{t('admin.usersCount', { count: users.length })}</p>
                <Input
                    placeholder={t('admin.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
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
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                  <span className={user.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}>
                    {user.status}
                  </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}