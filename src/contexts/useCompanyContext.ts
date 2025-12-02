import { useContext } from 'react';
import { CompanyContext, type CompanyContextState } from './CompanyContextDefinition';
import type { Company } from '@/types/company.types';

/**
 * Hook para usar el CompanyContext
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
 */
export const useCurrentCompany = (): Company | null => {
  const { currentCompany } = useCompanyContext();
  return currentCompany;
};

/**
 * Hook para obtener el ID de la empresa actual
 */
export const useCurrentCompanyId = (): number | null => {
  const { currentCompany } = useCompanyContext();
  return currentCompany?.id ?? null;
};
