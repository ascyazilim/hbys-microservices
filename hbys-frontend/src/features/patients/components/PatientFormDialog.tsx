import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import type {
  CreatePatientRequest,
  Patient,
  UpdatePatientRequest,
} from '../types/patient.types.ts'

type PatientFormValues = {
  tcNo: string
  firstName: string
  lastName: string
  dateOfBirth: string
  phoneNumber: string
  gender: string
}

type PatientFormDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  patient?: Patient | null
  loading?: boolean
  submitError?: string | null
  onClose: () => void
  onSubmit: (values: CreatePatientRequest | UpdatePatientRequest) => void
}

const emptyValues: PatientFormValues = {
  tcNo: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phoneNumber: '',
  gender: '',
}

function buildInitialValues(mode: 'create' | 'edit', patient?: Patient | null): PatientFormValues {
  if (mode === 'edit' && patient) {
    return {
      tcNo: patient.tcNo,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth ?? '',
      phoneNumber: patient.phoneNumber ?? '',
      gender: patient.gender ?? '',
    }
  }

  return emptyValues
}

export function PatientFormDialog({
  open,
  mode,
  patient,
  loading = false,
  submitError,
  onClose,
  onSubmit,
}: PatientFormDialogProps) {
  const [values, setValues] = useState<PatientFormValues>(() => buildInitialValues(mode, patient))
  const [validationMessage, setValidationMessage] = useState<string | null>(null)

  const handleTextChange =
    (field: keyof PatientFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }))
    }

  const handleSubmit = () => {
    if (mode === 'create' && !/^\d{11}$/.test(values.tcNo.trim())) {
      setValidationMessage('TC kimlik numarasi 11 haneli sayisal bir deger olmali.')
      return
    }

    if (!values.firstName.trim() || !values.lastName.trim()) {
      setValidationMessage('Ad ve soyad alanlari zorunludur.')
      return
    }

    setValidationMessage(null)

    if (mode === 'create') {
      onSubmit({
        tcNo: values.tcNo,
        firstName: values.firstName,
        lastName: values.lastName,
        dateOfBirth: values.dateOfBirth || null,
        phoneNumber: values.phoneNumber || null,
        gender: values.gender || null,
      })
      return
    }

    onSubmit({
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth || null,
      phoneNumber: values.phoneNumber || null,
      gender: values.gender || null,
    })
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === 'create' ? 'Yeni Hasta Ekle' : 'Hasta Bilgilerini Guncelle'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Form alanlari patient-service request DTO yapisina gore hazirlandi.
          </Typography>

          {(validationMessage || submitError) ? (
            <Alert severity="error">{validationMessage || submitError}</Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="TC Kimlik No"
                value={values.tcNo}
                disabled={mode === 'edit' || loading}
                onChange={handleTextChange('tcNo')}
                helperText={
                  mode === 'edit'
                    ? 'Update DTO icinde tcNo alani bulunmadigi icin degistirilemez.'
                    : '11 haneli sayisal deger girin.'
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Dogum Tarihi"
                type="date"
                value={values.dateOfBirth}
                disabled={loading}
                onChange={handleTextChange('dateOfBirth')}
                slotProps={{ inputLabel: { shrink: true } }}
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
                label="Telefon"
                value={values.phoneNumber}
                disabled={loading}
                onChange={handleTextChange('phoneNumber')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="patient-gender-label">Cinsiyet</InputLabel>
                <Select
                  labelId="patient-gender-label"
                  value={values.gender}
                  label="Cinsiyet"
                  disabled={loading}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, gender: event.target.value }))
                  }
                >
                  <MenuItem value="">Belirtilmedi</MenuItem>
                  <MenuItem value="MALE">Erkek</MenuItem>
                  <MenuItem value="FEMALE">Kadin</MenuItem>
                </Select>
              </FormControl>
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
