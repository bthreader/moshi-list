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

    const getIdFromList = (index: number, taskType: TaskType) => {
        if (taskType === 'completed') {
            return completedTasks[index]._id;
        }
        else if (taskType === 'normal') {
            return tasks[index]._id;
        }
        else {
            return pinnedTasks[index]._id;
        }
    }

    const handleTaskComplete = (completed: boolean, taskType: TaskType) => (index: number) => async () => {
        // Need to have an argument to decide what array to get the id from
        const access_token = await getAccessToken();

        await axios.put(
            '/v1/tasks',
            {complete: !completed},
            {params: {_id: getIdFromList(index, taskType)}, headers: {Authorization: `Bearer ${access_token}`}}
        )
        triggerTasksChanged();
    }

    const handleTaskDelete = (index: number, taskType: TaskType) => async () => {
        const access_token = await getAccessToken();

        await axios.delete('/v1/tasks', {params: {_id: getIdFromList(index, taskType)}, headers: {Authorization: `Bearer ${access_token}`}})
        triggerTasksChanged();
    }

    const handleInfo = (index: number, taskType: TaskType) => () => {
        if (taskType === 'completed') {
            setSelectedTask(completedTasks[index]);
        }
        else if (taskType === 'normal') {
            setSelectedTask(tasks[index]);
        }
        else {
            setSelectedTask(pinnedTasks[index])
        }
        setUpdateDialogOpen(true);
    }

    const handleTaskPin = (pinned: boolean) => (index: number) => async () => {
        const access_token = await getAccessToken();
        
        let id;
        if (pinned) {
            id = pinnedTasks[index]._id;
        }
        else {
            id = tasks[index]._id;
        }

        await axios.put(
            '/v1/tasks',
            {pinned: !pinned},
            {params: {_id: id}, headers: {Authorization: `Bearer ${access_token}`}}
        );
        triggerTasksChanged();
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
