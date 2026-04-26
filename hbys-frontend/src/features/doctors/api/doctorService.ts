import axios from 'axios'
import { apiClient } from '../../../shared/api/apiClient.ts'
import type {
  ApiErrorInfo,
  CreateDoctorRequest,
  Doctor,
  DoctorStatus,
  PageResponse,
  ReferenceOption,
  UpdateDoctorRequest,
} from '../types/doctor.types.ts'

type DoctorListParams = {
  page?: number
  size?: number
  search?: string
}

type UnknownPageResponse = Partial<PageResponse<Doctor>> & {
  content?: unknown
}

const SEARCH_PAGE_SIZE = 100

function normalizeOptionalString(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function extractErrorMessage(data: unknown) {
  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>

    if (typeof record.detail === 'string' && record.detail.trim()) {
      return record.detail
    }

    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message
    }

    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error
    }
  }

  return 'Doktor servisi istegi tamamlanamadi.'
}

export function parseDoctorApiError(error: unknown): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null
    const message = extractErrorMessage(error.response?.data)

    if (!error.response) {
      return {
        status: null,
        code: 'UNKNOWN',
        message:
          'Doktor servisine baglanilamadi. API Gateway adresini ve doctor-service erisimini kontrol edin.',
      }
    }

    if (status === 401) {
      return {
        status,
        code: 'UNAUTHORIZED',
        message: 'Oturumunuzun suresi dolmus olabilir. Tekrar giris yapin.',
      }
    }

    if (status === 403) {
      return {
        status,
        code: 'FORBIDDEN',
        message: 'Bu doktor islemi icin yetkiniz bulunmuyor.',
      }
    }

    if (status === 404) {
      return { status, code: 'NOT_FOUND', message: message || 'Doktor kaydi bulunamadi.' }
    }

    if (status === 400 || status === 409 || status === 422) {
      return { status, code: 'VALIDATION', message }
    }

    return { status, code: 'UNKNOWN', message }
  }

  return {
    status: null,
    code: 'UNKNOWN',
    message:
      error instanceof Error && error.message
        ? error.message
        : 'Beklenmeyen bir hata olustu.',
  }
}

function toFiniteNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function isDoctorStatus(value: unknown): value is DoctorStatus {
  return value === 'ACTIVE' || value === 'PASSIVE' || value === 'ON_LEAVE' || value === 'SUSPENDED'
}

function normalizeDoctor(value: unknown): Doctor | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const id = typeof record.id === 'string' ? record.id : ''
  const personelNo = typeof record.personelNo === 'string' ? record.personelNo : ''
  const firstName = typeof record.firstName === 'string' ? record.firstName : ''
  const lastName = typeof record.lastName === 'string' ? record.lastName : ''
  const specialtyId =
    typeof record.specialtyId === 'number' && Number.isFinite(record.specialtyId)
      ? record.specialtyId
      : NaN
  const specialtyCode = typeof record.specialtyCode === 'string' ? record.specialtyCode : ''
  const specialtyName = typeof record.specialtyName === 'string' ? record.specialtyName : ''
  const clinicId =
    typeof record.clinicId === 'number' && Number.isFinite(record.clinicId) ? record.clinicId : NaN
  const clinicName = typeof record.clinicName === 'string' ? record.clinicName : ''
  const status = isDoctorStatus(record.status) ? record.status : 'ACTIVE'

  if (
    !id ||
    !personelNo ||
    !firstName ||
    !lastName ||
    !Number.isFinite(specialtyId) ||
    !specialtyName ||
    !Number.isFinite(clinicId) ||
    !clinicName
  ) {
    return null
  }

  return {
    id,
    personelNo,
    firstName,
    lastName,
    email: typeof record.email === 'string' ? record.email : null,
    phone: typeof record.phone === 'string' ? record.phone : null,
    specialtyId,
    specialtyCode,
    specialtyName,
    clinicId,
    clinicName,
    status,
  }
}

function normalizeDoctorPage(data: UnknownPageResponse | undefined): PageResponse<Doctor> {
  const rawContent = Array.isArray(data?.content) ? data.content : []
  const content = rawContent
    .map((item) => normalizeDoctor(item))
    .filter((item): item is Doctor => item !== null)

  const totalElements = toFiniteNumber(data?.totalElements, content.length)
  const size = toFiniteNumber(data?.size, content.length || 10)
  const number = toFiniteNumber(data?.number, 0)
  const totalPages = toFiniteNumber(
    data?.totalPages,
    size > 0 ? Math.ceil(totalElements / size) : 0,
  )
  const numberOfElements = toFiniteNumber(data?.numberOfElements, content.length)
  const empty = typeof data?.empty === 'boolean' ? data.empty : content.length === 0

  return {
    content,
    totalElements,
    totalPages,
    size,
    number,
    numberOfElements,
    first: typeof data?.first === 'boolean' ? data.first : number <= 0,
    last: typeof data?.last === 'boolean' ? data.last : number >= Math.max(totalPages - 1, 0),
    empty,
  }
}

