import MyLists from './MyLists';
import NotLoggedInGreeting from './components/NotLoggedInGreeting';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { Box } from '@mui/material';

export default function Home () {

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        <Box>
            <AuthenticatedTemplate>
                <MyLists/>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <NotLoggedInGreeting/>
            </UnauthenticatedTemplate>
        </Box>
    );
}