```typescript
// Example: How to use useUserRole in InvoicesListPage or InvoiceTable

import { useUserRole } from '@/hooks/useUserRole';
import { IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

export const InvoiceActionsExample = ({ invoiceId }: { invoiceId: number }) => {
  const { isAdmin } = useUserRole();

  return (
    <>
      {/* Edit button - only visible/enabled for ADMIN */}
      <IconButton
        disabled={!isAdmin}
        onClick={() => handleEdit(invoiceId)}
        title={!isAdmin ? 'Solo administradores pueden editar' : 'Editar factura'}
      >
        <Edit />
      </IconButton>

      {/* Delete button - only visible/enabled for ADMIN */}
      <IconButton
        disabled={!isAdmin}
        onClick={() => handleDelete(invoiceId)}
        title={!isAdmin ? 'Solo administradores pueden eliminar' : 'Eliminar factura'}
        color="error"
      >
        <Delete />
      </IconButton>
    </>
  );
};

// To integrate into existing invoice pages:
// 1. Import useUserRole hook
// 2. Get isAdmin from the hook
// 3. Add disabled={!isAdmin} to edit/delete buttons
// 4. Optionally hide buttons completely: {isAdmin && <IconButton ...>}
```

**File Locations to Update:**
- `/Users/Jefferson/Documents/proyecto/invoices-frontend/src/features/invoices/pages/InvoicesListPage.tsx`
- `/Users/Jefferson/Documents/proyecto/invoices-frontend/src/features/invoices/components/InvoiceTable.tsx`

**Pattern to Follow:**
```typescript
const { isAdmin } = useUserRole();

// Option 1: Disable button
<IconButton disabled={!isAdmin}>

// Option 2: Hide button completely
{isAdmin && <IconButton>}
```
