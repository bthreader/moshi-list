import * as React from 'react'
import Task from "../../core/models/task.model"
import { ListItem, ListItemText, ListItemButton, Checkbox, Box, IconButton, Button, Skeleton, Typography } from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import AddTask from './AddTask';
import UpdateTask from './UpdateTask';
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { PushPin } from '@mui/icons-material';

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

    const handleTaskComplete = (index: number) => async () => {
        const access_token = await getAccessToken();

        axios.put(
            '/v1/tasks',
            {complete: true},
            {params: {_id: tasks[index]._id}, headers: {Authorization: `Bearer ${access_token}`}}
        )
            .then(response => triggerTasksChanged());
    }

    const handleTaskUnComplete = (index: number) => async () => {
        const access_token = await getAccessToken();

        axios.put(
            '/v1/tasks', 
            {complete: false},
            {params: {_id: completedTasks[index]._id}, headers: {Authorization: `Bearer ${access_token}`}},
        )
            .then(response => triggerTasksChanged());
    }

    const handleTaskDelete = (index: number, completed: boolean) => async () => {
        const access_token = await getAccessToken();

        let id;
        if (completed) {
            id = completedTasks[index]._id
        }
        else {
            id = tasks[index]._id
        }
        axios.delete('/v1/tasks', {params: {_id: id}, headers: {Authorization: `Bearer ${access_token}`}})
            .then(response => triggerTasksChanged());
    }

    const handleInfo = (index: number) => () => {
        setSelectedTask(tasks[index]);
        setUpdateDialogOpen(true);
    }

    const handleCompletedInfo = (index: number) => () => {
        setSelectedTask(completedTasks[index]);
        setUpdateDialogOpen(true);
    }

    // -----------------------------------------------------------------------
    //  State update
    // -----------------------------------------------------------------------

    React.useEffect(() => {
        setLoaded(false);

        const getTask = async () => {
            const access_token = await getAccessToken();

            // Get the uncompleted tasks
            const uncPromise = axios.get(
                '/v1/tasks', 
                {params: {list_id:props.listId, complete:false}, headers: {Authorization: `Bearer ${access_token}`}}
            )
                .then(response => response.data)
                .then(data => setTasks(data))

            // Get the completed tasks
            const cPromise = axios.get(
                '/v1/tasks',
                {params: {list_id:props.listId, complete:true}, headers: {Authorization: `Bearer ${access_token}`}}
            )
                .then(response => response.data)
                .then(data => setCompletedTasks(data))

            Promise.all([cPromise, uncPromise])
                .then(() => setLoaded(true))
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

    let completedSection;
    if (showCompleted && completedTasks.length > 0) {
        // Completed tasks
        completedSection = 
        <Box>
        {Array.from({ length: completedTasks.length }, (v, i) => i).map((index) =>
            <ListItem
                key={index}
                disablePadding
                divider
            >
                <ListItemButton onClick={handleCompletedInfo(index)}>
                    <ListItemText primary={completedTasks[index].task} sx={{textDecoration: 'line-through'}}/>
                </ListItemButton>
                <Checkbox
                    onChange={handleTaskUnComplete(index)}
                    checked={true}
                    sx={{p: 0.5}}
                />
                <IconButton 
                    onClick={handleTaskDelete(index, true)}
                    sx={{p: 0.5}}
                >
                    <DeleteIcon />
                </IconButton>
            </ListItem>
        )}
        </Box>
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
            {Array.from({ length: tasks.length }, (v, i) => i).map((index) =>
                <ListItem
                    key={index}
                    disablePadding
                    divider
                >
                    {tasks[index].pinned &&
                        <IconButton>
                            <PushPin/>
                        </IconButton>
                    }
                    <ListItemButton onClick={handleInfo(index)}>
                        <ListItemText primary={tasks[index].task} />
                    </ListItemButton>
                    <Checkbox
                        onChange={handleTaskComplete(index)}
                        checked={false}
                        sx={{p: 0.5}}
                    />
                    <IconButton 
                        onClick={handleTaskDelete(index, false)}
                        sx={{p: 0.5}}
                    >
                        <DeleteIcon />
                    </IconButton>
                </ListItem>
            )}
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
