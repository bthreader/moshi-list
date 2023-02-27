import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Box, IconButton } from "@mui/material"
import axios from 'axios';
import TaskDialog from './TaskDialog';
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { ITask } from '../../core/models/task.model';

interface IAddTaskButtonProps {
    listId: string,
    triggerTasksChanged: () => void
}

export default function AddTaskButton(props: IAddTaskButtonProps) {

    // -----------------------------------------------------------------------
    //  State
    // -----------------------------------------------------------------------

    const { instance, accounts } = useMsal();

    const [modalOpen, setModalOpen] = React.useState(false);

    // -----------------------------------------------------------------------
    //  Handlers
    // -----------------------------------------------------------------------

    const handleModalOpen = React.useCallback(() => setModalOpen(true), []);
    const handleModalClose = React.useCallback(() => setModalOpen(false), []);

    const handleAddTask = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setModalOpen(false)

        // Cast the form data to a Task object
        const formData = new FormData(event.currentTarget);
        let newTask: ITask = {
            listId: props.listId,
            task: formData.get('task') as string,
        };
        if (formData.get('notes') !== null) {newTask.notes = formData.get('notes') as string}

        const accessTokenRequest = {account: accounts[0], scopes: ["api://"+process.env.REACT_APP_CLIENT_ID+"/user"]}

        try {
            // Get access token
            const access_token = (await instance.acquireTokenSilent(accessTokenRequest)).accessToken;

            // Make request to the API
            await axios.post(
                '/v1/tasks', newTask,
                {headers: {Authorization: `Bearer ${access_token}`}}
            );
            setModalOpen(false);
            props.triggerTasksChanged();
        }
        catch (e) {
            switch(e) {
                case InteractionRequiredAuthError: {
                    instance.acquireTokenPopup(accessTokenRequest);
                }
            }
        }
    }, [accounts, instance, props])

    // -----------------------------------------------------------------------
    //  Render
    // -----------------------------------------------------------------------

    return (
        <Box>
            <Box display='flex' justifyContent='center'>
                <IconButton color='primary' onClick={handleModalOpen}>
                    <AddIcon/>
                </IconButton>
            </Box>
            <TaskDialog
                open={modalOpen}
                onClose={handleModalClose}
                onSubmit={handleAddTask}
                buttonText="Add"
            />
        </Box>
    )
}
