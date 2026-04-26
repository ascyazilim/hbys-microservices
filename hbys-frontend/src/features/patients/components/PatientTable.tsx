import {
  DeleteOutlineRounded,
  EditOutlined,
  FolderSharedOutlined,
} from '@mui/icons-material'
import {
  Box,
  Card,
  CardContent,
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
import type { Patient } from '../types/patient.types.ts'

type PatientTableProps = {
  patients: Patient[]
  loading?: boolean
  page: number
  rowsPerPage: number
  totalRows: number
  canWrite: boolean
  searchActive: boolean
  onPageChange: (page: number) => void
  onRowsPerPageChange: (size: number) => void
  onView: (patient: Patient) => void
  onEdit: (patient: Patient) => void
  onDelete: (patient: Patient) => void
}

function getGenderLabel(gender: string | null) {
  if (gender === 'MALE') {
    return 'Erkek'
  }

  if (gender === 'FEMALE') {
    return 'Kadin'
  }

  return 'Belirtilmedi'
}

export function PatientTable({
  patients,
  loading = false,
  page,
  rowsPerPage,
  totalRows,
  canWrite,
  searchActive,
  onPageChange,
  onRowsPerPageChange,
  onView,
  onEdit,
  onDelete,
}: PatientTableProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (isMobile) {
    return (
      <Card>
        {loading ? <LinearProgress /> : null}
        <CardContent sx={{ p: 0 }}>
          <Stack spacing={1.5} sx={{ p: 2 }}>
            {patients.map((patient) => (
              <Box
                key={patient.id}
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
                      {patient.firstName} {patient.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      TC: {patient.tcNo}
                    </Typography>
                  </div>
                  <Typography variant="body2" color="text.secondary">
                    Telefon: {patient.phoneNumber || 'Belirtilmedi'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dogum Tarihi: {patient.dateOfBirth || 'Belirtilmedi'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cinsiyet: {getGenderLabel(patient.gender)}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Detay">
                      <IconButton color="primary" onClick={() => onView(patient)}>
                        <FolderSharedOutlined />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Duzenle">
                      <span>
                        <IconButton
                          color="primary"
                          onClick={() => onEdit(patient)}
                          disabled={!canWrite}
                        >
                          <EditOutlined />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <span>
                        <IconButton
                          color="error"
                          onClick={() => onDelete(patient)}
                          disabled={!canWrite}
                        >
                          <DeleteOutlineRounded />
                        </IconButton>
                      </span>
                    </Tooltip>
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
        <Table sx={{ minWidth: 860 }}>
          <TableHead>
            <TableRow>
              <TableCell>Hasta</TableCell>
              <TableCell>TC Kimlik No</TableCell>
              <TableCell>Dogum Tarihi</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Cinsiyet</TableCell>
              <TableCell align="right">Aksiyonlar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow hover key={patient.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {patient.firstName} {patient.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hasta ID: {patient.id}
                  </Typography>
                </TableCell>
                <TableCell>{patient.tcNo}</TableCell>
                <TableCell>{patient.dateOfBirth || 'Belirtilmedi'}</TableCell>
                <TableCell>{patient.phoneNumber || 'Belirtilmedi'}</TableCell>
                <TableCell>{getGenderLabel(patient.gender)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Detay">
                    <IconButton color="primary" onClick={() => onView(patient)}>
                      <FolderSharedOutlined />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duzenle">
                    <span>
                      <IconButton
                        color="primary"
                        onClick={() => onEdit(patient)}
                        disabled={!canWrite}
                      >
                        <EditOutlined />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <span>
                      <IconButton
                        color="error"
                        onClick={() => onDelete(patient)}
                        disabled={!canWrite}
                      >
                        <DeleteOutlineRounded />
                      </IconButton>
                    </span>
                  </Tooltip>
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
