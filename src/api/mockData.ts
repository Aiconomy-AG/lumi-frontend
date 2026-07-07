import type { User } from '../types/user'

export const mockUsers: User[] = [
  { id: 1, name: 'Ana Popescu',      email: 'ana.popescu@company.ro',      phone_number: '0721000001', role: 'admin',    status: 'active'   },
  { id: 2, name: 'Mihai Ionescu',    email: 'mihai.ionescu@company.ro',    phone_number: '0721000002', role: 'employee', status: 'active'   },
  { id: 3, name: 'Elena Dumitrescu', email: 'elena.dumitrescu@company.ro', phone_number: '0721000003', role: 'employee', status: 'inactive' },
  { id: 4, name: 'Radu Popa',        email: 'radu.popa@company.ro',        phone_number: '0721000004', role: 'employee', status: 'active'   },
  { id: 5, name: 'Cristina Marin',   email: 'cristina.marin@company.ro',   phone_number: '0721000005', role: 'manager',  status: 'inactive' },
  { id: 6, name: 'Alexandru Stan',   email: 'alex.stan@company.ro',        phone_number: '0721000006', role: 'employee', status: 'inactive' },
]