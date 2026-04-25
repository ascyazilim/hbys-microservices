import { WebStorageStateStore } from 'oidc-client-ts'
import type { UserManagerSettings } from 'oidc-client-ts'
import type { AuthProviderProps } from 'react-oidc-context'

const keycloakIssuerUrl =
  import.meta.env.VITE_KEYCLOAK_ISSUER_URL ?? 'http://localhost:8080/realms/hbys-realm'

const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID ?? 'hbys-client'

const appOrigin = typeof window !== 'undefined' ? window.location.origin : ''

export const oidcSettings: UserManagerSettings = {
  authority: keycloakIssuerUrl,
  client_id: keycloakClientId,
  redirect_uri: `${appOrigin}/auth/callback`,
  post_logout_redirect_uri: `${appOrigin}/login`,
  response_type: 'code',
  scope: 'openid profile',
  loadUserInfo: false,
  userStore:
    typeof window !== 'undefined'
      ? new WebStorageStateStore({ store: window.sessionStorage })
      : undefined,
}

export const oidcConfig: AuthProviderProps = {
  ...oidcSettings,
  onSigninCallback: (user) => {
    const returnTo =
      typeof user?.state === 'object' && user.state !== null && 'returnTo' in user.state
        ? String(user.state.returnTo ?? '/dashboard')
        : '/dashboard'

    window.location.replace(returnTo)
  },
}
