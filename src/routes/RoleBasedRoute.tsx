import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = user.roles.some(role => allowedRoles.includes(role));

  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Hook para verificar permisos
export const useHasRole = (roles: string[]): boolean => {
  const { user } = useAuthStore();
  if (!user) return false;
  return user.roles.some(role => roles.includes(role));
};

export const useIsAdmin = (): boolean => {
  return useHasRole(['ROLE_ADMIN']);
};
