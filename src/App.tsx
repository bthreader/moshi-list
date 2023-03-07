import NavBar from './NavBar';
import './App.css';
import { Box } from '@mui/material';
import Lists from './modules/Lists';
import NotLoggedInGreeting from './NotLoggedInGreeting';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from '@azure/msal-react';

function App() {
  return (
    <Box>
      <NavBar />
      <Box>
        <AuthenticatedTemplate>
          <Lists />
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <NotLoggedInGreeting />
        </UnauthenticatedTemplate>
      </Box>
    </Box>
  );
}

export default App;
