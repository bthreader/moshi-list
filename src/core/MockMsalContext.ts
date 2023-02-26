import * as React from '@azure/msal-react'
import { Logger, InteractionStatus } from "@azure/msal-browser";
import MockAuthenticationResult from './MockAuthenticationResult'

const MockMsalContext: React.IMsalContext = {
    instance: {
        acquireTokenByCode: jest.fn(),
        addEventCallback: jest.fn(),
        acquireTokenPopup: jest.fn(),
        acquireTokenRedirect: jest.fn(),
        acquireTokenSilent: (silentRequest) => {
            return Promise.resolve(MockAuthenticationResult);
        },
        addPerformanceCallback: jest.fn(),
        disableAccountStorageEvents: jest.fn(),
        enableAccountStorageEvents: jest.fn(),
        getAccountByHomeId: jest.fn(),
        getAccountByLocalId: jest.fn(),
        getAccountByUsername: jest.fn(),
        getActiveAccount: jest.fn(),
        getAllAccounts: jest.fn(),
        getConfiguration: jest.fn(),
        getLogger: jest.fn(),
        getTokenCache: jest.fn(),
        handleRedirectPromise: jest.fn(),
        initialize: jest.fn(),
        initializeWrapperLibrary: jest.fn(),
        loginPopup: jest.fn(),
        loginRedirect: jest.fn(),
        logout: jest.fn(),
        logoutPopup: jest.fn(),
        logoutRedirect: jest.fn(),
        removeEventCallback: jest.fn(),
        removePerformanceCallback: jest.fn(),
        setActiveAccount: jest.fn(),
        setLogger: jest.fn(),
        setNavigationClient: jest.fn(),
        ssoSilent: jest.fn(),
    },
    accounts: [{
        localAccountId: 'mockLocalAccountId',
        homeAccountId: 'mockHomeAccountId',
        environment: 'mockEnvironment',
        tenantId: 'mockTenantId',
        username: 'mockUsername',
    }],
    inProgress: InteractionStatus.Login,
    logger: new Logger({}),
}

export default MockMsalContext;