import { Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText, alpha, useTheme } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface AlertsListProps {
    alerts: string[];
    title?: string;
}

export const AlertsList = ({ alerts, title = 'Alertas Importantes' }: AlertsListProps) => {
    const theme = useTheme();

    if (!alerts || alerts.length === 0) return null;

    return (
        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {title}
                </Typography>
                <List>
                    {alerts.map((alert, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                bgcolor: alpha(theme.palette.warning.main, 0.05),
                                borderRadius: 2,
                                mb: 1,
                                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <WarningAmberRoundedIcon color="warning" />
                            </ListItemIcon>
                            <ListItemText primary={alert} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};
