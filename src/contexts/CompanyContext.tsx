import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { CompanyDTO } from '@/types/invoice.types';

/**
 * User Company Association - Relaciona usuario con empresa y su rol
 */
export interface UserCompany {
  companyId: number;
  company: CompanyDTO;
  role: 'ADMIN' | 'USER';
  isDefault: boolean;
}

/**
 * Company Context State
 */
interface CompanyContextState {
  currentCompany: CompanyDTO | null;
  userCompanies: UserCompany[];
  isLoading: boolean;
  error: string | null;

  // Methods
  switchCompany: (companyId: number) => Promise<void>;
  refreshCompanies: () => Promise<void>;
  setDefaultCompany: (companyId: number) => void;
}

const CompanyContext = createContext<CompanyContextState | undefined>(undefined);

const STORAGE_KEY = 'currentCompanyId';

interface CompanyProviderProps {
  children: ReactNode;
}

/**
 * Company Context Provider
 * Gestiona la empresa actual del usuario y sus empresas disponibles
 *
 * Features:
 * - Multi-empresa: usuario puede pertenecer a varias empresas
 * - Cambio de contexto: switch entre empresas
 * - Persistencia: guarda empresa actual en localStorage
 * - Sincronización: actualiza datos cuando cambia la empresa
 */
export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [currentCompany, setCurrentCompany] = useState<CompanyDTO | null>(null);
  const [userCompanies, setUserCompanies] = useState<UserCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Cargar empresas del usuario desde el backend
   * TODO: Implementar llamada real al endpoint /api/users/me/companies
   */
  const fetchUserCompanies = useCallback(async (): Promise<UserCompany[]> => {
    try {
      // TODO: Reemplazar con llamada real al backend
      // const response = await apiClient.get<UserCompany[]>('/api/users/me/companies');
      // return response.data;

      // Mock data temporal
      const mockCompanies: UserCompany[] = [
        {
          companyId: 1,
          company: {
            id: 1,
            businessName: 'Mi Empresa Principal S.L.',
            taxId: 'A12345678',
            address: 'Calle Principal 123',
            city: 'Madrid',
            postalCode: '28001',
            province: 'Madrid',
            phone: '+34 912 345 678',
            email: 'contacto@miempresa.com',
            iban: 'ES91 2100 0418 4502 0005 1332',
          },
          role: 'ADMIN',
          isDefault: true,
        },
        {
          companyId: 2,
          company: {
            id: 2,
            businessName: 'Segunda Empresa S.L.',
            taxId: 'B87654321',
            address: 'Calle Secundaria 456',
            city: 'Barcelona',
            postalCode: '08001',
            province: 'Barcelona',
            phone: '+34 932 123 456',
            email: 'info@segundaempresa.com',
            iban: 'ES79 2100 0813 6101 2345 6789',
          },
          role: 'USER',
          isDefault: false,
        },
      ];

      return mockCompanies;
    } catch (err) {
      console.error('Error fetching user companies:', err);
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
        setError('No tienes empresas asignadas. Contacta al administrador.');
        setCurrentCompany(null);
        return;
      }

      // Intentar cargar empresa guardada en localStorage
      const savedCompanyId = localStorage.getItem(STORAGE_KEY);

      let companyToSet: CompanyDTO | null = null;

      if (savedCompanyId) {
        const savedCompany = companies.find(uc => uc.companyId === parseInt(savedCompanyId, 10));
        if (savedCompany) {
          companyToSet = savedCompany.company;
        }
      }

      // Si no hay empresa guardada o no es válida, usar la empresa por defecto
      if (!companyToSet) {
        const defaultCompany = companies.find(uc => uc.isDefault) || companies[0];
        companyToSet = defaultCompany.company;
        localStorage.setItem(STORAGE_KEY, defaultCompany.companyId.toString());
      }

      setCurrentCompany(companyToSet);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar empresas';
      setError(message);
      console.error('Error initializing company context:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserCompanies]);

  /**
   * Cambiar a otra empresa
   */
  const switchCompany = useCallback(async (companyId: number) => {
    const targetCompany = userCompanies.find(uc => uc.companyId === companyId);

    if (!targetCompany) {
      console.error(`Company with ID ${companyId} not found in user companies`);
      return;
    }

    setCurrentCompany(targetCompany.company);
    localStorage.setItem(STORAGE_KEY, companyId.toString());

    // Emitir evento personalizado para que otros componentes sepan que cambió la empresa
    window.dispatchEvent(new CustomEvent('companyChanged', {
      detail: { companyId, company: targetCompany.company }
    }));

    console.log(`Switched to company: ${targetCompany.company.businessName} (${companyId})`);
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
  const setDefaultCompany = useCallback((companyId: number) => {
    // TODO: Implementar llamada al backend para actualizar empresa por defecto
    // await apiClient.put(`/api/users/me/companies/${companyId}/set-default`);

    const updatedCompanies = userCompanies.map(uc => ({
      ...uc,
      isDefault: uc.companyId === companyId,
    }));

    setUserCompanies(updatedCompanies);
    console.log(`Set company ${companyId} as default`);
  }, [userCompanies]);

  // Inicializar al montar
  useEffect(() => {
    initializeContext();
  }, [initializeContext]);

  const contextValue: CompanyContextState = {
    currentCompany,
    userCompanies,
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

/**
 * Hook para usar el CompanyContext
 * Lanza error si se usa fuera del provider
 */
export const useCompanyContext = (): CompanyContextState => {
  const context = useContext(CompanyContext);

  if (context === undefined) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }

  return context;
};

/**
 * Hook para obtener solo la empresa actual
 * Útil cuando solo necesitas leer la empresa activa
 */
export const useCurrentCompany = (): CompanyDTO | null => {
  const { currentCompany } = useCompanyContext();
  return currentCompany;
};

/**
 * Hook para obtener el ID de la empresa actual
 * Útil para hacer queries filtradas por empresa
 */
export const useCurrentCompanyId = (): number | null => {
  const { currentCompany } = useCompanyContext();
  return currentCompany?.id ?? null;
};
