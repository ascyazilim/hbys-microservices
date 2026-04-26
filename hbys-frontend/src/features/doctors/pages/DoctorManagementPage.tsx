import { useEffect, useState } from 'react'
import {
  AddRounded,
  BadgeRounded,
  ErrorOutlineRounded,
  GroupsRounded,
  LocalHospitalRounded,
  PersonSearchRounded,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuthSession } from '../../auth/hooks/useAuthSession.ts'
import { doctorService, parseDoctorApiError } from '../api/doctorService.ts'
import { DoctorFormDialog } from '../components/DoctorFormDialog.tsx'
import { DoctorSearchBar } from '../components/DoctorSearchBar.tsx'
import { DoctorTable } from '../components/DoctorTable.tsx'
import type {
  ApiErrorInfo,
  CreateDoctorRequest,
  Doctor,
  PageResponse,
  ReferenceOption,
  UpdateDoctorRequest,
} from '../types/doctor.types.ts'

const emptyPage: PageResponse<Doctor> = {
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

export function DoctorManagementPage() {
  const navigate = useNavigate()
  const { user } = useAuthSession()
  const authorities = user?.authorities ?? []
  const canRead = authorities.includes('DOCTOR_READ')
  const canWrite = authorities.includes('DOCTOR_WRITE')
  const [doctorPage, setDoctorPage] = useState<PageResponse<Doctor>>(emptyPage)
  const [displayDoctors, setDisplayDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<ReferenceOption[]>([])
  const [clinics, setClinics] = useState<ReferenceOption[]>([])
  const [loading, setLoading] = useState(false)
  const [referenceDataLoading, setReferenceDataLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchValue, setSearchValue] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [error, setError] = useState<ApiErrorInfo | null>(null)
  const [referenceDataError, setReferenceDataError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null)
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)
  const safeDoctorRows = Array.isArray(doctorPage.content) ? doctorPage.content : []
  const totalDoctors = Number.isFinite(doctorPage.totalElements)
    ? doctorPage.totalElements
    : safeDoctorRows.length

  useEffect(() => {
    if (!canRead) {
      return
    }

    const fetchReferences = async () => {
      setReferenceDataLoading(true)
      setReferenceDataError(null)

      try {
        const [specialtyResponse, clinicResponse] = await Promise.all([
          doctorService.getSpecialties(),
          doctorService.getClinics(),
        ])
        setSpecialties(specialtyResponse)
        setClinics(clinicResponse)
      } catch (requestError) {
        setReferenceDataError(
          `Uzmanlik ve klinik listeleri yuklenemedi. ${parseDoctorApiError(requestError).message}`,
        )
        setSpecialties([])
        setClinics([])
      } finally {
        setReferenceDataLoading(false)
      }
    }

    void fetchReferences()
  }, [canRead])

  useEffect(() => {
    if (!canRead) {
      return
    }

    const fetchDoctors = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await doctorService.getDoctors({
          page,
          size: rowsPerPage,
        })
        setDoctorPage(response)
        setDisplayDoctors(response.content)
      } catch (fetchError) {
        setError(parseDoctorApiError(fetchError))
        setDoctorPage(emptyPage)
        setDisplayDoctors([])
      } finally {
        setLoading(false)
      }
    }

    void fetchDoctors()
  }, [canRead, page, rowsPerPage])

  const loadDoctors = async (nextPage = page, nextRowsPerPage = rowsPerPage) => {
    setLoading(true)
    setError(null)

    try {
      const response = await doctorService.getDoctors({
        page: nextPage,
        size: nextRowsPerPage,
      })
      setDoctorPage(response)
      setDisplayDoctors(response.content)
    } catch (fetchError) {
      setError(parseDoctorApiError(fetchError))
      setDoctorPage(emptyPage)
      setDisplayDoctors([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    const term = searchValue.trim()

    if (!term) {
      setSearchActive(false)
      setDisplayDoctors(safeDoctorRows)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await doctorService.searchDoctors(term)
      setDisplayDoctors(results)
      setSearchActive(true)
    } catch (searchError) {
      const parsedError = parseDoctorApiError(searchError)

      if (parsedError.code === 'NOT_FOUND') {
        setDisplayDoctors([])
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
    setDisplayDoctors(safeDoctorRows)
  }

  const handleCreateClick = () => {
    setDialogMode('create')
    setSelectedDoctor(null)
    setSubmitError(null)
    setDialogOpen(true)
  }

  const handleEditClick = (doctor: Doctor) => {
    setDialogMode('edit')
    setSelectedDoctor(doctor)
    setSubmitError(null)
    setDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await doctorService.deleteDoctor(deleteTarget.id)
      setDeleteTarget(null)
      handleClearSearch()
      await loadDoctors(page, rowsPerPage)
      setSnackbarMessage('Doktor kaydi basariyla silindi.')
    } catch (deleteError) {
      setError(parseDoctorApiError(deleteError))
      setSubmitting(false)
      return
    }

    setSubmitting(false)
  }

  const handleSubmit = async (values: CreateDoctorRequest | UpdateDoctorRequest) => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      if (dialogMode === 'create') {
        await doctorService.createDoctor(values as CreateDoctorRequest)
        setSnackbarMessage('Doktor kaydi basariyla olusturuldu.')
      } else if (selectedDoctor) {
        await doctorService.updateDoctor(selectedDoctor.id, values as UpdateDoctorRequest)
        setSnackbarMessage('Doktor bilgileri basariyla guncellendi.')
      }

      setDialogOpen(false)
      handleClearSearch()
      await loadDoctors(page, rowsPerPage)
    } catch (submitRequestError) {
      setSubmitError(parseDoctorApiError(submitRequestError).message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
  }

  const stats = [
    {
      title: 'Toplam Doktor',
      value: totalDoctors.toString(),
      caption: 'API Gateway uzerinden gelen toplam aktif doktor kaydi',
      icon: GroupsRounded,
    },
    {
      title: 'Aktif Durumdakiler',
      value: displayDoctors.filter((doctor) => doctor.status === 'ACTIVE').length.toString(),
      caption: searchActive
        ? 'Arama sonucundaki aktif doktorlar'
        : 'Mevcut sayfada aktif durumdaki doktorlar',
      icon: BadgeRounded,
    },
    {
      title: 'Uzmanlik Tanimli',
      value: displayDoctors.filter((doctor) => doctor.specialtyName).length.toString(),
      caption: 'Doktorlar aktif uzmanlik referanslariyla iliskilidir',
      icon: LocalHospitalRounded,
    },
    {
      title: 'Klinik Referansi',
      value: clinics.length.toString(),
      caption: 'Form dropdownlari doctor-service referans endpointlerinden beslenir',
      icon: ErrorOutlineRounded,
    },
  ]

  if (!canRead) {
    return (
      <Alert severity="error">
        Bu modulu goruntulemek icin DOCTOR_READ yetkisine ihtiyaciniz var.
      </Alert>
    )
  }

  const isUnauthorized = error?.code === 'UNAUTHORIZED' || error?.code === 'FORBIDDEN'
  const isEmpty = !loading && displayDoctors.length === 0

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          overflow: 'hidden',
          position: 'relative',
          borderRadius: { xs: 3, md: 4 },
          background:
            'linear-gradient(135deg, rgba(20,54,96,0.98) 0%, rgba(11,120,104,0.92) 100%)',
          color: 'common.white',
          boxShadow: '0 28px 60px rgba(20, 54, 96, 0.18)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 84% 16%, rgba(255,255,255,0.18), transparent 22%), radial-gradient(circle at 8% 100%, rgba(255,255,255,0.12), transparent 28%)',
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
              label="Doctor Service Entegrasyonu"
              sx={{
                mb: 2,
                borderRadius: 99,
                bgcolor: alpha('#ffffff', 0.12),
                color: 'inherit',
                fontWeight: 700,
                border: `1px solid ${alpha('#ffffff', 0.14)}`,
              }}
            />
            <Typography variant="h3">Doktor Yonetimi</Typography>
            <Typography
              variant="body1"
              sx={{ mt: 1.5, maxWidth: 640, color: alpha('#ffffff', 0.82) }}
            >
              Personel numarasinin backend tarafinda uretildigi, uzmanlik ve klinik bilgilerinin
              referans veri endpointleriyle yonetildigi kurumsal operasyon paneli.
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
            Yeni Doktor Ekle
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
                <Typography variant="h5">Doktor Listesi</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Form gonderimleri manuel personel no veya serbest uzmanlik metni yerine
                  referans veri secimlerine dayanir. Liste ekraninda kullaniciya uzmanlik ve klinik
                  isimleri gosterilir.
                </Typography>
              </Box>
              {!canWrite ? (
                <Alert severity="info" sx={{ py: 0 }}>
                  Bu modulu okuyabilirsiniz; kayit ekleme, guncelleme ve silme icin
                  DOCTOR_WRITE yetkisi gerekir.
                </Alert>
              ) : null}
            </Stack>

            {submitError ? <Alert severity="error">{submitError}</Alert> : null}
            {referenceDataError ? <Alert severity="warning">{referenceDataError}</Alert> : null}

            <DoctorSearchBar
              value={searchValue}
              disabled={loading}
              onChange={setSearchValue}
              onSearch={() => void handleSearch()}
              onClear={handleClearSearch}
            />

            {error && !isUnauthorized ? <Alert severity="error">{error.message}</Alert> : null}
            {isUnauthorized ? (
              <Alert severity="error">
                {error?.message || 'Doktor servisine erisim icin gerekli yetkiye sahip degilsiniz.'}
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
                  {searchActive ? 'Arama sonucu bulunamadi' : 'Henuz doktor kaydi bulunmuyor'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {searchActive
                    ? 'Farkli bir ad, soyad, personel no, uzmanlik veya klinik ile tekrar deneyin.'
                    : 'Ilk doktor kaydini olusturarak modulu kullanmaya baslayabilirsiniz.'}
                </Typography>
              </Paper>
            ) : (
              <DoctorTable
                doctors={displayDoctors}
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalDoctors}
                canWrite={canWrite}
                canDelete
                searchActive={searchActive}
                onPageChange={setPage}
                onRowsPerPageChange={(nextSize) => {
                  setRowsPerPage(nextSize)
                  setPage(0)
                }}
                onView={(doctor) => navigate(`/doctors/${doctor.id}`)}
                onEdit={handleEditClick}
                onDelete={setDeleteTarget}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      {dialogOpen ? (
        <DoctorFormDialog
          key={`${dialogMode}-${selectedDoctor?.id ?? 'new'}`}
          open={dialogOpen}
          mode={dialogMode}
          doctor={selectedDoctor}
          specialties={specialties}
          clinics={clinics}
          referenceDataLoading={referenceDataLoading}
          referenceDataError={referenceDataError}
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

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={submitting ? undefined : () => setDeleteTarget(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Doktor kaydini sil</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            {deleteTarget
              ? `${deleteTarget.firstName} ${deleteTarget.lastName} kaydini silmek istediginize emin misiniz? Bu islem doctor-service soft delete akisina gider.`
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={submitting}>
            Vazgec
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeleteConfirm()}
            disabled={submitting}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={3500}
        onClose={() => setSnackbarMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnackbarMessage(null)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
