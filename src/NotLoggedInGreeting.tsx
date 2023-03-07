import Typography from '@mui/material/Typography';
import { Container } from '@mui/system';

export default function NotLoggedInGreeting() {
  return (
    <Container maxWidth="sm">
      <Typography
        variant="h5"
        color="primary"
        textAlign="center"
        mt="10%"
      >
        Moshi Moshi! Sign up with your Microsoft or Google account to get
        started!
      </Typography>
    </Container>
  );
}
