import { UserManager } from 'oidc-client-ts'
import { oidcSettings } from '../config/oidc.ts'
import { extractUserFromAccessToken } from '../utils/token.ts'

export const oidcUserManager = new UserManager(oidcSettings)

type OidcStoredUser = {
  access_token?: string
  refresh_token?: string
}

function getFallbackStoredOidcUser(): OidcStoredUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const authority = oidcSettings.authority
  const clientId = oidcSettings.client_id
  const exactKey = `oidc.user:${authority}:${clientId}`

  const candidateKeys = Array.from({ length: window.sessionStorage.length }, (_, index) =>
    window.sessionStorage.key(index),
  ).filter((key): key is string => Boolean(key))

  const matchingKey =
    candidateKeys.find((key) => key === exactKey) ??
    candidateKeys.find(
      (key) => key.startsWith('oidc.user:') && key.includes(authority) && key.endsWith(`:${clientId}`),
    )

  if (!matchingKey) {
    return null
  }

  const rawValue = window.sessionStorage.getItem(matchingKey)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as OidcStoredUser
  } catch {
    return null
  }
}

async function resolveOidcUser() {
  const oidcUser = await oidcUserManager.getUser()

  if (oidcUser?.access_token) {
    return oidcUser
  }

  const fallbackUser = getFallbackStoredOidcUser()

  if (!fallbackUser?.access_token) {
    return null
  }

  return {
    access_token: fallbackUser.access_token,
    refresh_token: fallbackUser.refresh_token,
  }
}

export type AuthSession = {
  accessToken: string | null
  refreshToken: string | null
  user: ReturnType<typeof extractUserFromAccessToken> | null
}

export const authStorage = {
  async getSession(): Promise<AuthSession> {
    const oidcUser = await resolveOidcUser()
    const accessToken = oidcUser?.access_token ?? null

    return {
      accessToken,
      refreshToken: oidcUser?.refresh_token ?? null,
      user: accessToken ? extractUserFromAccessToken(accessToken) : null,
    }
  },
  async getAccessToken() {
    return (await resolveOidcUser())?.access_token ?? null
  },
  async getRefreshToken() {
    return (await resolveOidcUser())?.refresh_token ?? null
  },
  async getUser() {
    const accessToken = (await resolveOidcUser())?.access_token

    return accessToken ? extractUserFromAccessToken(accessToken) : null
  },
  async clearSession() {
    await oidcUserManager.removeUser()
  },
}
