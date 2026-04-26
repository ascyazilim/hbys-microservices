export type DoctorStatus = 'ACTIVE' | 'PASSIVE' | 'ON_LEAVE' | 'SUSPENDED'

export interface ReferenceOption {
  id: number
  code: string
  name: string
}

export interface Doctor {
  id: string
  personelNo: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  specialtyId: number
  specialtyCode: string
  specialtyName: string
  clinicId: number
  clinicName: string
  status: DoctorStatus
}

export interface CreateDoctorRequest {
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  specialtyId: number
  clinicId: number
}

export interface UpdateDoctorRequest {
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  specialtyId: number
  clinicId: number
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
