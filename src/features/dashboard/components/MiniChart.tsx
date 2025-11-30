import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { useTheme } from '@mui/material';

interface MiniChartProps {
    data: { name: string; value: number }[];
    color?: string;
}

export const MiniChart = ({ data, color }: MiniChartProps) => {
    const theme = useTheme();
    const chartColor = color || theme.palette.primary.main;

    return (
        <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id={`gradient-${chartColor}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Tooltip
                    contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}
                    itemStyle={{ color: theme.palette.text.primary }}
                    labelStyle={{ color: theme.palette.text.secondary }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#gradient-${chartColor})`}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
