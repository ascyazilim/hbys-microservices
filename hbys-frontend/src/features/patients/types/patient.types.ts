export interface Patient {
  id: number
  tcNo: string
  firstName: string
  lastName: string
  dateOfBirth: string | null
  phoneNumber: string | null
  gender: string | null
}

export interface CreatePatientRequest {
  tcNo: string
  firstName: string
  lastName: string
  dateOfBirth: string | null
  phoneNumber: string | null
  gender: string | null
}

export interface UpdatePatientRequest {
  firstName: string
  lastName: string
  dateOfBirth: string | null
  phoneNumber: string | null
  gender: string | null
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'UNKNOWN'

export interface ApiErrorInfo {
  status: number | null
  code: ApiErrorCode
  message: string
}
