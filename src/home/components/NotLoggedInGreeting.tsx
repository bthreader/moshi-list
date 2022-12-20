import Typography from '@mui/material/Typography';
import { Container } from '@mui/system';

const greetingStyle = {
    marginTop: '10%',
    textAlign: 'center' as 'center',
};

export default function NotLoggedInGreeting() {
    return (
        <Container sx={{maxWidth: 'sm'}}>
            <Typography 
                variant='h5' 
                color='primary' 
                style={greetingStyle}
            >
                Moshi Moshi! Sign up with your Microsoft or Google account to get started!
            </Typography>
        </Container>
    )
}
