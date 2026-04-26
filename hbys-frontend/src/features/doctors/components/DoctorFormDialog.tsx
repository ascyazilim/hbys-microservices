import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import type {
  CreateDoctorRequest,
  Doctor,
  ReferenceOption,
  UpdateDoctorRequest,
} from '../types/doctor.types.ts'

type DoctorFormValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  specialtyId: string
  clinicId: string
}

type DoctorFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  doctor?: Doctor | null
  specialties: ReferenceOption[]
  clinics: ReferenceOption[]
  referenceDataLoading?: boolean
  referenceDataError?: string | null
  loading?: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (values: CreateDoctorRequest | UpdateDoctorRequest) => void
}

const emptyValues: DoctorFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialtyId: '',
  clinicId: '',
}

function buildInitialValues(mode: 'create' | 'edit', doctor?: Doctor | null): DoctorFormValues {
  if (mode === 'edit' && doctor) {
    return {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email ?? '',
      phone: doctor.phone ?? '',
      specialtyId: String(doctor.specialtyId),
      clinicId: String(doctor.clinicId),
    }
  }

  return emptyValues
}

function isValidEmail(value: string) {
  return !value.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function DoctorFormDialog({
  open,
  mode,
  doctor,
  specialties,
  clinics,
  referenceDataLoading = false,
  referenceDataError = null,
  loading = false,
  submitError,
  onClose,
  onSubmit,
}: DoctorFormDialogProps) {
  const [values, setValues] = useState<DoctorFormValues>(() => buildInitialValues(mode, doctor))
  const [validationMessage, setValidationMessage] = useState<string | null>(null)

  const handleTextChange =
    (field: keyof DoctorFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
    }

  const handleSubmit = () => {
    if (referenceDataLoading) {
      setValidationMessage('Referans veriler yuklenirken kayit gonderilemez.')
      return
    }

    if (referenceDataError) {
      setValidationMessage('Uzmanlik ve klinik verileri alinmadan kayit tamamlanamaz.')
      return
    }

    if (!values.firstName.trim() || !values.lastName.trim()) {
      setValidationMessage('Ad ve soyad alanlari zorunludur.')
      return
    }

    if (!isValidEmail(values.email)) {
      setValidationMessage('Gecerli bir e-posta adresi girin.')
      return
    }

    if (!values.specialtyId.trim()) {
      setValidationMessage('Uzmanlik secimi zorunludur.')
      return
    }

    if (!values.clinicId.trim()) {
      setValidationMessage('Klinik secimi zorunludur.')
      return
    }

    setValidationMessage(null)

    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email || null,
      phone: values.phone || null,
      specialtyId: Number(values.specialtyId),
      clinicId: Number(values.clinicId),
    }

    onSubmit(payload)
  }

  const personelNoValue =
    mode === 'edit' && doctor ? doctor.personelNo : 'Sistem tarafindan otomatik olusturulacaktir'

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === 'create' ? 'Yeni Doktor Ekle' : 'Doktor Bilgilerini Guncelle'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Personel numarasi backend tarafinda uretilir. Klinik ve uzmanlik alanlari sadece aktif
            referans listelerinden secilebilir.
          </Typography>

          {referenceDataLoading ? (
            <Alert severity="info">Uzmanlik ve klinik listeleri yukleniyor.</Alert>
          ) : null}
          {referenceDataError ? <Alert severity="error">{referenceDataError}</Alert> : null}
          {(validationMessage || submitError) ? (
            <Alert severity="error">{validationMessage || submitError}</Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Personel No"
                value={personelNoValue}
                disabled
                helperText={
                  mode === 'create'
                    ? 'Kayit olusturuldugunda otomatik uretilir.'
                    : 'Kurumsal personel numarasi sistem tarafinda yonetilir.'
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Uzmanlik"
                value={values.specialtyId}
                disabled={loading || referenceDataLoading || Boolean(referenceDataError)}
                onChange={handleTextChange('specialtyId')}
              >
                <MenuItem value="">Uzmanlik secin</MenuItem>
                {specialties.map((specialty) => (
                  <MenuItem key={specialty.id} value={String(specialty.id)}>
                    {specialty.name} ({specialty.code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Ad"
                value={values.firstName}
                disabled={loading}
                onChange={handleTextChange('firstName')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Soyad"
                value={values.lastName}
                disabled={loading}
                onChange={handleTextChange('lastName')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={values.email}
                disabled={loading}
                onChange={handleTextChange('email')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Telefon"
                value={values.phone}
                disabled={loading}
                onChange={handleTextChange('phone')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Klinik"
                value={values.clinicId}
                disabled={loading || referenceDataLoading || Boolean(referenceDataError)}
                onChange={handleTextChange('clinicId')}
              >
                <MenuItem value="">Klinik secin</MenuItem>
                {clinics.map((clinic) => (
                  <MenuItem key={clinic.id} value={String(clinic.id)}>
                    {clinic.name} ({clinic.code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button type="button" onClick={onClose} disabled={loading}>
          Vazgec
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || referenceDataLoading || Boolean(referenceDataError)}
        >
          {mode === 'create' ? 'Kaydi Olustur' : 'Degisiklikleri Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
