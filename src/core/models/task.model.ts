export interface Task {
    task: string
    listId: string 
    notes?: string
}

export interface TaskInDB extends Task {
    _id: string
    username: string
    complete: boolean
    pinned: boolean
}

export type TaskType = "pinned" | "normal" | "completed"