import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { AuthStatusScreen } from '../components/AuthStatusScreen.tsx'

export function PublicOnlyRoute() {
  const auth = useAuth()

  if (auth.isLoading || auth.activeNavigator === 'signinRedirect') {
    return (
      <AuthStatusScreen
        title="Kimlik dogrulama hazirlaniyor"
        description="Oturum durumu okunuyor ve guvenli giris akisiniz hazirlaniyor."
      />
    )
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
