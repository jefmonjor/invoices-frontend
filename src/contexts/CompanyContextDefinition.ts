import { createContext } from 'react';
import type { Company } from '@/types/company.types';

/**
 * Company Context State
 */
export interface CompanyContextState {
  currentCompany: Company | null;
  userCompanies: Company[];
  userRole: 'ADMIN' | 'USER' | null; // Rol en la empresa actual
  isLoading: boolean;
  error: string | null;

  // Methods
  switchCompany: (companyId: number) => Promise<void>;
  refreshCompanies: () => Promise<void>;
  setDefaultCompany: (companyId: number) => Promise<void>;
}

export const CompanyContext = createContext<CompanyContextState | undefined>(undefined);
