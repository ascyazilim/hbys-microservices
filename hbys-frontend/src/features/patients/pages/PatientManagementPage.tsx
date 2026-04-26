import { useEffect, useState } from 'react'
import {
  AddRounded,
  ErrorOutlineRounded,
  GroupAddRounded,
  PeopleAltOutlined,
  PersonSearchRounded,
  RecentActorsOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../../auth/hooks/useAuthSession.ts'
import { patientService, parsePatientApiError } from '../api/patientService.ts'
import { PatientFormDialog } from '../components/PatientFormDialog.tsx'
import { PatientSearchBar } from '../components/PatientSearchBar.tsx'
import { PatientTable } from '../components/PatientTable.tsx'
import type {
  ApiErrorInfo,
  CreatePatientRequest,
  PageResponse,
  Patient,
  UpdatePatientRequest,
} from '../types/patient.types.ts'

const emptyPage: PageResponse<Patient> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  numberOfElements: 0,
  first: true,
  last: true,
  empty: true,
}

function hasIncompleteInfo(patient: Patient) {
  return !patient.dateOfBirth || !patient.phoneNumber || !patient.gender
}

export function PatientManagementPage() {
  const navigate = useNavigate()
  const { user } = useAuthSession()
  const authorities = user?.authorities ?? []
  const canRead = authorities.includes('PATIENT_READ')
  const canWrite = authorities.includes('PATIENT_WRITE')
  const [patientPage, setPatientPage] = useState<PageResponse<Patient>>(emptyPage)
  const [displayPatients, setDisplayPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchValue, setSearchValue] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [error, setError] = useState<ApiErrorInfo | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const safePatientRows = Array.isArray(patientPage.content) ? patientPage.content : []
  const totalPatients = Number.isFinite(patientPage.totalElements)
    ? patientPage.totalElements
    : safePatientRows.length

  const loadPatients = async (nextPage = page, nextRowsPerPage = rowsPerPage) => {
    setLoading(true)
    setError(null)

    try {
      const response = await patientService.getPatients({
        page: nextPage,
        size: nextRowsPerPage,
      })
      setPatientPage(response)
      setDisplayPatients(response.content)
    } catch (fetchError) {
      setError(parsePatientApiError(fetchError))
      setPatientPage(emptyPage)
      setDisplayPatients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!canRead) {
      return
    }

    const fetchPatients = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await patientService.getPatients({
          page,
          size: rowsPerPage,
        })
        setPatientPage(response)
        setDisplayPatients(response.content)
      } catch (fetchError) {
        setError(parsePatientApiError(fetchError))
        setPatientPage(emptyPage)
        setDisplayPatients([])
      } finally {
        setLoading(false)
      }
    }

    void fetchPatients()
  }, [canRead, page, rowsPerPage])

  const handleSearch = async () => {
    const term = searchValue.trim()

    if (!term) {
      setSearchActive(false)
      setDisplayPatients(safePatientRows)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await patientService.searchPatients(term)
      setDisplayPatients(results)
      setSearchActive(true)
    } catch (searchError) {
      const parsedError = parsePatientApiError(searchError)

      if (parsedError.code === 'NOT_FOUND') {
        setDisplayPatients([])
        setSearchActive(true)
        setError(null)
      } else {
        setError(parsedError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchValue('')
    setSearchActive(false)
    setError(null)
    setDisplayPatients(safePatientRows)
  }

  const handleCreateClick = () => {
    setDialogMode('create')
    setSelectedPatient(null)
    setSubmitError(null)
    setDialogOpen(true)
  }

  const handleEditClick = (patient: Patient) => {
    setDialogMode('edit')
    setSelectedPatient(patient)
    setSubmitError(null)
    setDialogOpen(true)
  }

  const handleDelete = async (patient: Patient) => {
    const confirmed = window.confirm(
      `${patient.firstName} ${patient.lastName} kaydini silmek istediginize emin misiniz?`,
    )

    if (!confirmed) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      await patientService.deletePatient(patient.id)
      handleClearSearch()
      await loadPatients(page, rowsPerPage)
    } catch (deleteError) {
      setError(parsePatientApiError(deleteError))
      setLoading(false)
    }
  }

  const handleSubmit = async (values: CreatePatientRequest | UpdatePatientRequest) => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      if (dialogMode === 'create') {
        await patientService.createPatient(values as CreatePatientRequest)
      } else if (selectedPatient) {
        await patientService.updatePatient(selectedPatient.id, values as UpdatePatientRequest)
      }

      setDialogOpen(false)
      handleClearSearch()
      await loadPatients(page, rowsPerPage)
    } catch (submitRequestError) {
      setSubmitError(parsePatientApiError(submitRequestError).message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
  }

  const stats = [
    {
      title: 'Toplam Hasta',
      value: totalPatients.toString(),
      caption: 'API Gateway uzerinden gelen toplam aktif kayit',
      icon: PeopleAltOutlined,
    },
    {
      title: 'Bugun Eklenen Hasta',
      value: '--',
      caption: 'Response DTO icinde createdAt alani sunulmuyor',
      icon: GroupAddRounded,
    },
    {
      title: 'Aktif Hasta',
      value: totalPatients.toString(),
      caption: 'Liste endpointi soft delete disindaki aktif kayitlari donuyor',
      icon: RecentActorsOutlined,
    },
    {
      title: 'Eksik Bilgili Kayitlar',
      value: displayPatients.filter(hasIncompleteInfo).length.toString(),
      caption: searchActive
        ? 'Arama sonucunda eksik alan tasiyan kayitlar'
        : 'Mevcut sayfadaki eksik iletisim veya demografik alanlar',
      icon: ErrorOutlineRounded,
    },
  ]

  if (!canRead) {
    return (
      <Alert severity="error">
        Bu modulu goruntulemek icin PATIENT_READ yetkisine ihtiyaciniz var.
      </Alert>
    )
  }

  const isUnauthorized = error?.code === 'UNAUTHORIZED' || error?.code === 'FORBIDDEN'
  const isEmpty = !loading && displayPatients.length === 0

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          overflow: 'hidden',
          position: 'relative',
          borderRadius: { xs: 3, md: 4 },
          background:
            'linear-gradient(135deg, rgba(18,61,113,0.98) 0%, rgba(14,116,144,0.92) 100%)',
          color: 'common.white',
          boxShadow: '0 28px 60px rgba(18, 61, 113, 0.18)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 85% 18%, rgba(255,255,255,0.18), transparent 22%), radial-gradient(circle at 8% 100%, rgba(255,255,255,0.12), transparent 28%)',
            pointerEvents: 'none',
          }}
        />
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={3}
          sx={{
            position: 'relative',
            p: { xs: 3, md: 4 },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' },
          }}
        >
          <Box sx={{ maxWidth: 760 }}>
            <Chip
              label="Hasta Servisi Entegrasyonu"
              sx={{
                mb: 2,
                borderRadius: 99,
                bgcolor: alpha('#ffffff', 0.12),
                color: 'inherit',
                fontWeight: 700,
                border: `1px solid ${alpha('#ffffff', 0.14)}`,
              }}
            />
            <Typography variant="h3">Hasta Yonetimi</Typography>
            <Typography
              variant="body1"
              sx={{ mt: 1.5, maxWidth: 640, color: alpha('#ffffff', 0.82) }}
            >
              Kimlik ve iletisim bilgilerinin merkezden yonetildigi, API Gateway uzerinden
              patient-service ile konusan kurumsal hasta paneli.
            </Typography>
          </Box>

          <Button
            type="button"
            variant="contained"
            color="secondary"
            startIcon={<AddRounded />}
            onClick={handleCreateClick}
            disabled={!canWrite}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: 200,
              borderRadius: 3,
              boxShadow: 'none',
            }}
          >
            Yeni Hasta Ekle
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {stats.map(({ title, value, caption, icon: Icon }) => (
          <Grid key={title} size={{ xs: 12, sm: 6, xl: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                {loading ? (
                  <Stack spacing={1.25}>
                    <Skeleton variant="text" width="58%" />
                    <Skeleton variant="text" width="34%" height={40} />
                    <Skeleton variant="text" width="78%" />
                  </Stack>
                ) : (
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {title}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1.25 }}>
                        {value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {caption}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'grid',
                        placeItems: 'center',
                        height: 48,
                        width: 48,
                        borderRadius: 4,
                        bgcolor: alpha('#1f5ea8', 0.08),
                        color: 'primary.main',
                      }}
                    >
                      <Icon />
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.5}>
            <Stack
              direction={{ xs: 'column', xl: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between', alignItems: { xl: 'center' } }}
            >
              <Box>
                <Typography variant="h5">Hasta Listesi</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Kolonlar dogrudan PatientResponse alanlarina gore gosteriliyor. TC aramasi
                  dogrudan backend endpointini kullanir; ad, soyad ve telefon icin servis
                  katmani mevcut sayfali endpointleri tarayarak veritabanindaki kayitlari
                  bulur.
                </Typography>
              </Box>
              {!canWrite ? (
                <Alert severity="info" sx={{ py: 0 }}>
                  Bu modulu okuyabilirsiniz; kayit ekleme, guncelleme ve silme icin
                  PATIENT_WRITE yetkisi gerekir.
                </Alert>
              ) : null}
            </Stack>

            {submitError ? <Alert severity="error">{submitError}</Alert> : null}

            <PatientSearchBar
              value={searchValue}
              disabled={loading}
              onChange={setSearchValue}
              onSearch={() => void handleSearch()}
              onClear={handleClearSearch}
            />

            {error && !isUnauthorized ? <Alert severity="error">{error.message}</Alert> : null}
            {isUnauthorized ? (
              <Alert severity="error">
                {error?.message || 'Hasta servisine erisim icin gerekli yetkiye sahip degilsiniz.'}
              </Alert>
            ) : null}

            {isEmpty ? (
              <Paper
                sx={{
                  p: { xs: 3, md: 5 },
                  textAlign: 'center',
                  bgcolor: alpha('#1f5ea8', 0.03),
                  borderStyle: 'dashed',
                }}
              >
                <PersonSearchRounded color="primary" sx={{ fontSize: 48 }} />
                <Typography variant="h5" sx={{ mt: 1.5 }}>
                  {searchActive ? 'Arama sonucu bulunamadi' : 'Henuz hasta kaydi bulunmuyor'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {searchActive
                    ? 'Farkli bir TC kimlik no, ad, soyad veya telefon ile tekrar deneyin.'
                    : 'Ilk hasta kaydini olusturarak modulu kullanmaya baslayabilirsiniz.'}
                </Typography>
              </Paper>
            ) : (
              <PatientTable
                patients={displayPatients}
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalPatients}
                canWrite={canWrite}
                searchActive={searchActive}
                onPageChange={setPage}
                onRowsPerPageChange={(nextSize) => {
                  setRowsPerPage(nextSize)
                  setPage(0)
                }}
                onView={(patient) => navigate(`/patients/${patient.id}`)}
                onEdit={handleEditClick}
                onDelete={(patient) => void handleDelete(patient)}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      {dialogOpen ? (
        <PatientFormDialog
          key={`${dialogMode}-${selectedPatient?.id ?? 'new'}`}
          open={dialogOpen}
          mode={dialogMode}
          patient={selectedPatient}
          loading={submitting}
          submitError={submitError}
          onClose={() => {
            if (!submitting) {
              setDialogOpen(false)
            }
          }}
          onSubmit={(values) => void handleSubmit(values)}
        />
      ) : null}
    </Stack>
  )
}
