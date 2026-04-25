import { useState } from 'react'
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { AppShellHeader } from '../../components/navigation/AppShellHeader.tsx'
import { AppShellSidebar } from '../../components/navigation/AppShellSidebar.tsx'
import { ADMIN_SIDEBAR_WIDTH } from './layout.constants.ts'

export function AdminLayout() {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSidebarToggle = () => {
    setMobileOpen((previous) => !previous)
  }

  const handleSidebarClose = () => {
    setMobileOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppShellSidebar
        mobileOpen={mobileOpen}
        onClose={handleSidebarClose}
        sidebarWidth={ADMIN_SIDEBAR_WIDTH}
        variant={isDesktop ? 'permanent' : 'temporary'}
      />

      <Box
        component="div"
        sx={{
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        <AppShellHeader
          onMenuClick={handleSidebarToggle}
          sidebarWidth={ADMIN_SIDEBAR_WIDTH}
        />
        <Toolbar />
        <Box
          component="main"
          sx={{
            p: { xs: 2, md: 2.5, xl: 3 },
            pt: { xs: 3, md: 3.5 },
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 1260,
              mx: 'auto',
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
