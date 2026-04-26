import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import type {
  CreateDoctorRequest,
  Doctor,
  UpdateDoctorRequest,
} from '../types/doctor.types.ts'

type DoctorFormValues = {
  personelNo: string
  firstName: string
  lastName: string
  email: string
  phone: string
  specialtyCode: string
  clinicId: string
}

type DoctorFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  doctor?: Doctor | null
  loading?: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (values: CreateDoctorRequest | UpdateDoctorRequest) => void
}

const emptyValues: DoctorFormValues = {
  personelNo: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  specialtyCode: '',
  clinicId: '',
}

function buildInitialValues(mode: 'create' | 'edit', doctor?: Doctor | null): DoctorFormValues {
  if (mode === 'edit' && doctor) {
    return {
      personelNo: doctor.personelNo,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email ?? '',
      phone: doctor.phone ?? '',
      specialtyCode: doctor.specialtyCode,
      clinicId: doctor.clinicId === null ? '' : String(doctor.clinicId),
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
    if (mode === 'create' && !values.personelNo.trim()) {
      setValidationMessage('Personel numarasi zorunludur.')
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

    if (mode === 'create' && !values.specialtyCode.trim()) {
      setValidationMessage('Uzmanlik kodu zorunludur.')
      return
    }

    if (mode === 'create' && !values.clinicId.trim()) {
      setValidationMessage('Klinik ID zorunludur.')
      return
    }

    if (values.clinicId.trim() && Number.isNaN(Number(values.clinicId))) {
      setValidationMessage('Klinik ID sayisal bir deger olmali.')
      return
    }

    setValidationMessage(null)

    if (mode === 'create') {
      onSubmit({
        personelNo: values.personelNo,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email || null,
        phone: values.phone || null,
        specialtyCode: values.specialtyCode,
        clinicId: Number(values.clinicId),
      })
      return
    }

    onSubmit({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email || null,
      phone: values.phone || null,
      specialtyCode: values.specialtyCode || null,
      clinicId: values.clinicId.trim() ? Number(values.clinicId) : null,
    })
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === 'create' ? 'Yeni Doktor Ekle' : 'Doktor Bilgilerini Guncelle'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Form alanlari doctor-service request DTO yapisina gore hazirlandi.
          </Typography>

          {(validationMessage || submitError) ? (
            <Alert severity="error">{validationMessage || submitError}</Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Personel No"
                value={values.personelNo}
                disabled={mode === 'edit' || loading}
                onChange={handleTextChange('personelNo')}
                helperText={
                  mode === 'edit'
                    ? 'Update DTO icinde personelNo alani bulunmadigi icin degistirilemez.'
                    : 'Doctor-service create DTO icin zorunludur.'
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Uzmanlik Kodu"
                value={values.specialtyCode}
                disabled={loading}
                onChange={handleTextChange('specialtyCode')}
              />
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
                label="Klinik ID"
                value={values.clinicId}
                disabled={loading}
                onChange={handleTextChange('clinicId')}
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button type="button" onClick={onClose} disabled={loading}>
          Vazgec
        </Button>
        <Button type="button" variant="contained" onClick={handleSubmit} disabled={loading}>
          {mode === 'create' ? 'Kaydi Olustur' : 'Degisiklikleri Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
