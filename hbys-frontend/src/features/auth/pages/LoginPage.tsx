import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { LoginRounded, ShieldOutlined } from '@mui/icons-material'
import { useAuth } from 'react-oidc-context'
import { AuthStatusScreen } from '../components/AuthStatusScreen.tsx'

type LocationState = {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const auth = useAuth()
  const location = useLocation()
  const locationState = location.state as LocationState | null
  const redirectPath = locationState?.from?.pathname ?? '/dashboard'

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator) {
      void auth.signinRedirect({
        state: {
          returnTo: redirectPath,
        },
      })
    }
  }, [auth, redirectPath])

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  if (auth.isLoading || auth.activeNavigator === 'signinRedirect') {
    return (
      <AuthStatusScreen
        title="Keycloak girisine yonlendiriliyor"
        description="Guvenli giris sayfasi aciliyor. Tarayici yonlendirmesi tamamlanirken lutfen bekleyin."
      />
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 3, md: 5 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1180 }}>
        <Card
          sx={{
            overflow: 'hidden',
            borderRadius: { xs: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(420px, 480px)' },
            }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                color: 'common.white',
                background:
                  'radial-gradient(circle at top, rgba(255,255,255,0.14), transparent 30%), linear-gradient(135deg, #123d71 0%, #0e7490 100%)',
              }}
            >
              <Typography variant="overline" sx={{ letterSpacing: '0.18em', opacity: 0.8 }}>
                HBYS AUTHENTICATION
              </Typography>
              <Typography variant="h3" sx={{ mt: 2, maxWidth: 520 }}>
                Hastane operasyonlarina guvenli ve kurumsal giris
              </Typography>
              <Typography
                variant="body1"
                sx={{ mt: 2, maxWidth: 520, color: alpha('#ffffff', 0.82) }}
              >
                Bu giris ekrani, backend tarafinda tanimlanan Keycloak tabanli JWT mimarisine
                uyumlu olacak sekilde tasarlandi.
              </Typography>

              <Stack
                spacing={2}
                sx={{
                  mt: { xs: 4, md: 6 },
                  maxWidth: 460,
                }}
              >
                {[
                  'Gateway ve mikroservisler Bearer token ile korunur.',
                  'Yetkiler JWT icindeki realm_access.roles alanindan okunur.',
                  'Frontend responsive ve moduler yapi uzerine kuruldu.',
                ].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      borderRadius: 4,
                      border: '1px solid',
                      borderColor: alpha('#ffffff', 0.16),
                      bgcolor: alpha('#ffffff', 0.08),
                      px: 2,
                      py: 1.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.88) }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <CardContent
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Stack spacing={3} sx={{ width: '100%' }}>
                <Typography variant="h4">Oturum Ac</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Kimlik dogrulama, Keycloak tarafindaki guvenli giris ekrani uzerinden
                  tamamlanacaktir.
                </Typography>

                <Divider />

                <Box
                  sx={{
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: alpha('#1f5ea8', 0.03),
                    px: 2.25,
                    py: 2,
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <ShieldOutlined color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Authorization Code Flow + PKCE kullaniliyor. Kullanici sifresi frontend
                      formunda alinmaz.
                    </Typography>
                  </Stack>
                </Box>

                <Button
                  type="button"
                  variant="contained"
                  size="large"
                  endIcon={<LoginRounded />}
                  onClick={() =>
                    void auth.signinRedirect({
                      state: {
                        returnTo: redirectPath,
                      },
                    })
                  }
                  sx={{
                    minHeight: 52,
                    width: '100%',
                  }}
                >
                  Keycloak ile Giris Yap
                </Button>
              </Stack>
            </CardContent>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
