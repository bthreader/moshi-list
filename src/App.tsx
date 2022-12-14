import Home from './home/Home';
import NavBar from './NavBar';
import './App.css'
import { Box } from '@mui/material';

enum Status {
  DontKnow,
  DoKnowNull
}

function App() {
    return (
    <Box>
        <NavBar/>
        <Home/>
    </Box>
    );
}

export default App;
