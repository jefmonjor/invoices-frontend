import { useMemo } from 'react';
import { useAuth } from '@/store/authStore';

/**
 * Hook to get the current user's role and permissions
 * @returns Object with isAdmin, isUser, and role properties
 */
export const useUserRole = () => {
    const { user } = useAuth();

    const isAdmin = useMemo(() => {
        if (!user || !user.roles) return false;
        return user.roles.includes('ADMIN') || user.roles.includes('ROLE_ADMIN');
    }, [user]);

    const isUser = useMemo(() => {
        if (!user || !user.roles) return false;
        return user.roles.includes('USER') || user.roles.includes('ROLE_USER');
    }, [user]);

    const role = useMemo(() => {
        if (isAdmin) return 'ADMIN';
        if (isUser) return 'USER';
        return null;
    }, [isAdmin, isUser]);

    return {
        isAdmin,
        isUser,
        role,
        hasPermission: (permission: 'edit' | 'delete' | 'create' | 'view') => {
            if (permission === 'view') return true; // Everyone can view
            if (permission === 'create') return true; // Everyone can create
            return isAdmin; // Only admin can edit/delete
        }
    };
};

export default useUserRole;
