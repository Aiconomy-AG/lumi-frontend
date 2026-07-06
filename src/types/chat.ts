export interface Person {
    id: number
    name: string
    role: string
    online: boolean
}

export interface Message {
    id: number
    personId: number
    text: string
    fromMe: boolean
    time: string
}