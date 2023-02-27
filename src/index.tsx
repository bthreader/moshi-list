import * as React from 'react';
import * as ReactDOM from 'react-dom/client'
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from '@emotion/react';
import theme from './core/theme';
import axios from 'axios';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';

// ---------------------------------------------------------------------------
// Axios config
// ---------------------------------------------------------------------------

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.defaults.withCredentials = true;

axios.interceptors.request.use(request => {
    console.log(request);
    return request;
}, error => {
    console.log(error);
    return Promise.reject(error);
});

axios.interceptors.response.use(response => {
    console.log(response);
    return response;
}, error => {
    console.log(error);
    return Promise.reject(error);
});

// ---------------------------------------------------------------------------
// MS auth config
// ---------------------------------------------------------------------------

const config = {
  auth: {
      clientId: (process.env.REACT_APP_CLIENT_ID as string),
      authority: 'https://login.microsoftonline.com/'+process.env.REACT_APP_TENANT_ID,
  }
};

const publicClientApplication = new PublicClientApplication(config);

// ---------------------------------------------------------------------------
// Axios config
// ---------------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <MsalProvider instance={publicClientApplication}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
    </MsalProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
