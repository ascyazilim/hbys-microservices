import axios from 'axios'
import { authStorage } from '../../features/auth/storage/authStorage.ts'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const apiBaseUrl =
  configuredApiBaseUrl && configuredApiBaseUrl.length > 0 ? configuredApiBaseUrl : '/'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(async (config) => {
  const token = await authStorage.getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
