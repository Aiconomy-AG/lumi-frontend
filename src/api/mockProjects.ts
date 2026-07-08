import type { Project } from '@/types/project'
import type { Task } from '@/types/task'

// date fictive cat timp backend-ul de proiecte nu e gata
export const mockProjects: Project[] = [
    { id: 1, name: 'Website redesign', description: 'Refacere landing page și dashboard', deadline: '2026-08-01', status: 'in_progress' },
    { id: 2, name: 'API v2', description: 'Migrare endpointuri la noua versiune', deadline: '2026-07-20', status: 'to_do' },
    { id: 3, name: 'Aplicație mobilă', description: 'MVP pentru iOS și Android', deadline: '2026-09-15', status: 'blocked' },
]

export const mockProjectTasks: Task[] = [
    { id: 101, project_id: 1, title: 'Design hero section', status: 'in_progress', due_date: '2026-07-15', assignees: [] },
    { id: 102, project_id: 1, title: 'Implementare header', status: 'to_do', due_date: '2026-07-18', assignees: [] },
    { id: 103, project_id: 2, title: 'Endpoint /users', status: 'complete', due_date: '2026-07-10', assignees: [] },
    { id: 104, project_id: 2, title: 'Endpoint /orders', status: 'to_do', due_date: '2026-07-19', assignees: [] },
]
