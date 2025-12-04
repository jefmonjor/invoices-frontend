import { Card, CardContent, Typography, Box, useTheme, alpha } from '@mui/material';
import type { ReactNode } from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    trend?: number; // Percentage change
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'success' | 'info';
}

export const KPICard = ({ title, value, subtitle, icon, trend, color = 'primary' }: KPICardProps) => {
    const theme = useTheme();
    const mainColor = theme.palette[color].main;

    return (
        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(mainColor, 0.1),
                            color: mainColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {icon}
                    </Box>
                    {trend !== undefined && trend !== 0 && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                color: trend >= 0 ? theme.palette.success.main : theme.palette.error.main,
                                bgcolor: alpha(trend >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.1),
                                px: 1,
                                py: 0.5,
                                borderRadius: 1
                            }}
                        >
                            <Typography variant="caption" fontWeight="bold">
                                {trend > 0 ? '+' : ''}{trend}%
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};