function normalizeReferenceOption(value: unknown): ReferenceOption | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const id = typeof record.id === 'number' && Number.isFinite(record.id) ? record.id : NaN
  const code = typeof record.code === 'string' ? record.code : ''
  const name = typeof record.name === 'string' ? record.name : ''

  if (!Number.isFinite(id) || !code || !name) {
    return null
  }

  return { id, code, name }
}

function normalizeReferenceList(data: unknown): ReferenceOption[] {
  return Array.isArray(data)
    ? data
        .map((item) => normalizeReferenceOption(item))
        .filter((item): item is ReferenceOption => item !== null)
    : []
}

function buildClientSearchResults(term: string, sourceDoctors: Doctor[]) {
  const normalizedTerm = term.trim().toLocaleLowerCase('tr-TR')

  if (!normalizedTerm) {
    return sourceDoctors
  }

  return sourceDoctors.filter((doctor) => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLocaleLowerCase('tr-TR')

    return (
      doctor.personelNo.toLocaleLowerCase('tr-TR').includes(normalizedTerm) ||
      doctor.firstName.toLocaleLowerCase('tr-TR').includes(normalizedTerm) ||
      doctor.lastName.toLocaleLowerCase('tr-TR').includes(normalizedTerm) ||
      fullName.includes(normalizedTerm) ||
      (doctor.email ?? '').toLocaleLowerCase('tr-TR').includes(normalizedTerm) ||
      (doctor.phone ?? '').toLocaleLowerCase('tr-TR').includes(normalizedTerm) ||
      doctor.specialtyCode.toLocaleLowerCase('tr-TR').includes(normalizedTerm) ||
      doctor.specialtyName.toLocaleLowerCase('tr-TR').includes(normalizedTerm) ||
      doctor.clinicName.toLocaleLowerCase('tr-TR').includes(normalizedTerm) ||
      String(doctor.clinicId).includes(normalizedTerm) ||
      doctor.status.toLocaleLowerCase('tr-TR').includes(normalizedTerm)
    )
  })
}

async function fetchDoctorsPage(params: DoctorListParams = {}) {
  const response = await apiClient.get<UnknownPageResponse>('/api/doctors', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    },
  })

  return normalizeDoctorPage(response.data)
}

function normalizeCreatePayload(payload: CreateDoctorRequest): CreateDoctorRequest {
  return {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: normalizeOptionalString(payload.email),
    phone: normalizeOptionalString(payload.phone),
    specialtyId: payload.specialtyId,
    clinicId: payload.clinicId,
  }
}

function normalizeUpdatePayload(payload: UpdateDoctorRequest): UpdateDoctorRequest {
  return {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: normalizeOptionalString(payload.email),
    phone: normalizeOptionalString(payload.phone),
    specialtyId: payload.specialtyId,
    clinicId: payload.clinicId,
  }
}

export const doctorService = {
  async getDoctors(params: DoctorListParams = {}) {
    return fetchDoctorsPage(params)
  },

  async getDoctorById(id: string) {
    const response = await apiClient.get<Doctor>(`/api/doctors/${id}`)
    const doctor = normalizeDoctor(response.data)

    if (!doctor) {
      throw new Error('Gecersiz doktor verisi alindi.')
    }

    return doctor
  },

  async getSpecialties() {
    const response = await apiClient.get<ReferenceOption[]>('/api/doctors/specialties')
    return normalizeReferenceList(response.data)
  },

  async getClinics() {
    const response = await apiClient.get<ReferenceOption[]>('/api/doctors/clinics')
    return normalizeReferenceList(response.data)
  },

  async searchDoctors(term: string) {
    const normalizedTerm = term.trim()

    if (!normalizedTerm) {
      return []
    }

    const backendMatches = await fetchDoctorsPage({
      page: 0,
      size: SEARCH_PAGE_SIZE,
      search: normalizedTerm,
    })

    const firstPage = await fetchDoctorsPage({ page: 0, size: SEARCH_PAGE_SIZE })
    const allDoctors = [...firstPage.content]

    for (let nextPage = 1; nextPage < firstPage.totalPages; nextPage += 1) {
      const pageResponse = await fetchDoctorsPage({
        page: nextPage,
        size: SEARCH_PAGE_SIZE,
      })

      allDoctors.push(...pageResponse.content)
    }

    const clientMatches = buildClientSearchResults(normalizedTerm, allDoctors)
    const merged = new Map<string, Doctor>()

    for (const doctor of [...backendMatches.content, ...clientMatches]) {
      merged.set(doctor.id, doctor)
    }

    return Array.from(merged.values())
  },

  async createDoctor(payload: CreateDoctorRequest) {
    const response = await apiClient.post<Doctor>('/api/doctors', normalizeCreatePayload(payload))
    const doctor = normalizeDoctor(response.data)

    if (!doctor) {
      throw new Error('Olusturulan doktor verisi gecersiz.')
    }

    return doctor
  },

  async updateDoctor(id: string, payload: UpdateDoctorRequest) {
    const response = await apiClient.put<Doctor>(`/api/doctors/${id}`, normalizeUpdatePayload(payload))
    const doctor = normalizeDoctor(response.data)

    if (!doctor) {
      throw new Error('Guncellenen doktor verisi gecersiz.')
    }

    return doctor
  },

  async deleteDoctor(id: string) {
    await apiClient.delete(`/api/doctors/${id}`)
  },
}
