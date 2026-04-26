import axios from 'axios'
import { apiClient } from '../../../shared/api/apiClient.ts'
import type {
  ApiErrorInfo,
  CreatePatientRequest,
  PageResponse,
  Patient,
  UpdatePatientRequest,
} from '../types/patient.types.ts'

type PatientListParams = {
  page?: number
  size?: number
}

const SEARCH_PAGE_SIZE = 100

type UnknownPageResponse = Partial<PageResponse<Patient>> & {
  content?: unknown
}

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

    if (typeof record.message === 'string' && record.message.trim()) {
      return record.message
    }

    if (typeof record.error === 'string' && record.error.trim()) {
      return record.error
    }
  }

  return 'Hasta servisi istegi tamamlanamadi.'
}

export function parsePatientApiError(error: unknown): ApiErrorInfo {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null
    const message = extractErrorMessage(error.response?.data)

    if (!error.response) {
      return {
        status: null,
        code: 'UNKNOWN',
        message:
          'Hasta servisine baglanilamadi. API Gateway adresini ve patient-service erisimini kontrol edin.',
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
        message: 'Bu hasta islemi icin yetkiniz bulunmuyor.',
      }
    }

    if (status === 404) {
      return { status, code: 'NOT_FOUND', message: message || 'Hasta kaydi bulunamadi.' }
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

function normalizeCreatePayload(payload: CreatePatientRequest): CreatePatientRequest {
  return {
    tcNo: payload.tcNo.trim(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    dateOfBirth: normalizeOptionalString(payload.dateOfBirth),
    phoneNumber: normalizeOptionalString(payload.phoneNumber),
    gender: normalizeOptionalString(payload.gender),
  }
}

function normalizeUpdatePayload(payload: UpdatePatientRequest): UpdatePatientRequest {
  return {
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    dateOfBirth: normalizeOptionalString(payload.dateOfBirth),
    phoneNumber: normalizeOptionalString(payload.phoneNumber),
    gender: normalizeOptionalString(payload.gender),
  }
}

function toFiniteNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizePatient(value: unknown): Patient | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const record = value as Record<string, unknown>
  const id = toFiniteNumber(record.id, NaN)
  const tcNo = typeof record.tcNo === 'string' ? record.tcNo : ''
  const firstName = typeof record.firstName === 'string' ? record.firstName : ''
  const lastName = typeof record.lastName === 'string' ? record.lastName : ''

  if (!Number.isFinite(id) || !tcNo || !firstName || !lastName) {
    return null
  }

  return {
    id,
    tcNo,
    firstName,
    lastName,
    dateOfBirth: typeof record.dateOfBirth === 'string' ? record.dateOfBirth : null,
    phoneNumber: typeof record.phoneNumber === 'string' ? record.phoneNumber : null,
    gender: typeof record.gender === 'string' ? record.gender : null,
  }
}

function normalizePatientPage(data: UnknownPageResponse | undefined): PageResponse<Patient> {
  const rawContent = Array.isArray(data?.content) ? data.content : []
  const content = rawContent
    .map((item) => normalizePatient(item))
    .filter((item): item is Patient => item !== null)

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

function buildSearchResults(term: string, sourcePatients: Patient[]) {
  const normalizedTerm = term.trim().toLocaleLowerCase('tr-TR')

  if (!normalizedTerm) {
    return sourcePatients
  }

  return sourcePatients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLocaleLowerCase('tr-TR')

    return (
      patient.tcNo.includes(term.trim()) ||
      patient.firstName.toLocaleLowerCase('tr-TR').includes(normalizedTerm) ||
      patient.lastName.toLocaleLowerCase('tr-TR').includes(normalizedTerm) ||
      fullName.includes(normalizedTerm) ||
      (patient.phoneNumber ?? '').toLocaleLowerCase('tr-TR').includes(normalizedTerm)
    )
  })
}

async function fetchPatientsPage(params: PatientListParams = {}) {
  const response = await apiClient.get<UnknownPageResponse>('/api/patients', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 10,
    },
  })

  return normalizePatientPage(response.data)
}

export const patientService = {
  async getPatients(params: PatientListParams = {}) {
    return fetchPatientsPage(params)
  },

  async getPatientById(id: number) {
    const response = await apiClient.get<Patient>(`/api/patients/${id}`)
    const patient = normalizePatient(response.data)

    if (!patient) {
      throw new Error('Gecersiz hasta verisi alindi.')
    }

    return patient
  },

  async getPatientByTcNo(tcNo: string) {
    const response = await apiClient.get<Patient>(`/api/patients/tc/${tcNo}`)
    const patient = normalizePatient(response.data)

    if (!patient) {
      throw new Error('Gecersiz hasta verisi alindi.')
    }

    return patient
  },

  async searchPatients(term: string) {
    const normalizedTerm = term.trim()

    if (!normalizedTerm) {
      return []
    }

    if (/^\d{11}$/.test(normalizedTerm)) {
      const patient = await this.getPatientByTcNo(normalizedTerm)
      return [patient]
    }

    const firstPage = await fetchPatientsPage({ page: 0, size: SEARCH_PAGE_SIZE })
    const allPatients = [...firstPage.content]

    for (let nextPage = 1; nextPage < firstPage.totalPages; nextPage += 1) {
      const pageResponse = await fetchPatientsPage({
        page: nextPage,
        size: SEARCH_PAGE_SIZE,
      })

      allPatients.push(...pageResponse.content)
    }

    return buildSearchResults(normalizedTerm, allPatients)
  },

  async createPatient(payload: CreatePatientRequest) {
    const response = await apiClient.post<Patient>(
      '/api/patients',
      normalizeCreatePayload(payload),
    )

    const patient = normalizePatient(response.data)

    if (!patient) {
      throw new Error('Olusturulan hasta verisi gecersiz.')
    }

    return patient
  },

  async updatePatient(id: number, payload: UpdatePatientRequest) {
    const response = await apiClient.put<Patient>(
      `/api/patients/${id}`,
      normalizeUpdatePayload(payload),
    )

    const patient = normalizePatient(response.data)

    if (!patient) {
      throw new Error('Guncellenen hasta verisi gecersiz.')
    }

    return patient
  },

  async deletePatient(id: number) {
    await apiClient.delete(`/api/patients/${id}`)
  },
}
