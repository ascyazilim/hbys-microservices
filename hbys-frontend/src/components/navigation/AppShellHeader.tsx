import {
  LogoutRounded,
  MenuRounded,
  NotificationsOutlined,
  SearchRounded,
} from '@mui/icons-material'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Toolbar,
  Typography,
  alpha,
} from '@mui/material'
import { useAuthSession } from '../../features/auth/hooks/useAuthSession.ts'

type AppShellHeaderProps = {
  onMenuClick: () => void
  sidebarWidth: number
}

export function AppShellHeader({
  onMenuClick,
  sidebarWidth,
}: AppShellHeaderProps) {
  const { auth, user } = useAuthSession()

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{
        width: { lg: `calc(100% - ${sidebarWidth}px)` },
        ml: { lg: `${sidebarWidth}px` },
        px: { xs: 2, md: 3 },
        pt: { xs: 2, md: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 5,
          bgcolor: 'shell.contentSurface',
        }}
      >
        <Toolbar sx={{ minHeight: '72px !important', gap: 2, px: { xs: 1.5, md: 2.5 } }}>
          <IconButton
            color="primary"
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { lg: 'none' } }}
          >
            <MenuRounded />
          </IconButton>

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Merkezi HBYS Yonetim Paneli
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Klinik operasyonlar, is akislari ve yonetim ekranlari icin temel arayuz
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1,
              minWidth: { md: 220, lg: 260 },
              maxWidth: 320,
              flexGrow: 1,
              borderRadius: 99,
              px: 1.75,
              py: 0.75,
              bgcolor: alpha('#ffffff', 0.82),
            }}
          >
            <SearchRounded color="action" />
            <InputBase placeholder="Hasta, protokol veya islem ara" sx={{ flexGrow: 1 }} />
          </Paper>

          <IconButton
            sx={{
              bgcolor: alpha('#ffffff', 0.7),
              '&:hover': { bgcolor: alpha('#ffffff', 0.94) },
            }}
          >
            <NotificationsOutlined />
          </IconButton>

          <Button
            type="button"
            variant="text"
            color="inherit"
            startIcon={<LogoutRounded />}
            onClick={() =>
              void auth.signoutRedirect({
                post_logout_redirect_uri: `${window.location.origin}/login`,
              })
            }
            sx={{ display: { xs: 'none', xl: 'inline-flex' } }}
          >
            Cikis
          </Button>

          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {(user?.username?.[0] ?? 'U').toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {user?.username || 'HBYS Kullanici'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role || 'Guvenli oturum'}
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </Paper>
    </AppBar>
  )
}
