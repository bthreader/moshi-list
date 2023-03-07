export interface ITask {
  task: string;
  listId: string;
  notes?: string;
}

export interface ITaskForRequest {
  task: string;
  list_id: string;
  notes?: string;
}

export interface ITaskInDB extends ITask {
  _id: string;
  username: string;
  complete: boolean;
  pinned: boolean;
}

export type TaskType = 'pinned' | 'normal' | 'completed';

export function castTaskToTaskForRequest(task: ITask): ITaskForRequest {
  const taskForRequest: ITaskForRequest = {
    task: task.task,
    list_id: task.listId,
  };
  if (typeof task.notes !== 'undefined') {
    taskForRequest.notes = task.notes;
  }
  return taskForRequest;
}
