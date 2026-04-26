import { useEffect, useState } from 'react'
import {
  ArrowBackRounded,
  DeleteOutlineRounded,
  EditOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthSession } from '../../auth/hooks/useAuthSession.ts'
import { doctorService, parseDoctorApiError } from '../api/doctorService.ts'
import { DoctorDetailCard } from '../components/DoctorDetailCard.tsx'
import { DoctorFormDialog } from '../components/DoctorFormDialog.tsx'
import type {
  ApiErrorInfo,
  Doctor,
  ReferenceOption,
  UpdateDoctorRequest,
} from '../types/doctor.types.ts'

function isValidUuid(value: string | undefined) {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
  )
}

export function DoctorDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthSession()
  const authorities = user?.authorities ?? []
  const canRead = authorities.includes('DOCTOR_READ')
  const canWrite = authorities.includes('DOCTOR_WRITE')
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [specialties, setSpecialties] = useState<ReferenceOption[]>([])
  const [clinics, setClinics] = useState<ReferenceOption[]>([])
  const [loading, setLoading] = useState(false)
  const [referenceDataLoading, setReferenceDataLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiErrorInfo | null>(null)
  const [referenceDataError, setReferenceDataError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)

  const invalidDoctorId = !isValidUuid(id)

  useEffect(() => {
    if (!canRead || invalidDoctorId || !id) {
      return
    }

    const loadDoctor = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await doctorService.getDoctorById(id)
        setDoctor(response)
      } catch (requestError) {
        setError(parseDoctorApiError(requestError))
      } finally {
        setLoading(false)
      }
    }

    void loadDoctor()
  }, [canRead, id, invalidDoctorId])

  useEffect(() => {
    if (!canWrite) {
      return
    }

    const loadReferences = async () => {
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

    void loadReferences()
  }, [canWrite])

  const handleUpdate = async (values: UpdateDoctorRequest) => {
    if (!doctor) {
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const updatedDoctor = await doctorService.updateDoctor(doctor.id, values)
      setDoctor(updatedDoctor)
      setDialogOpen(false)
      setSnackbarMessage('Doktor bilgileri basariyla guncellendi.')
    } catch (requestError) {
      setSubmitError(parseDoctorApiError(requestError).message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!doctor) {
      return
    }

    setSubmitting(true)

    try {
      await doctorService.deleteDoctor(doctor.id)
      navigate('/doctors')
    } catch (requestError) {
      setError(parseDoctorApiError(requestError))
      setSubmitting(false)
      return
    }

    setSubmitting(false)
  }

  if (!canRead) {
    return (
      <Alert severity="error">
        Bu modulu goruntulemek icin DOCTOR_READ yetkisine ihtiyaciniz var.
      </Alert>
    )
  }

  if (invalidDoctorId) {
    return <Alert severity="error">Gecersiz doktor kimligi.</Alert>
  }

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
              'radial-gradient(circle at 86% 14%, rgba(255,255,255,0.16), transparent 22%), radial-gradient(circle at 10% 100%, rgba(255,255,255,0.12), transparent 28%)',
            pointerEvents: 'none',
          }}
        />
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          sx={{
            position: 'relative',
            p: { xs: 3, md: 4 },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', lg: 'center' },
          }}
        >
          <Stack spacing={1}>
            <Button
              type="button"
              color="inherit"
              startIcon={<ArrowBackRounded />}
              onClick={() => navigate('/doctors')}
              sx={{ alignSelf: 'flex-start' }}
            >
              Listeye Don
            </Button>
            <div>
              <Typography variant="h3">
                {doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Doktor Detayi'}
              </Typography>
              <Typography
                variant="body1"
                sx={{ mt: 1, color: alpha('#ffffff', 0.82), maxWidth: 640 }}
              >
                Personel numarasi, uzmanlik ve klinik baglantilariyla birlikte doktor kaydini tek
                ekranda izleyin.
              </Typography>
            </div>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              startIcon={<EditOutlined />}
              disabled={!canWrite || !doctor || loading}
              onClick={() => {
                setSubmitError(null)
                setDialogOpen(true)
              }}
              sx={{ minWidth: 160, boxShadow: 'none' }}
            >
              Duzenle
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="inherit"
              startIcon={<DeleteOutlineRounded />}
              disabled={!canWrite || !doctor || loading || submitting}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ minWidth: 160, borderColor: alpha('#ffffff', 0.32) }}
            >
              Sil
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {loading ? <LinearProgress /> : null}
      {error ? <Alert severity="error">{error.message}</Alert> : null}
      {referenceDataError && canWrite ? <Alert severity="warning">{referenceDataError}</Alert> : null}

      {!loading && !error && doctor ? (
        <>
          <DoctorDetailCard doctor={doctor} />

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5">Servis Davranisi ve Mimari Notlar</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Doctor-service detay endpointi Redis cache desteklidir. Klinik ve uzmanlik
                referanslari su an ayni mikroserviste tutulur; ileride hospital-structure veya
                reference-data odakli ayri bir servise tasinabilir.
              </Typography>
            </CardContent>
          </Card>
        </>
      ) : null}

      {dialogOpen ? (
        <DoctorFormDialog
          key={`${doctor?.id ?? 'detail'}`}
          open={dialogOpen}
          mode="edit"
          doctor={doctor}
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
          onSubmit={(values) => void handleUpdate(values as UpdateDoctorRequest)}
        />
      ) : null}

      <Dialog
        open={deleteDialogOpen}
        onClose={submitting ? undefined : () => setDeleteDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Doktor kaydini sil</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            {doctor
              ? `${doctor.firstName} ${doctor.lastName} kaydini silmek istediginize emin misiniz? Bu islem doctor-service soft delete akisina gider.`
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
            Vazgec
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDelete()}
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
