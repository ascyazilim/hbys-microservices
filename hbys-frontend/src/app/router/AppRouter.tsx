import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout.tsx'
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage.tsx'
import { LoginPage } from '../../features/auth/pages/LoginPage.tsx'
import { AuthCallbackPage } from '../../features/auth/pages/AuthCallbackPage.tsx'
import { ProtectedRoute } from '../../features/auth/routes/ProtectedRoute.tsx'
import { PublicOnlyRoute } from '../../features/auth/routes/PublicOnlyRoute.tsx'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
