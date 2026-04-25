import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AuthProvider } from 'react-oidc-context'
import './index.css'
import App from './App.tsx'
import { oidcUserManager } from './features/auth/storage/authStorage.ts'
import { oidcConfig } from './features/auth/config/oidc.ts'
import { appTheme } from './theme/appTheme.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...oidcConfig} userManager={oidcUserManager}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
