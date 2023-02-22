import * as React from 'react';
import axios from 'axios';
import { Box } from '@mui/system';
import { Button, Dialog, Fab, SpeedDialIcon, TextField } from '@mui/material';
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from "@azure/msal-browser";

interface AddListButtonProps {
    triggerListsChanged: () => void
}

export default function AddListButton(props: AddListButtonProps) {

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    // MSAL
    const { instance, accounts } = useMsal();

    // Add List Modal
    const [modalOpen, setModalOpen] = React.useState(false);
    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => setModalOpen(false);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    const handleListAdd = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const accessTokenRequest = {account: accounts[0], scopes: ["api://"+process.env.REACT_APP_CLIENT_ID+"/user"]}

        try {
            // Get access token
            const access_token = (await instance.acquireTokenSilent(accessTokenRequest)).accessToken;

            // Make request to API
            await axios.post(
                '/v1/lists',
                {'name': formData.get('name')},
                {headers: {Authorization: `Bearer ${access_token}`}}
            )
            setModalOpen(false);
            props.triggerListsChanged();
        }
        catch (e) {
            switch(e) {
                case InteractionRequiredAuthError: instance.acquireTokenPopup(accessTokenRequest);
            }
        }
    }

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        <Box>
        <Fab
            sx={{ position: 'absolute', bottom: 16, right: 16 }} 
            color='primary'
            onClick={handleModalOpen}
            size='medium'
            aria-label='Add List Button'
        >
            <SpeedDialIcon/>
        </Fab>
        <Dialog
            open={modalOpen}
            onClose={handleModalClose}
            PaperProps={{sx: {borderRadius: '10px', p: 3}}}
            maxWidth="xs"
            aria-label="Add List Dialog"
        >
            <Box 
                sx={{
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                component="form"
                onSubmit={handleListAdd}
            >
                <TextField
                    required
                    size='medium'
                    name={"name"}
                    label={"List name"}
                    variant="outlined"
                />
                <Button type="submit">Add</Button>
            </Box>
        </Dialog>
        </Box>
    )
}
