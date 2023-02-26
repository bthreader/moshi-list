import * as React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Box, IconButton } from "@mui/material"
import axios from 'axios';
import TaskDialog from './TaskDialog';
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from "@azure/msal-browser";

interface AddTaskButtonProps {
    listId: string,
    triggerTasksChanged: () => void
}

export default function AddTaskButton(props: AddTaskButtonProps) {

    // -----------------------------------------------------------------------
    //  State
    // -----------------------------------------------------------------------

    // MSAL
    const { instance, accounts } = useMsal();

    const [modalOpen, setModalOpen] = React.useState(false);

    // -----------------------------------------------------------------------
    //  Handlers
    // -----------------------------------------------------------------------

    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => setModalOpen(false);

    const handleAddTask = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setModalOpen(false)
        const formData = new FormData(event.currentTarget);
        formData.set('list_id', props.listId)
        const accessTokenRequest = {account: accounts[0], scopes: ["api://"+process.env.REACT_APP_CLIENT_ID+"/user"]}

        try {
            // Get access token
            const access_token = (await instance.acquireTokenSilent(accessTokenRequest)).accessToken;

            // Make request to the API
            await axios.post(
                '/v1/tasks', Object.fromEntries(formData),
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
    }

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
