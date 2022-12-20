export default interface Task {
    _id: string
    username: string
    task: string
    listId: string 
    notes?: string
    complete?: boolean
    pinned?: boolean
}