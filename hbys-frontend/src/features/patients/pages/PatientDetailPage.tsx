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
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthSession } from '../../auth/hooks/useAuthSession.ts'
import { patientService, parsePatientApiError } from '../api/patientService.ts'
import { PatientDetailCard } from '../components/PatientDetailCard.tsx'
import { PatientFormDialog } from '../components/PatientFormDialog.tsx'
import type {
  ApiErrorInfo,
  Patient,
  UpdatePatientRequest,
} from '../types/patient.types.ts'

export function PatientDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthSession()
  const authorities = user?.authorities ?? []
  const canRead = authorities.includes('PATIENT_READ')
  const canWrite = authorities.includes('PATIENT_WRITE')
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiErrorInfo | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const invalidPatientId = !id || Number.isNaN(Number(id))

  useEffect(() => {
    if (!canRead || invalidPatientId) {
      return
    }

    const loadPatient = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await patientService.getPatientById(Number(id))
        setPatient(response)
      } catch (requestError) {
        setError(parsePatientApiError(requestError))
      } finally {
        setLoading(false)
      }
    }

    void loadPatient()
  }, [canRead, id, invalidPatientId])

  const handleUpdate = async (values: UpdatePatientRequest) => {
    if (!patient) {
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const updatedPatient = await patientService.updatePatient(patient.id, values)
      setPatient(updatedPatient)
      setDialogOpen(false)
    } catch (requestError) {
      setSubmitError(parsePatientApiError(requestError).message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!patient) {
      return
    }

    const confirmed = window.confirm(
      `${patient.firstName} ${patient.lastName} kaydini silmek istediginize emin misiniz?`,
    )

    if (!confirmed) {
      return
    }

    setSubmitting(true)

    try {
      await patientService.deletePatient(patient.id)
      navigate('/patients')
    } catch (requestError) {
      setError(parsePatientApiError(requestError))
      setSubmitting(false)
    }
  }

  if (!canRead) {
    return (
      <Alert severity="error">
        Bu modulu goruntulemek icin PATIENT_READ yetkisine ihtiyaciniz var.
      </Alert>
    )
  }

  if (invalidPatientId) {
    return <Alert severity="error">Gecersiz hasta kimligi.</Alert>
  }

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
              onClick={() => navigate('/patients')}
              sx={{ alignSelf: 'flex-start' }}
            >
              Listeye Don
            </Button>
            <div>
              <Typography variant="h3">
                {patient ? `${patient.firstName} ${patient.lastName}` : 'Hasta Detayi'}
              </Typography>
              <Typography
                variant="body1"
                sx={{ mt: 1, color: alpha('#ffffff', 0.82), maxWidth: 640 }}
              >
                Kimlik, iletisim ve sistemde bu mikroservisin sundugu hasta alanlarini tek ekranda
                izleyin.
              </Typography>
            </div>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              startIcon={<EditOutlined />}
              disabled={!canWrite || !patient || loading}
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
              disabled={!canWrite || !patient || loading || submitting}
              onClick={() => void handleDelete()}
              sx={{ minWidth: 160, borderColor: alpha('#ffffff', 0.32) }}
            >
              Sil
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {loading ? <LinearProgress /> : null}
      {error ? <Alert severity="error">{error.message}</Alert> : null}

      {!loading && !error && patient ? (
        <>
          <PatientDetailCard patient={patient} />

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5">Sistemde Ilgili Hasta Verileri</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Mevcut patient-service response DTO yapisi yalnizca temel kimlik ve iletisim
                alanlarini sunuyor. Randevu, laboratuvar, doktor iliskileri veya klinik gecmis
                verileri icin bu ekranda kullanilabilecek resmi endpoint bulunmuyor.
              </Typography>
            </CardContent>
          </Card>
        </>
      ) : null}

      {dialogOpen ? (
        <PatientFormDialog
          key={`${patient?.id ?? 'detail'}`}
          open={dialogOpen}
          mode="edit"
          patient={patient}
          loading={submitting}
          submitError={submitError}
          onClose={() => {
            if (!submitting) {
              setDialogOpen(false)
            }
          }}
          onSubmit={(values) => void handleUpdate(values as UpdatePatientRequest)}
        />
      ) : null}
    </Stack>
  )
}
