import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook que monitorea la expiración del token JWT
 * Cierra la sesión automáticamente cuando el token expira
 */
export const useTokenExpiration = () => {
    const { token, clearAuth } = useAuthStore();

    useEffect(() => {
        if (!token) return;

        const decodeJWT = (token: string): { exp: number } | null => {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                    atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
                );
                return JSON.parse(jsonPayload);
            } catch {
                return null;
            }
        };

        const checkTokenExpiration = () => {
            const decoded = decodeJWT(token);
            if (!decoded || !decoded.exp) {
                clearAuth();
                return;
            }

            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;

            // Si el token ya expiró o expira en menos de 30 segundos
            if (timeUntilExpiration <= 30000) {
                clearAuth();
                window.location.href = '/login';
            }
        };

        // Verificar inmediatamente
        checkTokenExpiration();

        // Verificar cada 30 segundos
        const interval = setInterval(checkTokenExpiration, 30000);

        return () => clearInterval(interval);
    }, [token, clearAuth]);
};
