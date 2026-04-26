import {
  BadgeRounded,
  CalendarMonthRounded,
  CallRounded,
  PersonOutlineRounded,
  WcRounded,
} from '@mui/icons-material'
import type { SvgIconComponent } from '@mui/icons-material'
import { Card, CardContent, Chip, Grid, Stack, Typography, alpha } from '@mui/material'
import type { Patient } from '../types/patient.types.ts'

type DetailRowProps = {
  icon: SvgIconComponent
  label: string
  value: string
}

function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'flex-start',
        borderRadius: 3,
        bgcolor: alpha('#1f5ea8', 0.04),
        px: 1.75,
        py: 1.5,
      }}
    >
      <Icon color="primary" sx={{ mt: 0.25 }} />
      <div>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="subtitle1">{value}</Typography>
      </div>
    </Stack>
  )
}

type PatientDetailCardProps = {
  patient: Patient
}

export function PatientDetailCard({ patient }: PatientDetailCardProps) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
              >
                <div>
                  <Typography variant="h5">Kimlik Bilgileri</Typography>
                  <Typography variant="body2" color="text.secondary">
                    PatientResponse icindeki temel hasta kimlik alanlari.
                  </Typography>
                </div>
                <Chip label={`ID ${patient.id}`} color="primary" variant="outlined" />
              </Stack>

              <DetailRow
                icon={PersonOutlineRounded}
                label="Ad Soyad"
                value={`${patient.firstName} ${patient.lastName}`}
              />
              <DetailRow icon={BadgeRounded} label="TC Kimlik No" value={patient.tcNo} />
              <DetailRow
                icon={CalendarMonthRounded}
                label="Dogum Tarihi"
                value={patient.dateOfBirth || 'Belirtilmedi'}
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h5">Iletisim ve Sistem Ozetleri</Typography>
              <Typography variant="body2" color="text.secondary">
                Mevcut mikroservis response yapisinda ek klinik veya finansal iliski verisi
                donmuyor; gosterim bu servisle sinirli tutuldu.
              </Typography>
              <DetailRow
                icon={CallRounded}
                label="Telefon"
                value={patient.phoneNumber || 'Belirtilmedi'}
              />
              <DetailRow
                icon={WcRounded}
                label="Cinsiyet"
                value={patient.gender || 'Belirtilmedi'}
              />
              <DetailRow
                icon={BadgeRounded}
                label="Kayit Durumu"
                value="Aktif kayit olarak listeleniyor"
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
