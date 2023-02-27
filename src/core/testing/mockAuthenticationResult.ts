import { AuthenticationResult } from "@azure/msal-browser";

const mockAuthenticationResult: AuthenticationResult = {
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

export default mockAuthenticationResult;