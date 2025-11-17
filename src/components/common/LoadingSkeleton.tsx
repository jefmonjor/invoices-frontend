import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface LoadingSkeletonProps {
  rows?: number;
  variant?: 'table' | 'card' | 'list' | 'form';
  animation?: 'pulse' | 'wave' | false;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 5,
  variant = 'table',
  animation = 'wave'
}) => {
  if (variant === 'form') {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'grid', gap: 3 }}>
            {Array.from({ length: rows }).map((_, index) => (
              <Box key={index}>
                <Skeleton animation={animation} variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                <Skeleton animation={animation} variant="rectangular" height={56} />
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Skeleton animation={animation} variant="rectangular" width={100} height={40} />
              <Skeleton animation={animation} variant="rectangular" width={100} height={40} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'card') {
    return (
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
        {Array.from({ length: rows }).map((_, index) => (
          <Card key={index}>
            <CardContent>
              <Skeleton animation={animation} variant="text" width="60%" height={30} />
              <Skeleton animation={animation} variant="text" width="40%" sx={{ mt: 1 }} />
              <Skeleton animation={animation} variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 1 }} />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton animation={animation} variant="rectangular" width={80} height={30} />
                <Skeleton animation={animation} variant="rectangular" width={80} height={30} />
              </Box>
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
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Skeleton animation={animation} variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton animation={animation} variant="text" width="70%" height={24} />
              <Skeleton animation={animation} variant="text" width="40%" height={20} />
            </Box>
            <Skeleton animation={animation} variant="rectangular" width={80} height={32} />
          </Box>
        ))}
      </Box>
    );
  }

  // Table variant (default)
  return (
    <Box>
      <Skeleton animation={animation} variant="rectangular" height={56} sx={{ mb: 2 }} />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton
          key={index}
          animation={animation}
          variant="rectangular"
          height={52}
          sx={{ mb: 1, borderRadius: 1 }}
        />
      ))}
    </Box>
  );
};
