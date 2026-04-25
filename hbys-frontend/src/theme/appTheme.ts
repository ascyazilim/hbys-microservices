import { alpha, createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    shell: {
      sidebar: string
      sidebarBorder: string
      contentSurface: string
      heroStart: string
      heroEnd: string
    }
  }

  interface PaletteOptions {
    shell?: {
      sidebar: string
      sidebarBorder: string
      contentSurface: string
      heroStart: string
      heroEnd: string
    }
  }
}

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f5ea8',
      light: '#5e8fd7',
      dark: '#153d6d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e',
      light: '#4db6ac',
      dark: '#0c5b55',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#d97706',
    },
    error: {
      main: '#c2410c',
    },
    background: {
      default: '#edf3f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#12263f',
      secondary: '#526377',
    },
    divider: alpha('#123456', 0.12),
    shell: {
      sidebar: '#12304f',
      sidebarBorder: alpha('#ffffff', 0.1),
      contentSurface: 'rgba(255, 255, 255, 0.72)',
      heroStart: '#123d71',
      heroEnd: '#0e7490',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: ['Manrope', 'Segoe UI', 'sans-serif'].join(','),
    h3: {
      fontSize: '2.1rem',
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 700,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.98rem',
      lineHeight: 1.7,
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          colorScheme: 'light',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 24,
          border: `1px solid ${alpha(theme.palette.primary.dark, 0.08)}`,
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          backdropFilter: 'blur(14px)',
          border: `1px solid ${alpha(theme.palette.primary.dark, 0.08)}`,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 14,
          marginBottom: theme.spacing(0.5),
          '&.Mui-selected': {
            backgroundColor: alpha('#ffffff', 0.14),
          },
          '&.Mui-selected:hover': {
            backgroundColor: alpha('#ffffff', 0.2),
          },
        }),
      },
    },
  },
})
