import Lists from './Lists';
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
                <Lists/>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <NotLoggedInGreeting/>
            </UnauthenticatedTemplate>
        </Box>
    );
}