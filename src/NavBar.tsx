import * as React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import { Grid, MenuItem } from '@mui/material';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';

export default function NavBar() {

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    const { instance } = useMsal();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    // -----------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLogout = () => {
        handleClose();
        instance.logoutRedirect({
            postLogoutRedirectUri: "/",
        });
    };

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        // <AppBar position="static">
        <Grid container alignItems='center' mt={3} textAlign='center'>
            <Grid item xs={2.5}/>
            <Grid item xs={7}>
                <Typography 
                    variant="h4" 
                    color="primary" 
                    flexGrow={1}
                    sx={{cursor: 'default'}}
                >
                    Moshi List
                </Typography>
            </Grid>
            <Grid item xs={2.5}>
                <UnauthenticatedTemplate>
                    <Button 
                        color="primary"
                        onClick={() => instance.loginRedirect()}
                        sx={{padding: 0}}
                    >
                        Login
                    </Button>
                </UnauthenticatedTemplate>
                <AuthenticatedTemplate>
                    <IconButton
                        size="large"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="primary"
                        >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem color="primary" onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </AuthenticatedTemplate>
            </Grid>
        </Grid>
    )
}