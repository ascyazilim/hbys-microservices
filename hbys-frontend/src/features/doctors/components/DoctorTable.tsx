import {
  DeleteOutlineRounded,
  EditOutlined,
  FolderSharedOutlined,
} from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { Doctor, DoctorStatus } from '../types/doctor.types.ts'

type DoctorTableProps = {
  doctors: Doctor[]
  loading?: boolean
  page: number
  rowsPerPage: number
  totalRows: number
  canWrite: boolean
  canDelete: boolean
  searchActive: boolean
  onPageChange: (page: number) => void
  onRowsPerPageChange: (size: number) => void
  onView: (doctor: Doctor) => void
  onEdit: (doctor: Doctor) => void
  onDelete: (doctor: Doctor) => void
}

function getStatusLabel(status: DoctorStatus) {
  if (status === 'ACTIVE') return 'Aktif'
  if (status === 'PASSIVE') return 'Pasif'
  if (status === 'ON_LEAVE') return 'Izinde'
  return 'Askida'
}

function getStatusColor(status: DoctorStatus): 'success' | 'warning' | 'default' | 'error' {
  if (status === 'ACTIVE') return 'success'
  if (status === 'ON_LEAVE') return 'warning'
  if (status === 'SUSPENDED') return 'error'
  return 'default'
}

export function DoctorTable({
  doctors,
  loading = false,
  page,
  rowsPerPage,
  totalRows,
  canWrite,
  canDelete,
  searchActive,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
}: DoctorTableProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (isMobile) {
    return (
      <Card>
        {loading ? <LinearProgress /> : null}
        <CardContent sx={{ p: 0 }}>
          <Stack spacing={1.5} sx={{ p: 2 }}>
            {doctors.map((doctor) => (
              <Box
                key={doctor.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  p: 2,
                }}
              >
                <Stack spacing={1.25}>
                  <div>
                    <Typography variant="subtitle1">
                      {doctor.firstName} {doctor.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Personel No: {doctor.personelNo}
                    </Typography>
                  </div>
                  <Chip
                    label={getStatusLabel(doctor.status)}
                    color={getStatusColor(doctor.status)}
                    size="small"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Uzmanlik: {doctor.specialtyName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Klinik: {doctor.clinicName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Telefon: {doctor.phone || 'Belirtilmedi'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    E-posta: {doctor.email || 'Belirtilmedi'}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Detay">
                      <IconButton color="primary" onClick={() => onView(doctor)}>
                        <FolderSharedOutlined />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duzenle">
                      <span>
                        <IconButton
                          color="primary"
                          onClick={() => onEdit(doctor)}
                          disabled={!canWrite}
                        >
                          <EditOutlined />
                        </IconButton>
                      </span>
                    </Tooltip>
                    {canDelete ? (
                      <Tooltip title="Sil">
                        <span>
                          <IconButton
                            color="error"
                            onClick={() => onDelete(doctor)}
                            disabled={!canWrite}
                          >
                            <DeleteOutlineRounded />
                          </IconButton>
                        </span>
                      </Tooltip>
                    ) : null}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
          {!searchActive ? (
            <TablePagination
              component="div"
              count={totalRows}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, nextPage) => onPageChange(nextPage)}
              onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
              rowsPerPageOptions={[10, 20, 50]}
            />
          ) : null}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {loading ? <LinearProgress /> : null}
      <TableContainer>
        <Table sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell>Doktor</TableCell>
              <TableCell>Personel No</TableCell>
              <TableCell>Uzmanlik</TableCell>
              <TableCell>Klinik</TableCell>
              <TableCell>Iletisim</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell align="right">Aksiyonlar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((doctor) => (
              <TableRow hover key={doctor.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {doctor.firstName} {doctor.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {doctor.email || 'E-posta belirtilmedi'}
                  </Typography>
                </TableCell>
                <TableCell>{doctor.personelNo}</TableCell>
                <TableCell>
                  <Typography variant="body2">{doctor.specialtyName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doctor.specialtyCode}
                  </Typography>
                </TableCell>
                <TableCell>{doctor.clinicName}</TableCell>
                <TableCell>{doctor.phone || 'Belirtilmedi'}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(doctor.status)}
                    color={getStatusColor(doctor.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Detay">
                    <IconButton color="primary" onClick={() => onView(doctor)}>
                      <FolderSharedOutlined />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duzenle">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={() => onEdit(doctor)}
                        disabled={!canWrite}
                      >
                        <EditOutlined />
                      </IconButton>
                    </span>
                  </Tooltip>
                  {canDelete ? (
                    <Tooltip title="Sil">
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => onDelete(doctor)}
                          disabled={!canWrite}
                        >
                          <DeleteOutlineRounded />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!searchActive ? (
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, nextPage) => onPageChange(nextPage)}
          onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
          rowsPerPageOptions={[10, 20, 50]}
        />
      ) : null}
    </Card>
  )
}
