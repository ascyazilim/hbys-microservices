import { Box, CircularProgress, Stack, Typography } from '@mui/material'

type AuthStatusScreenProps = {
  title: string
  description: string
}

export function AuthStatusScreen({ title, description }: AuthStatusScreenProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 3,
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center', maxWidth: 420, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </Box>
  )
}
