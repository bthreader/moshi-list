import * as React from 'react'
import Task, { TaskType } from "../core/models/task.model"
import { Box, Button, Skeleton, Typography } from '@mui/material';
import axios from 'axios';
import AddTask from './components/AddTask';
import UpdateTask from './components/UpdateTask';
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import List from './components/List';

interface MyListProps {
    listId: string
}

export default function MyList(props: MyListProps) {

    // -----------------------------------------------------------------------
    //  State
    // -----------------------------------------------------------------------

    // MSAL
    const { instance, accounts } = useMsal();

    // Loaded
    const [loaded, setLoaded] = React.useState(false);

    // Tasks
    const [pinnedTasks, setPinnedTasks] = React.useState(new Array<Task>());
    const [tasks, setTasks] = React.useState(new Array<Task>());
    const [completedTasks, setCompletedTasks] = React.useState(new Array<Task>());

    const [showCompleted, setShowCompleted] = React.useState(false);

    // Update trigger
    const [tasksChanged, setTasksChanged] = React.useState(false);
    const triggerTasksChanged = () => setTasksChanged(!tasksChanged)

    // Update dialog
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
    const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
    const closeUpdateDialog = () => setUpdateDialogOpen(false);

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
    //  Handlers
    // -----------------------------------------------------------------------

    const getTaskFromList = (index: number, taskType: TaskType): Task => {
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

    const addTaskToList = (task: Task, destinationTaskType: TaskType) => {
        let newList;
        console.log(task);

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
                console.log(newList);
                newList.push(task);
                console.log(newList)
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

    // @param completed: before the event was the task completed?
    const handleTaskComplete = (completed: boolean, taskType: TaskType) => (index: number) => async () => {
        const access_token = await getAccessToken();

        // Get a copy of the task
        const taskCopy = getTaskFromList(index, taskType);

        // Remove it from where it was
        removeTaskFromList(index, taskType);

        // Put it where it's going
        if (completed) { addTaskToList(taskCopy, 'normal')
        }
        else { addTaskToList(taskCopy, 'completed')}

        await axios.put(
            '/v1/tasks',
            {complete: !completed},
            {params: {_id: taskCopy._id}, headers: {Authorization: `Bearer ${access_token}`}}
        );
    }

    const handleTaskDelete = (index: number, taskType: TaskType) => async () => {
        const access_token = await getAccessToken();
        removeTaskFromList(index, taskType);
        await axios.delete('/v1/tasks', {params: {_id: getTaskFromList(index, taskType)._id}, headers: {Authorization: `Bearer ${access_token}`}})
    }

    const handleInfo = (index: number, taskType: TaskType) => () => {
        switch (taskType) {
            case 'completed': setSelectedTask(completedTasks[index]); break;
            case 'normal': setSelectedTask(tasks[index]); break;
            case 'pinned': setSelectedTask(pinnedTasks[index]); break;
        }
        setUpdateDialogOpen(true);
    }

    // @param pinned: before the event was the task pinned?
    const handleTaskPin = (pinned: boolean) => (index: number) => async () => {
        const access_token = await getAccessToken();

        // Get a copy of the task
        let from: TaskType;
        let to: TaskType;
        if (pinned) {from = 'pinned'; to = 'normal'}
        else {from = 'normal'; to = 'pinned'}

        const taskCopy = getTaskFromList(index, from);

        removeTaskFromList(index, from);
        addTaskToList(taskCopy, to);

        await axios.put(
            '/v1/tasks',
            {pinned: !pinned},
            {params: {_id: taskCopy._id}, headers: {Authorization: `Bearer ${access_token}`}}
        );
    }

    // -----------------------------------------------------------------------
    //  State update
    // -----------------------------------------------------------------------

    React.useEffect(() => {
        setLoaded(false);

        const getTask = async () => {
            const access_token = await getAccessToken();

            // Get the uncompleted pinned tasks
            const pinnedTaskReponse = await axios.get(
                '/v1/tasks', 
                {params: {list_id:props.listId, complete:false, pinned:true}, headers: {Authorization: `Bearer ${access_token}`}}
            );
            setPinnedTasks(pinnedTaskReponse.data);

            // Get the uncompleted nonpinned tasks
            const taskResponse = await axios.get(
                '/v1/tasks', 
                {params: {list_id:props.listId, complete:false, pinned:false}, headers: {Authorization: `Bearer ${access_token}`}}
            );
            setTasks(taskResponse.data);

            // Get the completed tasks
            const completedTaskRespone = await axios.get(
                '/v1/tasks',
                {params: {list_id:props.listId, complete:true}, headers: {Authorization: `Bearer ${access_token}`}}
            );
            setCompletedTasks(completedTaskRespone.data);

            setLoaded(true);
        }

        getTask();
    },[props.listId, tasksChanged, getAccessToken])

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
        completedSection = <List
            tasks={completedTasks}
            taskType='completed'
            handleCompletionChange={handleTaskComplete(true, 'completed')}
            handleInfo={handleInfo}
            handleDelete={handleTaskDelete}
        />
    }

    // Show / hide button
    let showHideButton;
    if (completedTasks.length>0 && showCompleted === false) {
        showHideButton = 
        <Box sx={{display: 'flex', justifyContent: 'center', mt: 1}}>
            <Button size='small' onClick={(e) => setShowCompleted(true)}>Show completed</Button>
        </Box>
    }
    else if (completedTasks.length>0 && showCompleted) {
        showHideButton = 
        <Box sx={{display: 'flex', justifyContent: 'center', mt: 1}}>
            <Button size='small' onClick={(e) => setShowCompleted(false)}>Hide completed</Button>
        </Box>
    }

    // -----------------------------------------------------------------------
    //  Render
    // -----------------------------------------------------------------------

    return (
        <Box>

        {/* Tasks */}

        <Box sx={{maxHeight: 550, overflow: 'auto'}}>
            {/* Pinned tasks */}
            {pinnedTasks.length > 0 && 
                <List
                    tasks={pinnedTasks}
                    taskType='pinned'
                    handleCompletionChange={handleTaskComplete(false, 'pinned')}
                    handleInfo={handleInfo}
                    handleDelete={handleTaskDelete}
                    handlePin={handleTaskPin(true)}
                />
            }
            {/* Normal tasks */}
            <List
                tasks={tasks}
                taskType='normal'
                handleCompletionChange={handleTaskComplete(false, 'normal')}
                handleInfo={handleInfo}
                handleDelete={handleTaskDelete}
                handlePin={handleTaskPin(false)}
            />
            {/* Completed tasks */}
            {completedSection}
        </Box>

        {/* Show / hide button */}

        {showHideButton}

        {/* Add task section + dialog */}

        <AddTask triggerTasksChanged={triggerTasksChanged} listId={props.listId}/>

        {/* Update task dialog */}

        <UpdateTask
            task={(selectedTask as Task)}
            open={updateDialogOpen}
            close={closeUpdateDialog}
            triggerTasksChanged={triggerTasksChanged}
        />

        </Box>
    )
}
