export type DoctorStatus = 'ACTIVE' | 'PASSIVE' | 'ON_LEAVE' | 'SUSPENDED'

export interface Doctor {
  id: string
  personelNo: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  specialtyCode: string
  clinicId: number | null
  status: DoctorStatus
}

export interface CreateDoctorRequest {
  personelNo: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  specialtyCode: string
  clinicId: number
}

export interface UpdateDoctorRequest {
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  specialtyCode: string | null
  clinicId: number | null
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
