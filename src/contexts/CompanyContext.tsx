import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Company } from '@/types/company.types';
import { companiesApi } from '@/api/companies.api';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import { logger } from '@/utils/logger';
import { CompanyContext, type CompanyContextState } from './CompanyContextDefinition';

const STORAGE_KEY = 'currentCompanyId';

interface CompanyProviderProps {
  children: ReactNode;
}

/**
 * Company Context Provider
 * Gestiona la empresa actual del usuario y sus empresas disponibles
 */
export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [userRole, setUserRole] = useState<'ADMIN' | 'USER' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar empresas del usuario desde el backend
   */
  const fetchUserCompanies = useCallback(async (): Promise<Company[]> => {
    try {
      const companies = await companiesApi.getUserCompanies();
      return companies;
    } catch (err) {
      logger.error('Error fetching user companies:', err);
      throw new Error('No se pudieron cargar las empresas del usuario');
    }
  }, []);

  /**
   * Inicializar contexto: cargar empresas y establecer empresa actual
   */
  const initializeContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Cargar empresas del usuario
      const companies = await fetchUserCompanies();
      setUserCompanies(companies);

      if (companies.length === 0) {
        // Si no hay empresas, no es necesariamente un error (usuario nuevo)
        setCurrentCompany(null);
        setUserRole(null);
        return;
      }

      // Intentar cargar empresa guardada en localStorage
      const savedCompanyId = localStorage.getItem(STORAGE_KEY);
      let companyToSet: Company | null = null;

      if (savedCompanyId) {
        companyToSet = companies.find(c => c.id === parseInt(savedCompanyId, 10)) || null;
      }

      // Si no hay empresa guardada o no es válida, usar la primera (por ahora)
      // TODO: Usar la marcada como default cuando el backend lo devuelva
      if (!companyToSet) {
        companyToSet = companies[0];
        localStorage.setItem(STORAGE_KEY, companyToSet.id.toString());
      }

      setCurrentCompany(companyToSet);
      setUserRole(companyToSet.role || 'USER'); // Default to USER if role missing

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar empresas';
      setError(message);
      logger.error('Error initializing company context:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserCompanies]);



  // ... (imports)

  /**
   * Cambiar a otra empresa
   */
  const switchCompany = useCallback(async (companyId: number) => {
    const targetCompany = userCompanies.find(c => c.id === companyId);

    if (!targetCompany) {
      logger.error(`Company with ID ${companyId} not found in user companies`);
      return;
    }

    try {
      // 1. Call backend to switch context and get new token
      const response = await authApi.switchCompany(companyId);

      // 2. Update Auth Store with new token and user
      useAuthStore.getState().setAuth(response.token, response.user);

      // 3. Update local state
      setCurrentCompany(targetCompany);
      setUserRole(targetCompany.role || 'USER');
      localStorage.setItem(STORAGE_KEY, companyId.toString());

      // 4. Emit event
      window.dispatchEvent(new CustomEvent('companyChanged', {
        detail: { companyId, company: targetCompany }
      }));

      // 5. Show success feedback
      toast.success(`Cambiado a: ${targetCompany.businessName}`, {
        position: 'top-right',
        autoClose: 2000,
      });

      logger.log(`Switched to company: ${targetCompany.businessName} (${companyId})`);
    } catch (err) {
      logger.error('Error switching company:', err);
      setError('Error al cambiar de empresa');
      toast.error('Error al cambiar de empresa. Por favor, intenta de nuevo.');
    }
  }, [userCompanies]);

  /**
   * Refrescar lista de empresas desde el backend
   */
  const refreshCompanies = useCallback(async () => {
    await initializeContext();
  }, [initializeContext]);

  /**
   * Establecer empresa por defecto
   */
  const setDefaultCompany = useCallback(async (companyId: number) => {
    try {
      await companiesApi.setDefaultCompany(companyId);
      logger.log(`Set company ${companyId} as default`);
      // No necesitamos actualizar estado local complejo si solo afecta al login futuro
    } catch (err) {
      logger.error('Error setting default company:', err);
      throw err;
    }
  }, []);

  // Solo inicializar si el usuario está autenticado
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      initializeContext();
    } else {
      // Si no está autenticado, limpiar estado
      setIsLoading(false);
      setCurrentCompany(null);
      setUserCompanies([]);
      setUserRole(null);
      setError(null);
    }
  }, [isAuthenticated, initializeContext]);

  const contextValue: CompanyContextState = {
    currentCompany,
    userCompanies,
    userRole,
    isLoading,
    error,
    switchCompany,
    refreshCompanies,
    setDefaultCompany,
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};
