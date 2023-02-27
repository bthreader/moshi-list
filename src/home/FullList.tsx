import * as React from 'react'
import { ITaskInDB, TaskType } from "../core/models/task.model"
import { Box, Skeleton, Typography } from '@mui/material';
import axios from 'axios';
import AddTaskButton from './components/AddTaskButton';
import UpdateTaskDialog from './components/UpdateTaskDialog';
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import SubList from './components/SubList';
import ShowHideButton from './components/ShowHideButton';

interface IFullListProps {
    listId: string
}

export default function FullList(props: IFullListProps) {

    // -----------------------------------------------------------------------
    //  State
    // -----------------------------------------------------------------------

    const { instance, accounts } = useMsal();

    const [loaded, setLoaded] = React.useState(false);

    // Tasks
    const [pinnedTasks, setPinnedTasks] = React.useState(new Array<ITaskInDB>());
    const [tasks, setTasks] = React.useState(new Array<ITaskInDB>());
    const [completedTasks, setCompletedTasks] = React.useState(new Array<ITaskInDB>());
    const [showCompleted, setShowCompleted] = React.useState(false);

    // Update trigger
    const [tasksChanged, setTasksChanged] = React.useState(false);
    const triggerTasksChanged = React.useCallback(() => setTasksChanged(tasksChanged => !tasksChanged), [])

    // Update dialog
    const [selectedTask, setSelectedTask] = React.useState<ITaskInDB | null>(null)
    const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
    const closeUpdateDialog = React.useCallback(() => setUpdateDialogOpen(false), []);

    // Get access token
    const getAccessToken = React.useCallback(async () => {
        const accessTokenRequest = {account: accounts[0], scopes: ["api://"+process.env.REACT_APP_CLIENT_ID+"/user"]}
        try {
            // Get access token
            const access_token = (await instance.acquireTokenSilent(accessTokenRequest)).accessToken;
            return access_token
        }
        catch (e) {
            switch(e) {
                case InteractionRequiredAuthError: instance.acquireTokenPopup(accessTokenRequest);
            }
        }
    }, [instance, accounts]);

    // -----------------------------------------------------------------------
    //  State modifying functions
    // -----------------------------------------------------------------------

    const getTaskFromList = (index: number, taskType: TaskType): ITaskInDB => {
        switch (taskType) {
            case 'completed':  return completedTasks[index];
            case 'normal':  return tasks[index];
            case 'pinned': return pinnedTasks[index];
        }
    }

    const removeTaskFromList = (index: number, taskType: TaskType) => {
        let newList;

        switch (taskType) {
            case 'completed': 
                newList = [...completedTasks]
                newList.splice(index, 1);
                setCompletedTasks(newList); 
                return;
            case 'normal': 
                newList = [...tasks]
                newList.splice(index, 1);
                setTasks(newList);
                return;
            case 'pinned': 
                newList = [...pinnedTasks]
                newList.splice(index, 1);
                setPinnedTasks(newList); 
                return;
        }
    }

    const addTaskToList = (task: ITaskInDB, destinationTaskType: TaskType) => {
        let newList;

        switch (destinationTaskType) {
            case 'completed': 
                // Modify the task attributes to reflect where it's going
                task.complete = true;
                task.pinned = false;

                // Push
                newList = [...completedTasks]
                newList.push(task);
                setCompletedTasks(newList); 
                return;
            case 'normal':
                // Modify the task attributes to reflect where it's going
                task.complete = false;
                task.pinned = false;

                // Push
                newList = [...tasks]
                newList.push(task);
                setTasks(newList);
                return;
            case 'pinned':
                // Modify the task attributes to reflect where it's going
                task.pinned = true;

                // Push 
                newList = [...pinnedTasks];
                newList.push(task);
                setPinnedTasks(newList); 
                return;
        }
    }

    // -----------------------------------------------------------------------
    //  Handlers
    // -----------------------------------------------------------------------

    const handleToggleTaskComplete = (wasComplete: boolean, taskType: TaskType) => (index: number) => async () => {
        const access_token = await getAccessToken();

        // Get a copy of the task
        const taskCopy = getTaskFromList(index, taskType);

        // Remove it from where it was
        removeTaskFromList(index, taskType);

        // Put it where it's going
        if (wasComplete) { addTaskToList(taskCopy, 'normal')
        }
        else { addTaskToList(taskCopy, 'completed')}

        await axios.put(
            '/v1/tasks',
            {complete: !wasComplete},
            {params: {_id: taskCopy._id}, headers: {Authorization: `Bearer ${access_token}`}}
        );
    }

    const handleTaskDelete = (index: number, taskType: TaskType) => async () => {
        const access_token = await getAccessToken();
        removeTaskFromList(index, taskType);
        await axios.delete(
            '/v1/tasks',
            {
                params: {_id: getTaskFromList(index, taskType)._id}, 
                headers: {Authorization: `Bearer ${access_token}`}
            }
        )
    }

    const handleInfo = (taskIndex: number, taskType: TaskType) => () => {
        switch (taskType) {
            case 'completed': setSelectedTask(completedTasks[taskIndex]); break;
            case 'normal': setSelectedTask(tasks[taskIndex]); break;
            case 'pinned': setSelectedTask(pinnedTasks[taskIndex]); break;
        }
        setUpdateDialogOpen(true);
    }

    const handleToggleTaskPin = (wasPinned: boolean) => (index: number) => async () => {
        const access_token = await getAccessToken();

        // Get a copy of the task
        let from: TaskType;
        let to: TaskType;
        if (wasPinned) {from = 'pinned'; to = 'normal'}
        else {from = 'normal'; to = 'pinned'}

        const taskCopy = getTaskFromList(index, from);

        removeTaskFromList(index, from);
        addTaskToList(taskCopy, to);

        await axios.put(
            '/v1/tasks',
            {pinned: !wasPinned},
            {
                params: {_id: taskCopy._id}, 
                headers: {Authorization: `Bearer ${access_token}`}
            }
        );
    }

    // -----------------------------------------------------------------------
    //  State update
    // -----------------------------------------------------------------------

    React.useEffect(() => {

        setLoaded(false);

        const getTask = async () => {
            const access_token = await getAccessToken();

            // Pinned
            const pinnedTaskReponse = await axios.get(
                '/v1/tasks', 
                {
                    params: {list_id:props.listId, complete:false, pinned:true}, 
                    headers: {Authorization: `Bearer ${access_token}`}
                }
            );
            setPinnedTasks(pinnedTaskReponse.data);

            // Outstanding but not pinned
            const taskResponse = await axios.get(
                '/v1/tasks', 
                {
                    params: {list_id:props.listId, complete:false, pinned:false}, 
                    headers: {Authorization: `Bearer ${access_token}`}
                }
            );
            setTasks(taskResponse.data);

            // Completed
            const completedTaskRespone = await axios.get(
                '/v1/tasks',
                {
                    params: {list_id:props.listId, complete:true}, 
                    headers: {Authorization: `Bearer ${access_token}`}
                }
            );
            setCompletedTasks(completedTaskRespone.data);

            setLoaded(true);
        }

        getTask();

    }, [props.listId, tasksChanged, getAccessToken])

    // -----------------------------------------------------------------------
    //  Content
    // -----------------------------------------------------------------------

    // Not loaded
    if (!loaded) {
        return (
            <Box>
                {[1,2,3].map((_) => 
                    <Typography variant='h4'>{<Skeleton/>}</Typography>
                )}
            </Box>
        )
    }

    // Completed tasks
    let completedSection;
    if (showCompleted && completedTasks.length > 0) {
        completedSection = <SubList
            tasks={completedTasks}
            taskType='completed'
            handleCompletionChange={handleToggleTaskComplete(true, 'completed')}
            handleInfo={handleInfo}
            handleDelete={handleTaskDelete}
        />
    }

    // -----------------------------------------------------------------------
    //  Render
    // -----------------------------------------------------------------------

    return (
        <Box>

        {/* Tasks */}

        <Box maxHeight={550} overflow='auto'>
            {/* Pinned */}
            {pinnedTasks.length > 0 && 
                <SubList
                    tasks={pinnedTasks}
                    taskType='pinned'
                    handleCompletionChange={handleToggleTaskComplete(false, 'pinned')}
                    handleInfo={handleInfo}
                    handleDelete={handleTaskDelete}
                    handlePin={handleToggleTaskPin(true)}
                />
            }
            {/* Outstanding not pinned */}
            <SubList
                tasks={tasks}
                taskType='normal'
                handleCompletionChange={handleToggleTaskComplete(false, 'normal')}
                handleInfo={handleInfo}
                handleDelete={handleTaskDelete}
                handlePin={handleToggleTaskPin(false)}
            />
            {/* Completed */}
            {completedSection}
        </Box>

        {completedTasks.length > 0 &&
            <ShowHideButton showCompleted={showCompleted} setShowCompleted={setShowCompleted}/>
        }

        <AddTaskButton triggerTasksChanged={triggerTasksChanged} listId={props.listId}/>

        <UpdateTaskDialog
            task={(selectedTask as ITaskInDB)}
            open={updateDialogOpen}
            close={closeUpdateDialog}
            triggerTasksChanged={triggerTasksChanged}
        />

        </Box>
    )
}
