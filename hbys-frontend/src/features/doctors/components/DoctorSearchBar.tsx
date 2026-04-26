import { CloseRounded } from '@mui/icons-material'
import { Button, Stack, TextField } from '@mui/material'

type DoctorSearchBarProps = {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
}

export function DoctorSearchBar({
  value,
  disabled = false,
  onChange,
  onSearch,
  onClear,
}: DoctorSearchBarProps) {
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
        label="Doktor ara"
        placeholder="Ad, soyad, personel no, e-posta, telefon veya uzmanlik kodu"
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
