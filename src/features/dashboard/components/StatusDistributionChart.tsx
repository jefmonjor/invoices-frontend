import { Card, CardContent, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { InvoiceStatusDistribution } from '@/types/dashboard.types';

interface StatusDistributionChartProps {
  data: InvoiceStatusDistribution[];
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#9e9e9e',
  PENDING: '#ff9800',
  PAID: '#4caf50',
  CANCELLED: '#f44336',
};

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: getStatusLabel(item.status),
    value: item.count,
    percentage: item.percentage,
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Distribución por Estado
        </Typography>
        <Box sx={{ width: '100%', height: 300, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: PieLabelRenderProps) => {
                  const data = props as PieLabelRenderProps & { name?: string; percentage?: number };
                  return `${data.name || ''}: ${(data.percentage || 0).toFixed(1)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} facturas`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Borrador',
    PENDING: 'Pendiente',
    PAID: 'Pagada',
    CANCELLED: 'Cancelada',
  };
  return labels[status] || status;
}
