import type { User } from '../types/user'

export const mockUsers: User[] = [
  { id: 1, name: 'Ana Popescu',      email: 'ana.popescu@company.ro',      team: 'Backend',  role: 'admin',  status: 'online'  },
  { id: 2, name: 'Mihai Ionescu',    email: 'mihai.ionescu@company.ro',    team: 'Frontend', role: 'member', status: 'online'  },
  { id: 3, name: 'Elena Dumitrescu', email: 'elena.dumitrescu@company.ro', team: 'QA',       role: 'member', status: 'offline' },
  { id: 4, name: 'Radu Popa',        email: 'radu.popa@company.ro',        team: 'Backend',  role: 'member', status: 'online'  },
  { id: 5, name: 'Cristina Marin',   email: 'cristina.marin@company.ro',   team: 'Design',   role: 'viewer', status: 'offline' },
  { id: 6, name: 'Alexandru Stan',   email: 'alex.stan@company.ro',        team: 'Frontend', role: 'member', status: 'offline' },
]