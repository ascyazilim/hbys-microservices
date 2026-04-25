type ResourceAccessEntry = {
  roles?: string[]
}

type JwtPayload = {
  sub?: string
  preferred_username?: string
  realm_access?: {
    roles?: string[]
  }
  resource_access?: Record<string, ResourceAccessEntry>
}

export type ParsedAuthUser = {
  id: string
  username: string
  role: string
  realmRoles: string[]
  resourceRoles: Record<string, string[]>
  authorities: string[]
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')

  return window.atob(padded)
}

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')

    if (!payload) {
      return null
    }

    return JSON.parse(decodeBase64Url(payload)) as JwtPayload
  } catch {
    return null
  }
}

export function extractUserFromAccessToken(accessToken: string): ParsedAuthUser {
  const payload = parseJwtPayload(accessToken)
  const realmRoles = payload?.realm_access?.roles ?? []
  const resourceRoles = Object.fromEntries(
    Object.entries(payload?.resource_access ?? {}).map(([resourceName, entry]) => [
      resourceName,
      entry.roles ?? [],
    ]),
  )
  const authorities = Array.from(
    new Set([...realmRoles, ...Object.values(resourceRoles).flat()]),
  )

  return {
    id: payload?.sub ?? '',
    username: payload?.preferred_username ?? '',
    role: realmRoles[0] ?? authorities[0] ?? '',
    realmRoles,
    resourceRoles,
    authorities,
  }
}
