import { useAuthStore } from '@/store/authStore';
import { useCompanyContext } from '@/contexts/CompanyContext';

/**
 * Interface defining all available permissions in the application
 */
export interface Permissions {
    // Invoice permissions
    canViewInvoices: boolean;
    canCreateInvoice: boolean;
    canEditInvoice: boolean;
    canDeleteInvoice: boolean;

    // Client permissions
    canViewClients: boolean;
    canManageClients: boolean; // Create/Edit
    canDeleteClients: boolean;

    // Company permissions
    canEditCompany: boolean;
    canCreateCompany: boolean;
    canManageUsers: boolean;

    // Metrics permissions
    canViewMetrics: boolean;
}

/**
 * Custom hook for checking user permissions based on their role.
 * 
 * Permissions are determined by:
 * - User's global role (ADMIN/USER)
 * - User's role within the current company context
 * 
 * Permission Matrix:
 * ┌─────────────────────┬────────┬────────┐
 * │ Action              │ ADMIN  │ USER   │
 * ├─────────────────────┼────────┼────────┤
 * │ View Invoices       │   ✓    │   ✓    │
 * │ Create Invoice      │   ✓    │   ✓    │
 * │ Edit Invoice        │   ✓    │   ✗    │
 * │ Delete Invoice      │   ✓    │   ✗    │
 * │ Manage Clients      │   ✓    │   ✓    │
 * │ Delete Clients      │   ✓    │   ✗    │
 * │ Edit Company        │   ✓    │   ✗    │
 * │ Create Company      │   ✓    │   ✗    │
 * │ Manage Users        │   ✓    │   ✗    │
 * │ View Metrics        │   ✓    │   ✗    │
 * └─────────────────────┴────────┴────────┘
 * 
 * @returns Permissions object with boolean flags
 * 
 * @example
 * const { canDeleteInvoice, canEditCompany } = usePermissions();
 * 
 * // In JSX:
 * {canDeleteInvoice && <DeleteButton onClick={handleDelete} />}
 */
export const usePermissions = (): Permissions => {
    const { user } = useAuthStore();
    const { currentCompany, userCompanies } = useCompanyContext();

    // Check if user has ADMIN role globally
    const isGlobalAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

    // Get user role in the current company
    const currentUserCompany = userCompanies.find(uc => uc.id === currentCompany?.id);
    const isCompanyAdmin = currentUserCompany?.role === 'ADMIN';

    // For most operations, either global ADMIN or company-level ADMIN suffices
    const isAdmin = isGlobalAdmin || isCompanyAdmin;

    return {
        // Invoices - All users can view and create, only ADMIN can edit/delete
        canViewInvoices: true,
        canCreateInvoice: true,
        canEditInvoice: isAdmin,
        canDeleteInvoice: isAdmin,

        // Clients - All users can view and manage, only ADMIN can delete
        canViewClients: true,
        canManageClients: true, // Create and edit allowed for all
        canDeleteClients: isAdmin,

        // Company - Only ADMIN can manage
        canEditCompany: isAdmin,
        canCreateCompany: isAdmin,
        canManageUsers: isAdmin,

        // Metrics - Only ADMIN can view
        canViewMetrics: isAdmin,
    };
};
