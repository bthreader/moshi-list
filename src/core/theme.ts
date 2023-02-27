import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#FFE6E6',
      main: '#A685E2',
      // dark: '#6155A6',
      contrastText: '#FFFFFF'
    },
    background: {
      'paper': '#F2EFEB'
    },
    info: {
      main: '#666666'
    },
    text: {
      primary: '#666666',
    }
  },
  typography: {fontFamily: 'vvs'}
});

export default theme;