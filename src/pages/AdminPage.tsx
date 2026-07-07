import { useEffect, useState } from 'react'
import { getUsers } from '@/api/client'
import type { User } from '@/types/user'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        getUsers()
            .then(setUsers)
            .finally(() => setLoading(false))
    }, [])

    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{users.length} users</p>
                <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            {loading ? (
                <p className="text-muted-foreground">Loading...</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                <TableCell>{user.team}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                  <span className={user.status === 'online' ? 'text-green-600' : 'text-muted-foreground'}>
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