import { Card, CardContent, Typography, Grid, Button } from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        { label: 'Nueva Factura', icon: <AddCircleOutlineRoundedIcon />, path: '/invoices/new', color: 'primary' },
        { label: 'Nuevo Cliente', icon: <PersonAddAlt1RoundedIcon />, path: '/clients/new', color: 'secondary' },
        { label: 'Ver Facturas', icon: <ReceiptLongRoundedIcon />, path: '/invoices', color: 'info' },
    ];

    return (
        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Acciones Rápidas
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {actions.map((action) => (
                        <Grid item xs={12} sm={4} key={action.label}>
                            <Button
                                variant="outlined"
                                color={action.color as any}
                                fullWidth
                                startIcon={action.icon}
                                onClick={() => navigate(action.path)}
                                sx={{
                                    py: 1.5,
                                    borderRadius: 2,
                                    justifyContent: 'flex-start',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    borderWidth: 2,
                                    '&:hover': { borderWidth: 2 }
                                }}
                            >
                                {action.label}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};
