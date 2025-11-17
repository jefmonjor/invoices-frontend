import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface LoadingSkeletonProps {
  rows?: number;
  variant?: 'table' | 'card' | 'list';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5, variant = 'table' }) => {
  if (variant === 'card') {
    return (
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="40%" sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (variant === 'list') {
    return (
      <Box>
        {Array.from({ length: rows }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // Table variant (default)
  return (
    <Box>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={50} sx={{ mb: 1 }} />
      ))}
    </Box>
  );
};
