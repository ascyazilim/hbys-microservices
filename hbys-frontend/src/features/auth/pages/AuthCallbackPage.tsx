import { Alert, Box, Stack } from '@mui/material'
import { useAuth } from 'react-oidc-context'
import { AuthStatusScreen } from '../components/AuthStatusScreen.tsx'

export function AuthCallbackPage() {
  const auth = useAuth()

  if (auth.error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 3 }}>
        <Stack sx={{ width: '100%', maxWidth: 540 }}>
          <Alert severity="error">
            Kimlik dogrulama tamamlarken bir hata olustu. Keycloak ayarlarinizi ve redirect URI
            degerlerini kontrol edin.
          </Alert>
        </Stack>
      </Box>
    )
  }

  if (!auth.isLoading && !auth.activeNavigator && !auth.isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 3 }}>
        <Stack sx={{ width: '100%', maxWidth: 540 }}>
          <Alert severity="warning">
            Keycloak callback alindi ancak oturum tamamlanmadi. Client redirect URI, Web Origin ve
            realm ayarlarinizi tekrar kontrol edin.
          </Alert>
        </Stack>
      </Box>
    )
  }

  return (
    <AuthStatusScreen
      title="Giris tamamlanıyor"
      description="Keycloak oturumu dogrulaniyor ve guvenli oturumunuz hazirlaniyor."
    />
  )
}
