import { AuthenticationResult } from "@azure/msal-browser";

const MockAuthenticationResult: AuthenticationResult = {
    accessToken: 'mockAccessToken',
    account: null,
    authority: 'mockAuthority',
    correlationId: 'mockCorrelationId',
    expiresOn: null,
    fromCache: false,
    idToken: 'mockIdToken',
    idTokenClaims: { mockClaim: 'mockValue' },
    scopes: ['mockScope'],
    tenantId: 'mockTenantId',
    tokenType: 'Bearer',
    uniqueId: 'mockUniqueId',
};

export default MockAuthenticationResult;