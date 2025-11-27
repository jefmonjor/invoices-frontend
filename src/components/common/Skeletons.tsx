import {
    Box,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Card,
    CardContent,
    Grid
} from '@mui/material';

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 5 }: TableSkeletonProps) => {
    return (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {Array.from(new Array(columns)).map((_, index) => (
                            <TableCell key={`head-${index}`}>
                                <Skeleton variant="text" width="80%" height={24} />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from(new Array(rows)).map((_, rowIndex) => (
                        <TableRow key={`row-${rowIndex}`}>
                            {Array.from(new Array(columns)).map((_, colIndex) => (
                                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                                    <Skeleton variant="text" width="100%" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export const CardSkeleton = () => {
    return (
        <Card sx={{ height: '100%', borderRadius: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="circular" width={40} height={40} />
                </Box>
                <Skeleton variant="rectangular" width="60%" height={40} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="30%" />
            </CardContent>
        </Card>
    );
};

export const DashboardSkeleton = () => {
    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 4 }}>
                <Skeleton variant="text" width={300} height={60} />
                <Skeleton variant="text" width={200} />
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[1, 2, 3, 4].map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item}>
                        <CardSkeleton />
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
                </Grid>
            </Grid>
        </Box>
    );
};
