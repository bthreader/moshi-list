import * as React from 'react';
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { Box } from '@mui/system';
import axios from 'axios';
import { useMsal } from '@azure/msal-react'
import { InteractionRequiredAuthError } from "@azure/msal-browser";

interface DeleteListProps {
    triggerListsChanged: () => void
    selectedListId: string
}

export default function DeleteList(props: DeleteListProps) {

    // -----------------------------------------------------------------------
    //  State
    // -----------------------------------------------------------------------

    // MSAL
    const { instance, accounts } = useMsal();

    const [warningOpen, setWarningOpen] = React.useState(false);

    // -----------------------------------------------------------------------
    //  Handlers
    // -----------------------------------------------------------------------

    const handleDeleteList = async () => {
        const accessTokenRequest = {account: accounts[0], scopes: ["api://"+process.env.REACT_APP_CLIENT_ID+"/user"]}

        try {
            // Get access token
            const access_token = (await instance.acquireTokenSilent(accessTokenRequest)).accessToken;

            // Make request to API
            await axios.delete(
                '/v1/lists',
                {params: {_id: props.selectedListId}, headers: {Authorization: `Bearer ${access_token}`}}
            )
            props.triggerListsChanged();
        }
        catch (e) {
            switch(e) {
                case InteractionRequiredAuthError: instance.acquireTokenPopup(accessTokenRequest);
            }
        }
    }

    const handleWarningOpen = () => setWarningOpen(true)
    const handleWarningClose = () => setWarningOpen(false)

    // -----------------------------------------------------------------------
    //  Render
    // -----------------------------------------------------------------------

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexWrap: 'wrap',
                    position: 'absolute',
                    bottom: 16, 
                    left: 16
                }}
            >
                <Button size="small" color="inherit" onClick={handleWarningOpen}>
                    Delete list
                </Button>
            </Box>
            <Dialog
                open={warningOpen}
                onClose={handleWarningClose}
                sx={{textAlign: 'center'}}
                PaperProps={{sx: {borderRadius: '10px'}}}
            >
                <DialogTitle>Are you sure you want to delete this list?</DialogTitle>
                <DialogActions sx={{justifyContent: 'center'}}>
                    <Button onClick={handleDeleteList}>Yes</Button>
                    <Button onClick={handleWarningClose}>No</Button>
                </DialogActions>
            </Dialog>
        </Box> 
    )
}