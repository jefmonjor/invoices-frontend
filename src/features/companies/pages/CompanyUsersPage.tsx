import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Chip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { companyService, type CompanyUser } from '@/api/companyService';
import { toast } from 'react-toastify';
import { useUserRole } from '@/hooks/useUserRole';

export const CompanyUsersPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAdmin } = useUserRole();

    const [users, setUsers] = useState<CompanyUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<CompanyUser | null>(null);
    const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<CompanyUser | null>(null);

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin) {
            toast.error('No tienes permisos para acceder a esta página');
            navigate('/');
        }
    }, [isAdmin, navigate]);

    // Load users
    useEffect(() => {
        if (id && isAdmin) {
            loadUsers();
        }
    }, [id, isAdmin]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await companyService.getUsers(Number(id!));
            setUsers(response.users || []);
        } catch (error) {
            toast.error('Error al cargar usuarios');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditRole = (user: CompanyUser) => {
        setEditingUser(user);
        setNewRole(user.role);
    };

    const handleSaveRole = async () => {
        if (!editingUser) return;

        try {
            await companyService.updateUserRole(Number(id!), editingUser.userId, newRole);
            toast.success('Rol actualizado exitosamente');
            setEditingUser(null);
            loadUsers();
        } catch (error: unknown) {
            toast.error(error.response?.data?.message || 'Error al actualizar rol');
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await companyService.removeUser(Number(id!), userToDelete.userId);
            toast.success('Usuario eliminado de la empresa');
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            loadUsers();
        } catch (error: unknown) {
            toast.error(error.response?.data?.message || 'Error al eliminar usuario');
        }
    };

    if (!isAdmin) return null;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Gestión de Usuarios
            </Typography>

            {!loading && users.length === 0 && (
                <Alert severity="info">No hay usuarios en esta empresa</Alert>
            )}

            <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Rol</TableCell>
                            <TableCell>Fecha de unión</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.userId}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role}
                                        color={user.role === 'ADMIN' ? 'primary' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{user.joinedAt || '-'}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => handleEditRole(user)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            setUserToDelete(user);
                                            setDeleteDialogOpen(true);
                                        }}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Edit Role Dialog */}
            <Dialog open={Boolean(editingUser)} onClose={() => setEditingUser(null)}>
                <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Rol</InputLabel>
                        <Select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as 'ADMIN' | 'USER')}
                        >
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                            <MenuItem value="USER">USER</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingUser(null)}>Cancelar</Button>
                    <Button onClick={handleSaveRole} variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar a {userToDelete?.name} de la empresa?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteUser} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CompanyUsersPage;
