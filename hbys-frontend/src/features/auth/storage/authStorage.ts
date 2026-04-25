import { UserManager } from 'oidc-client-ts'
import { oidcSettings } from '../config/oidc.ts'
import { extractUserFromAccessToken } from '../utils/token.ts'

export const oidcUserManager = new UserManager(oidcSettings)

export type AuthSession = {
  accessToken: string | null
  refreshToken: string | null
  user: ReturnType<typeof extractUserFromAccessToken> | null
}

export const authStorage = {
  async getSession(): Promise<AuthSession> {
    const oidcUser = await oidcUserManager.getUser()
    const accessToken = oidcUser?.access_token ?? null

    return {
      accessToken,
      refreshToken: oidcUser?.refresh_token ?? null,
      user: accessToken ? extractUserFromAccessToken(accessToken) : null,
    }
  },
  async getAccessToken() {
    return (await oidcUserManager.getUser())?.access_token ?? null
  },
  async getRefreshToken() {
    return (await oidcUserManager.getUser())?.refresh_token ?? null
  },
  async getUser() {
    const accessToken = (await oidcUserManager.getUser())?.access_token

    return accessToken ? extractUserFromAccessToken(accessToken) : null
  },
  async clearSession() {
    await oidcUserManager.removeUser()
  },
}
