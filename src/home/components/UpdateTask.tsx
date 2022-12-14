import * as React from 'react';
import { Box } from "@mui/material"
import axios from 'axios';
import TaskDialog from './TaskDialog';
import Task from '../../core/models/task.model';
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from "@azure/msal-browser";

interface UpdateTaskProps {
    task?: Task,
    open: boolean,
    close: () => void,
    triggerTasksChanged: () => void
}

export default function UpdateTask(props: UpdateTaskProps) {

    // -----------------------------------------------------------------------
    //  State
    // -----------------------------------------------------------------------

    // MSAL
    const { instance, accounts } = useMsal();

    // -----------------------------------------------------------------------
    //  Handlers
    // -----------------------------------------------------------------------

    const handleUpdateTask = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        props.close();
        const accessTokenRequest = {account: accounts[0], scopes: ["api://"+process.env.REACT_APP_CLIENT_ID+"/user"]}
        const formData = new FormData(event.currentTarget);

        // Don't bother with null -> null notes in the request
        const n = formData.get('notes');
        if (
            (n === undefined) || 
            (n === '') ||
            ((props.task as Task).notes === undefined)
        ) {
            formData.delete('notes');
        }

        try {
            // Get access token
            const access_token = (await instance.acquireTokenSilent(accessTokenRequest)).accessToken;

            axios.put(
                '/v1/tasks',
                Object.fromEntries(formData),
                {params: {_id: (props.task as Task)._id}, headers: {Authorization: `Bearer ${access_token}`}}
            )
                .then(response => {
                    props.triggerTasksChanged();
                });
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
    
    if (props.task === null) {
        return <Box/>
    }

    return (
        <TaskDialog
            open={props.open}
            onClose={props.close}
            onSubmit={handleUpdateTask}
            buttonText="Update"
            taskDefault={(props.task as Task).task}
            notesDefault={(props.task as Task).notes}
        />
    )
}
