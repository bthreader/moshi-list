export interface ITask {
    task: string
    listId: string 
    notes?: string
}

export interface ITaskInDB extends ITask {
    _id: string
    username: string
    complete: boolean
    pinned: boolean
}

export type TaskType = "pinned" | "normal" | "completed"