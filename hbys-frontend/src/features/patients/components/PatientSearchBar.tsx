import { CloseRounded } from '@mui/icons-material'
import { Button, Stack, TextField } from '@mui/material'

type PatientSearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
  disabled?: boolean
}

export function PatientSearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  disabled = false,
}: PatientSearchBarProps) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
      <TextField
        fullWidth
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            onSearch()
          }
        }}
        label="Hasta ara"
        placeholder="TC kimlik no, ad, soyad veya telefon"
      />
      <Stack direction="row" spacing={1.25}>
        <Button
          type="button"
          variant="contained"
          disabled={disabled}
          onClick={onSearch}
          sx={{ minWidth: 120 }}
        >
          Ara
        </Button>
        <Button
          type="button"
          variant="outlined"
          disabled={disabled || !value.trim()}
          startIcon={<CloseRounded />}
          onClick={onClear}
          sx={{ minWidth: 110 }}
        >
          Temizle
        </Button>
      </Stack>
    </Stack>
  )
}
