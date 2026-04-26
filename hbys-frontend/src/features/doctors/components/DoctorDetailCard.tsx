import {
  BadgeRounded,
  BusinessCenterRounded,
  CallRounded,
  LocalHospitalRounded,
  MailOutlineRounded,
  MedicalServicesRounded,
  MonitorHeartRounded,
} from '@mui/icons-material'
import type { SvgIconComponent } from '@mui/icons-material'
import { Card, CardContent, Chip, Grid, Stack, Typography, alpha } from '@mui/material'
import type { Doctor } from '../types/doctor.types.ts'

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

function getStatusLabel(status: Doctor['status']) {
  if (status === 'ACTIVE') return 'Aktif'
  if (status === 'PASSIVE') return 'Pasif'
  if (status === 'ON_LEAVE') return 'Izinde'
  return 'Askida'
}

type DoctorDetailCardProps = {
  doctor: Doctor
}

export function DoctorDetailCard({ doctor }: DoctorDetailCardProps) {
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
                  <Typography variant="h5">Kimlik ve Gorev Bilgileri</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Doktorun sistem tarafindan uretilecek kurumsal personel numarasi ve referans
                    veri iliskileri.
                  </Typography>
                </div>
                <Chip label={getStatusLabel(doctor.status)} color="primary" variant="outlined" />
              </Stack>

              <DetailRow
                icon={BadgeRounded}
                label="Ad Soyad"
                value={`${doctor.firstName} ${doctor.lastName}`}
              />
              <DetailRow
                icon={BusinessCenterRounded}
                label="Personel No"
                value={doctor.personelNo}
              />
              <DetailRow
                icon={MedicalServicesRounded}
                label="Uzmanlik"
                value={`${doctor.specialtyName} (${doctor.specialtyCode})`}
              />
              <DetailRow
                icon={LocalHospitalRounded}
                label="Klinik"
                value={doctor.clinicName}
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, lg: 6 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h5">Iletisim ve Servis Notlari</Typography>
              <Typography variant="body2" color="text.secondary">
                Uzmanlik ve klinik verileri su an doctor-service icinde referans veri olarak
                tutulur; ileride ayri bir reference-data-service katmanina tasinabilir.
              </Typography>
              <DetailRow
                icon={MailOutlineRounded}
                label="E-posta"
                value={doctor.email || 'Belirtilmedi'}
              />
              <DetailRow
                icon={CallRounded}
                label="Telefon"
                value={doctor.phone || 'Belirtilmedi'}
              />
              <DetailRow
                icon={MonitorHeartRounded}
                label="Durum"
                value={getStatusLabel(doctor.status)}
              />
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
