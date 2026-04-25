import { useAuth } from 'react-oidc-context'
import { extractUserFromAccessToken } from '../utils/token.ts'

export function useAuthSession() {
  const auth = useAuth()
  const accessToken = auth.user?.access_token ?? null
  const user = accessToken ? extractUserFromAccessToken(accessToken) : null

  return {
    auth,
    accessToken,
    user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
  }
}
