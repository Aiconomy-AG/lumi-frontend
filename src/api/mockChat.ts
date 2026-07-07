import type { Person, Message } from '../types/chat'

export const mockPeople: Person[] = [
    { id: 1, name: 'Mihai Ionescu',    role: 'Frontend', online: true  },
    { id: 2, name: 'Elena Dumitrescu', role: 'QA',       online: false },
    { id: 3, name: 'Radu Popa',        role: 'Backend',  online: true  },
    { id: 4, name: 'Cristina Marin',   role: 'Design',   online: false },
    { id: 5, name: 'Alexandru Stan',   role: 'Frontend', online: false },
]

export const mockMessages: Message[] = [
    { id: 1, personId: 1, text: 'Hey, did you push the latest changes?', fromMe: false, time: '09:14' },
    { id: 2, personId: 1, text: 'Yeah, just pushed. Check branch feat/auth', fromMe: true,  time: '09:16' },
    { id: 3, personId: 1, text: "Nice, I'll review it this afternoon",       fromMe: false, time: '09:17' },
    { id: 4, personId: 3, text: "I'll take a look after standup",            fromMe: true,  time: '10:05' },
]