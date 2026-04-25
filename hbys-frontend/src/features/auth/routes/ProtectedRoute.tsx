import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'
import { AuthStatusScreen } from '../components/AuthStatusScreen.tsx'

export function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isLoading || auth.activeNavigator) {
    return (
      <AuthStatusScreen
        title="Oturum kontrol ediliyor"
        description="Kimlik bilgileri dogrulaniyor ve guvenli oturum durumu denetleniyor."
      />
    )
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
