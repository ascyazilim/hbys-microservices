import {
  ArrowOutwardRounded,
  LocalHospitalOutlined,
  MonitorHeartOutlined,
  ScheduleOutlined,
  TrendingUpRounded,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material'

const metricCards = [
  {
    title: 'Günlük başvuru akışı',
    value: '1.284',
    caption: 'Son 24 saatte +8.2%',
    icon: LocalHospitalOutlined,
  },
  {
    title: 'Aktif randevu planı',
    value: '342',
    caption: 'Bugün 17 klinik dolu',
    icon: ScheduleOutlined,
  },
  {
    title: 'Anlık operasyon sağlığı',
    value: '%98.4',
    caption: 'Kritik servislerde stabilite yüksek',
    icon: MonitorHeartOutlined,
  },
]

const workflowCards = [
  {
    title: 'Poliklinik Akışı',
    description: 'Kayıt, triyaj ve hekim yönlendirme adımları için modüler ekran başlangıcı.',
  },
  {
    title: 'Yatak ve Servis Yönetimi',
    description: 'Doluluk, transfer ve taburcu süreçleri için merkezi görünüm planlandı.',
  },
  {
    title: 'Laboratuvar ve Sonuç Süreçleri',
    description: 'İstek, barkod ve sonuç yayınlama ekranları için temel alan ayrıldı.',
  },
]

export function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          overflow: 'hidden',
          position: 'relative',
          borderRadius: { xs: 3, md: 4 },
          background:
            'linear-gradient(135deg, rgba(18,61,113,0.96) 0%, rgba(14,116,144,0.92) 100%)',
          color: 'common.white',
          boxShadow: '0 28px 60px rgba(18, 61, 113, 0.2)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 86% 14%, rgba(255,255,255,0.16), transparent 20%), radial-gradient(circle at 10% 100%, rgba(255,255,255,0.12), transparent 24%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            p: { xs: 3, md: 4.5 },
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
          }}
        >
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={3}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', lg: 'center' },
            }}
          >
            <Box sx={{ maxWidth: 720 }}>
              <Chip
                label="HBYS Frontend Baslangic Iskeleti"
                sx={{
                  mb: 2,
                  borderRadius: 99,
                  bgcolor: alpha('#ffffff', 0.12),
                  color: 'inherit',
                  fontWeight: 700,
                  border: `1px solid ${alpha('#ffffff', 0.14)}`,
                }}
              />
              <Typography variant="h3" sx={{ maxWidth: 720, lineHeight: 1.08 }}>
                Kurumsal hastane operasyonlari icin net bir ana panel
              </Typography>
              <Typography
                variant="body1"
                sx={{ mt: 1.5, maxWidth: 620, color: alpha('#ffffff', 0.82) }}
              >
                Bu ekran; modul tabanli gezinme, yonetici paneli yerlesimi ve kritik metrik
                kartlariyla HBYS frontend gelisimi icin temiz bir baslangic sunar.
              </Typography>
            </Box>

            <Button
              variant="contained"
              color="secondary"
              endIcon={<ArrowOutwardRounded />}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                px: 2.5,
                py: 1.25,
                borderRadius: 3,
                boxShadow: 'none',
              }}
            >
              Modul Tasarimina Devam Et
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {metricCards.map(({ title, value, caption, icon: Icon }) => (
          <Grid key={title} size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {title}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1.5 }}>
                      {value}
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                      {caption}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      height: 48,
                      width: 48,
                      placeItems: 'center',
                      borderRadius: 4,
                      bgcolor: alpha('#1f5ea8', 0.08),
                      color: 'primary.main',
                    }}
                  >
                    <Icon />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, xl: 7 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ justifyContent: 'space-between' }}
              >
                <Box>
                  <Typography variant="h5">Klinik is akislarina hazir alanlar</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Her modulu ayri feature klasorlerine tasiyabilecegimiz, buyumeye uygun bir
                    yapi kuruldu.
                  </Typography>
                </Box>
                <Chip
                  icon={<TrendingUpRounded />}
                  label="Olceklenebilir UI temeli"
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              <Stack spacing={2} sx={{ mt: 3 }}>
                {workflowCards.map((item, index) => (
                  <Paper
                    key={item.title}
                    sx={{
                      p: 2.25,
                      borderRadius: 4,
                      bgcolor: alpha('#1f5ea8', 0.03),
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={2}
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1">{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={`Alan ${index + 1}`}
                        sx={{
                          bgcolor: alpha('#0f766e', 0.08),
                          color: 'secondary.dark',
                          fontWeight: 700,
                        }}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, xl: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5">Hazirlik durumu</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tema, layout, router ve ortak servis katmani tamamlandi. Sonraki adimda feature
                bazli ekranlar ayni omurga uzerine eklenebilir.
              </Typography>

              <Stack spacing={2.25} sx={{ mt: 3 }}>
                <Box>
                  <Stack direction="row" sx={{ mb: 1, justifyContent: 'space-between' }}>
                    <Typography variant="body2">Tema ve tasarim sistemi</Typography>
                    <Typography variant="body2" color="text.secondary">
                      100%
                    </Typography>
                  </Stack>
                  <LinearProgress value={100} variant="determinate" sx={{ height: 10, borderRadius: 99 }} />
                </Box>
                <Box>
                  <Stack direction="row" sx={{ mb: 1, justifyContent: 'space-between' }}>
                    <Typography variant="body2">Router ve layout omurgasi</Typography>
                    <Typography variant="body2" color="text.secondary">
                      100%
                    </Typography>
                  </Stack>
                  <LinearProgress value={100} variant="determinate" sx={{ height: 10, borderRadius: 99 }} />
                </Box>
                <Box>
                  <Stack direction="row" sx={{ mb: 1, justifyContent: 'space-between' }}>
                    <Typography variant="body2">Feature ekranlarinin detaylandirilmasi</Typography>
                    <Typography variant="body2" color="text.secondary">
                      20%
                    </Typography>
                  </Stack>
                  <LinearProgress value={20} variant="determinate" sx={{ height: 10, borderRadius: 99 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
