import {
  ApartmentRounded,
  AssessmentRounded,
  CalendarMonthRounded,
  DashboardRounded,
  LocalHospitalRounded,
  LogoutRounded,
  PeopleAltRounded,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import type { DrawerProps } from '@mui/material'
import { NavLink } from 'react-router-dom'
import { useAuthSession } from '../../features/auth/hooks/useAuthSession.ts'

type AppShellSidebarProps = {
  mobileOpen: boolean
  onClose: () => void
  sidebarWidth: number
  variant: DrawerProps['variant']
}

const navigationItems = [
  { icon: DashboardRounded, label: 'Dashboard', path: '/dashboard' },
  {
    icon: PeopleAltRounded,
    label: 'Hasta Yönetimi',
    path: '/patients',
    requiredAuthorities: ['PATIENT_READ'],
  },
  {
    icon: CalendarMonthRounded,
    label: 'Randevu Yönetimi',
    path: '/dashboard',
    requiredAuthorities: ['APPOINTMENT_READ'],
  },
  {
    icon: AssessmentRounded,
    label: 'Doktor Yönetimi',
    path: '/doctors',
    requiredAuthorities: ['DOCTOR_READ'],
  },
]

const quickAccessItems = [
  'Poliklinik yonetimi',
  'Yatak doluluk takibi',
  'Laboratuvar surecleri',
]

export function AppShellSidebar({
  mobileOpen,
  onClose,
  sidebarWidth,
  variant,
}: AppShellSidebarProps) {
  const { auth, user } = useAuthSession()
  const userAuthorities = user?.authorities ?? []
  const visibleNavigationItems = navigationItems.filter((item) => {
    if (!item.requiredAuthorities?.length) {
      return true
    }

    return item.requiredAuthorities.some((authority) => userAuthorities.includes(authority))
  })

  const sidebarContent = (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100dvh',
        flexDirection: 'column',
        bgcolor: 'shell.sidebar',
        color: 'common.white',
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          width: 8,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: alpha('#ffffff', 0.18),
          borderRadius: 999,
        },
      }}
    >
      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              display: 'grid',
              height: 44,
              width: 44,
              placeItems: 'center',
              borderRadius: 3,
              bgcolor: alpha('#ffffff', 0.14),
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.18)',
            }}
          >
            <LocalHospitalRounded />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1">HBYS Command</Typography>
            <Typography
              variant="body2"
              sx={{ color: alpha('#ffffff', 0.7), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {user?.username ? `${user.username} oturumu aktif` : 'Kurumsal Operasyon Paneli'}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            minHeight: 160,
            alignContent: 'center',
            gap: 1,
            borderRadius: 2,
            px: 2.25,
            py: 2.5,
            background:
              'radial-gradient(circle at top right, rgba(255,255,255,0.16), transparent 34%), linear-gradient(160deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05))',
            border: '1px solid',
            borderColor: 'shell.sidebarBorder',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: alpha('#ffffff', 0.72),
              lineHeight: 1.2,
              letterSpacing: '0.14em',
            }}
          >
            Sistem Durumu
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            12 aktif modul
          </Typography>
          <Typography
            variant="body2"
            sx={{
              maxWidth: 220,
              color: alpha('#ffffff', 0.76),
              lineHeight: 1.55,
            }}
          >
            Klinik, finans ve operasyon ekranlari icin temel navigasyon omurgasi hazir.
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ borderColor: 'shell.sidebarBorder' }} />

      <Box sx={{ flexGrow: 1, px: 2, py: 2 }}>
        <Typography
          variant="overline"
          sx={{ px: 1.5, color: alpha('#ffffff', 0.6), letterSpacing: '0.12em' }}
        >
          Navigasyon
        </Typography>

        <List sx={{ mt: 1.5 }}>
          {visibleNavigationItems.map(({ icon: Icon, label, path }) => (
            <ListItemButton
              key={label}
              component={NavLink}
              to={path}
              onClick={onClose}
              sx={{ color: 'inherit' }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ p: 3, pt: 0 }}>
        <Button
          variant="outlined"
          color="inherit"
          fullWidth
          startIcon={<LogoutRounded />}
          onClick={() =>
            void auth.signoutRedirect({
              post_logout_redirect_uri: `${window.location.origin}/login`,
            })
          }
          sx={{
            mb: 2,
            borderColor: alpha('#ffffff', 0.18),
            color: 'inherit',
          }}
        >
          Cikis Yap
        </Button>

        <Typography
          variant="overline"
          sx={{ color: alpha('#ffffff', 0.6), letterSpacing: '0.12em' }}
        >
          Hizli Erisim
        </Typography>
        <Stack spacing={1.25} sx={{ mt: 1.5 }}>
          {quickAccessItems.map((item) => (
            <Stack
              key={item}
              direction="row"
              spacing={1.25}
              sx={{
                alignItems: 'center',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'shell.sidebarBorder',
                px: 1.5,
                py: 1.25,
              }}
            >
              <ApartmentRounded sx={{ fontSize: 18, color: alpha('#ffffff', 0.78) }} />
              <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.78) }}>
                {item}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  )

  return (
    <Drawer
      open={variant === 'permanent' ? true : mobileOpen}
      onClose={onClose}
      variant={variant}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          borderRight: 'none',
          height: '100dvh',
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  )
}
