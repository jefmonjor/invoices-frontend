# Análisis de Compatibilidad API - Backend vs Frontend

**Fecha**: 2025-11-18
**Backend**: https://github.com/jefmonjor/invoices-back
**Frontend**: /home/user/invoices-frontend

---

## 📊 Resumen Ejecutivo

| Módulo | Backend Disponible | Frontend Implementado | Estado |
|--------|-------------------|---------------------|---------|
| **Auth** | ✅ | ✅ | 🟢 Completo |
| **Users** | ✅ | ✅ | 🟢 Completo |
| **Invoices** | ✅ | ✅ | 🟡 Casi completo |
| **Documents** | ✅ | ❌ | 🔴 No implementado |
| **Traces** | ✅ | ❌ | 🔴 No implementado |
| **Actuator** | ✅ | ❌ | 🟡 No crítico |

**Cobertura Total**: 14/28 endpoints (50%)

---

## 1️⃣ User & Auth - ✅ COMPATIBLE (100%)

### Backend Endpoints
```
POST   /api/auth/register          # Registrar usuario
POST   /api/auth/login             # Login (obtener JWT)
GET    /api/users                  # Listar usuarios
GET    /api/users/{id}             # Obtener usuario
PUT    /api/users/{id}             # Actualizar usuario
DELETE /api/users/{id}             # Eliminar usuario
```

### Frontend Implementación
| Endpoint | Archivo | Estado |
|----------|---------|--------|
| POST /api/auth/register | `src/api/auth.api.ts:13` | ✅ Implementado |
| POST /api/auth/login | `src/api/auth.api.ts:6` | ✅ Implementado |
| GET /api/users | `src/api/users.api.ts:25` | ✅ Implementado |
| GET /api/users/{id} | `src/api/users.api.ts:14` | ✅ Implementado |
| PUT /api/users/{id} | `src/api/users.api.ts:18` | ✅ Implementado |
| DELETE /api/users/{id} | `src/api/users.api.ts:22` | ✅ Implementado |

### Características Adicionales Frontend
- ✅ GET /users/profile - Perfil del usuario actual
- ✅ PUT /users/profile - Actualizar perfil
- ✅ Paginación con Spring Boot PagedResponse
- ✅ Manejo automático de JWT Bearer token
- ✅ Interceptor para 401 Unauthorized
- ✅ Validaciones con Zod

### Tipos TypeScript
```typescript
// src/types/auth.types.ts
interface LoginRequest { username: string; password: string; }
interface LoginResponse { token: string; type: string; expiresIn: number; user: User; }
interface RegisterRequest { email: string; password: string; firstName: string; lastName: string; }

// src/types/user.types.ts
interface User { id: number; email: string; firstName: string; lastName: string; roles: string[]; enabled: boolean; }
```

### Hooks React Query
```typescript
// src/features/users/hooks/useUsers.ts
useUsers(params)       // Lista paginada
useUser(id)           // Usuario individual
useCreateUser()       // Crear usuario
useUpdateUser()       // Actualizar usuario
useDeleteUser()       // Eliminar usuario
```

**✅ CONCLUSIÓN**: Módulo completamente funcional. No se requieren cambios.

---

## 2️⃣ Invoices - 🟡 CASI COMPLETO (95%)

### Backend Endpoints
```
GET    /api/invoices               # Listar facturas
POST   /api/invoices               # Crear factura
GET    /api/invoices/{id}          # Obtener factura
PUT    /api/invoices/{id}          # Actualizar factura
DELETE /api/invoices/{id}          # Eliminar factura
GET    /api/invoices/{id}/pdf      # Generar PDF
```

### Frontend Implementación
| Endpoint | Archivo | Estado | Notas |
|----------|---------|--------|-------|
| GET /api/invoices | `src/api/invoices.api.ts:27` | ✅ | Con paginación |
| POST /api/invoices | `src/api/invoices.api.ts:14` | ✅ | Completo |
| GET /api/invoices/{id} | `src/api/invoices.api.ts:18` | ✅ | Completo |
| PUT /api/invoices/{id} | `src/api/invoices.api.ts:22` | ✅ | Completo |
| DELETE /api/invoices/{id} | `src/api/invoices.api.ts:26` | ✅ | Completo |
| GET /api/invoices/{id}/pdf | - | ⚠️ | Implementado como POST |

### ⚠️ Discrepancia Detectada

**Frontend actual**:
```typescript
// src/api/invoices.api.ts:30
POST /api/invoices/:id/generate-pdf
responseType: 'blob'
```

**Backend esperado**:
```
GET /api/invoices/{id}/pdf
```

**Recomendación**: Verificar si el backend usa GET o POST para la generación de PDF. Usualmente:
- **GET** si solo genera y descarga
- **POST** si acepta parámetros adicionales (formato, idioma, etc.)

### Tipos TypeScript
```typescript
// src/types/invoice.types.ts (128 líneas)
interface Invoice {
  id: number;
  invoiceNumber: string;
  companyId: number;
  clientId: number;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total?: number;
}

interface CreateInvoiceRequest { /* ... */ }
interface PagedResponse<T> { /* Spring Boot compatible */ }
```

### Hooks React Query
```typescript
// src/features/invoices/hooks/useInvoices.ts
useInvoices(params)      // Lista paginada
useInvoice(id)          // Factura individual
useCreateInvoice()      // Crear factura
useUpdateInvoice()      // Actualizar factura
useDeleteInvoice()      // Eliminar factura
useGenerateInvoicePDF() // Generar PDF (verifica método HTTP)
```

**🟡 CONCLUSIÓN**: Módulo casi completo. Verificar método HTTP para PDF.

---

## 3️⃣ Documents - 🔴 NO IMPLEMENTADO (0%)

### Backend Endpoints (Disponibles)
```
POST   /api/documents              # Subir documento PDF
GET    /api/documents/{id}         # Obtener metadata
GET    /api/documents/{id}/download # Descargar PDF
GET    /api/documents?invoiceId=X  # Listar por factura
DELETE /api/documents/{id}          # Eliminar documento
```

### Frontend Implementación
| Endpoint | Estado |
|----------|--------|
| POST /api/documents | ❌ No existe |
| GET /api/documents/{id} | ❌ No existe |
| GET /api/documents/{id}/download | ❌ No existe |
| GET /api/documents?invoiceId=X | ❌ No existe |
| DELETE /api/documents/{id} | ❌ No existe |

### ❌ Impacto

El módulo de documentos NO está implementado en el frontend. Esto significa:

1. **No se pueden subir PDFs** a las facturas
2. **No se pueden listar documentos** adjuntos a una factura
3. **No se pueden descargar** documentos previamente subidos
4. **No se pueden eliminar** documentos

Este módulo es **crítico** si el sistema requiere:
- Subir contratos firmados
- Adjuntar recibos de pago
- Almacenar documentación adicional

### 🛠️ Acciones Requeridas

**Crear archivo**: `src/api/documents.api.ts`

```typescript
import { apiClient } from './client';

export const documentsApi = {
  // Subir documento
  upload: async (file: File, invoiceId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoiceId', invoiceId.toString());

    const response = await apiClient.post('/api/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Obtener metadata
  getById: async (id: number) => {
    const response = await apiClient.get(`/api/documents/${id}`);
    return response.data;
  },

  // Descargar PDF
  download: async (id: number) => {
    const response = await apiClient.get(`/api/documents/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Listar por factura
  listByInvoice: async (invoiceId: number) => {
    const response = await apiClient.get('/api/documents', {
      params: { invoiceId }
    });
    return response.data;
  },

  // Eliminar
  delete: async (id: number) => {
    await apiClient.delete(`/api/documents/${id}`);
  }
};
```

**Crear archivo**: `src/types/document.types.ts`

```typescript
export interface Document {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageUrl: string;
  invoiceId: number;
  uploadedBy: number;
  createdAt: string;
}

export interface UploadDocumentRequest {
  file: File;
  invoiceId: number;
}
```

**Crear archivo**: `src/features/documents/hooks/useDocuments.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/api/documents.api';
import { toast } from 'react-toastify';

export const documentKeys = {
  all: ['documents'] as const,
  byInvoice: (invoiceId: number) => [...documentKeys.all, 'invoice', invoiceId] as const,
  detail: (id: number) => [...documentKeys.all, 'detail', id] as const,
};

export const useDocumentsByInvoice = (invoiceId: number) => {
  return useQuery({
    queryKey: documentKeys.byInvoice(invoiceId),
    queryFn: () => documentsApi.listByInvoice(invoiceId),
    enabled: !!invoiceId && invoiceId > 0,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, invoiceId }: { file: File; invoiceId: number }) =>
      documentsApi.upload(file, invoiceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.byInvoice(variables.invoiceId)
      });
      toast.success('Documento subido correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al subir documento');
    },
  });
};

export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: (id: number) => documentsApi.download(id),
    onSuccess: (blob, id) => {
      // Crear URL temporal para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al descargar');
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Documento eliminado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });
};
```

**🔴 PRIORIDAD ALTA**: Implementar este módulo si se requiere gestión de documentos.

---

## 4️⃣ Traces (Audit Logs) - 🔴 NO IMPLEMENTADO (0%)

### Backend Endpoints (Disponibles)
```
GET    /api/traces                 # Listar logs (paginado)
GET    /api/traces/{id}            # Obtener log
GET    /api/traces?invoiceId=X     # Logs por factura
GET    /api/traces?clientId=Y      # Logs por cliente
GET    /api/traces?eventType=Z     # Logs por tipo
```

### Frontend Implementación
| Endpoint | Estado |
|----------|--------|
| GET /api/traces | ❌ No existe |
| GET /api/traces/{id} | ❌ No existe |
| GET /api/traces?invoiceId=X | ❌ No existe |
| GET /api/traces?clientId=Y | ❌ No existe |
| GET /api/traces?eventType=Z | ❌ No existe |

### ❌ Impacto

El módulo de auditoría NO está implementado en el frontend. Esto significa:

1. **No se pueden ver logs de auditoría** de las operaciones
2. **No se puede rastrear** quién hizo qué cambios
3. **No hay trazabilidad** de eventos críticos
4. **Dificulta cumplimiento normativo** (GDPR, SOX, etc.)

Este módulo es **muy importante** para:
- Seguridad y cumplimiento normativo
- Debugging de problemas
- Análisis de comportamiento de usuarios
- Auditorías internas/externas

### 🛠️ Acciones Requeridas

**Crear archivo**: `src/api/traces.api.ts`

```typescript
import { apiClient } from './client';
import type { AuditLog, AuditLogListParams, PagedResponse } from '@/types/trace.types';

export const tracesApi = {
  // Listar logs con filtros y paginación
  list: async (params?: AuditLogListParams): Promise<PagedResponse<AuditLog>> => {
    const response = await apiClient.get('/api/traces', { params });
    return response.data;
  },

  // Obtener log específico
  getById: async (id: number): Promise<AuditLog> => {
    const response = await apiClient.get(`/api/traces/${id}`);
    return response.data;
  },

  // Listar por factura
  listByInvoice: async (invoiceId: number): Promise<AuditLog[]> => {
    const response = await apiClient.get('/api/traces', {
      params: { invoiceId }
    });
    return response.data;
  },

  // Listar por cliente
  listByClient: async (clientId: number): Promise<AuditLog[]> => {
    const response = await apiClient.get('/api/traces', {
      params: { clientId }
    });
    return response.data;
  },

  // Listar por tipo de evento
  listByEventType: async (eventType: string): Promise<AuditLog[]> => {
    const response = await apiClient.get('/api/traces', {
      params: { eventType }
    });
    return response.data;
  }
};
```

**Crear archivo**: `src/types/trace.types.ts`

```typescript
export type EventType =
  | 'INVOICE_CREATED'
  | 'INVOICE_UPDATED'
  | 'INVOICE_DELETED'
  | 'INVOICE_PAID'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_DOWNLOADED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATED'
  | 'USER_UPDATED';

export interface AuditLog {
  id: number;
  eventType: EventType;
  userId: number;
  username: string;
  entityType: string;        // "Invoice", "User", "Document", etc.
  entityId: number;
  action: string;            // "CREATE", "UPDATE", "DELETE", "READ"
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;  // JSON adicional
  timestamp: string;         // ISO-8601
}

export interface AuditLogListParams {
  page?: number;
  size?: number;
  sort?: string;
  invoiceId?: number;
  clientId?: number;
  eventType?: EventType;
  userId?: number;
  startDate?: string;
  endDate?: string;
}
```

**Crear archivo**: `src/features/traces/hooks/useTraces.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { tracesApi } from '@/api/traces.api';
import type { AuditLogListParams } from '@/types/trace.types';

export const traceKeys = {
  all: ['traces'] as const,
  lists: () => [...traceKeys.all, 'list'] as const,
  list: (params?: AuditLogListParams) => [...traceKeys.lists(), params] as const,
  detail: (id: number) => [...traceKeys.all, 'detail', id] as const,
  byInvoice: (invoiceId: number) => [...traceKeys.all, 'invoice', invoiceId] as const,
  byClient: (clientId: number) => [...traceKeys.all, 'client', clientId] as const,
  byEventType: (eventType: string) => [...traceKeys.all, 'event', eventType] as const,
};

export const useTraces = (params?: AuditLogListParams) => {
  return useQuery({
    queryKey: traceKeys.list(params),
    queryFn: () => tracesApi.list(params),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
};

export const useTrace = (id: number) => {
  return useQuery({
    queryKey: traceKeys.detail(id),
    queryFn: () => tracesApi.getById(id),
    enabled: !!id && id > 0,
  });
};

export const useTracesByInvoice = (invoiceId: number) => {
  return useQuery({
    queryKey: traceKeys.byInvoice(invoiceId),
    queryFn: () => tracesApi.listByInvoice(invoiceId),
    enabled: !!invoiceId && invoiceId > 0,
  });
};

export const useTracesByClient = (clientId: number) => {
  return useQuery({
    queryKey: traceKeys.byClient(clientId),
    queryFn: () => tracesApi.listByClient(clientId),
    enabled: !!clientId && clientId > 0,
  });
};

export const useTracesByEventType = (eventType: string) => {
  return useQuery({
    queryKey: traceKeys.byEventType(eventType),
    queryFn: () => tracesApi.listByEventType(eventType),
    enabled: !!eventType,
  });
};
```

**🟡 PRIORIDAD MEDIA**: Implementar para administradores y auditoría.

---

## 5️⃣ Actuator (Monitoreo) - 🟡 NO CRÍTICO

### Backend Endpoints (Disponibles)
```
GET    /actuator/health            # Health check
GET    /actuator/info              # Información de la app
```

### Frontend Implementación
| Endpoint | Estado | Uso Típico |
|----------|--------|------------|
| GET /actuator/health | ❌ No existe | Monitoreo de infraestructura |
| GET /actuator/info | ❌ No existe | Panel de administración |

### 🤔 Análisis

Los endpoints de Actuator **generalmente NO se consumen desde el frontend** porque:

1. Son endpoints de **monitoreo de infraestructura**
2. Usados por herramientas como **Prometheus, Datadog, New Relic**
3. Accesibles desde **herramientas de DevOps**

**EXCEPCIÓN**: Si deseas mostrar un "status page" público o panel de administración.

### 🛠️ Acciones Requeridas (Opcional)

**Solo si necesitas un panel de estado en el frontend**:

```typescript
// src/api/health.api.ts
export const healthApi = {
  check: async () => {
    const response = await apiClient.get('/actuator/health');
    return response.data;
  },

  info: async () => {
    const response = await apiClient.get('/actuator/info');
    return response.data;
  }
};
```

**🟢 PRIORIDAD BAJA**: Solo implementar si se requiere panel de estado público.

---

## 📋 Plan de Acción Recomendado

### FASE 1: Verificación (Inmediato)
- [ ] Verificar método HTTP de PDF generation (GET vs POST)
- [ ] Probar endpoints existentes contra el backend en desarrollo
- [ ] Confirmar estructura de respuestas

### FASE 2: Implementación Critical (Sprint 1)
- [ ] Crear módulo de Documents completo
  - [ ] `src/api/documents.api.ts`
  - [ ] `src/types/document.types.ts`
  - [ ] `src/features/documents/hooks/useDocuments.ts`
  - [ ] Componente de subida de archivos
  - [ ] Lista de documentos en detalle de factura

### FASE 3: Implementación Important (Sprint 2)
- [ ] Crear módulo de Traces completo
  - [ ] `src/api/traces.api.ts`
  - [ ] `src/types/trace.types.ts`
  - [ ] `src/features/traces/hooks/useTraces.ts`
  - [ ] Página de auditoría para administradores
  - [ ] Timeline de eventos en detalle de factura

### FASE 4: Nice to Have (Sprint 3)
- [ ] Panel de estado con Actuator endpoints
- [ ] Métricas en tiempo real
- [ ] Dashboard de salud del sistema

---

## 🧪 Testing Sugerido

### 1. Tests de Integración
```typescript
describe('Documents API Integration', () => {
  it('should upload a document', async () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const result = await documentsApi.upload(file, 1);
    expect(result.id).toBeDefined();
  });
});
```

### 2. Tests de Hooks
```typescript
describe('useDocuments hook', () => {
  it('should fetch documents by invoice', async () => {
    const { result } = renderHook(() => useDocumentsByInvoice(1));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

### 3. Tests E2E
```typescript
describe('Invoice with Documents', () => {
  it('should allow uploading documents to invoice', () => {
    cy.visit('/invoices/1');
    cy.get('[data-testid="upload-document"]').click();
    cy.get('input[type="file"]').attachFile('test.pdf');
    cy.contains('Documento subido correctamente').should('be.visible');
  });
});
```

---

## 📊 Métricas de Cobertura

| Métrica | Actual | Target | Brecha |
|---------|--------|--------|--------|
| Endpoints implementados | 14/28 | 28/28 | -14 |
| Cobertura de funcionalidad crítica | 60% | 95% | -35% |
| Módulos completos | 2/5 | 5/5 | -3 |

---

## 🎯 Conclusiones

### ✅ Fortalezas
1. **Auth & Users**: Completamente funcional con buenas prácticas
2. **Invoices**: Casi completo, solo verificar método HTTP de PDF
3. **Arquitectura sólida**: Axios + React Query + TypeScript + Zustand
4. **Compatibilidad Spring Boot**: Manejo correcto de PagedResponse
5. **Seguridad**: JWT automático con interceptores

### ❌ Brechas Críticas
1. **Módulo Documents**: Completamente ausente, crítico para adjuntos
2. **Módulo Traces**: Ausente, importante para auditoría
3. **Sin trazabilidad**: No se puede saber quién hizo qué

### 🎯 Recomendaciones Finales

1. **Prioridad 1**: Implementar módulo Documents (3-5 días)
2. **Prioridad 2**: Implementar módulo Traces (2-3 días)
3. **Prioridad 3**: Verificar método HTTP de PDF (30 minutos)
4. **Opcional**: Panel de estado con Actuator (1 día)

**Tiempo estimado total**: 1-2 sprints (2-4 semanas)

---

## 🔗 Referencias

- **Backend Repository**: https://github.com/jefmonjor/invoices-back
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/v3/api-docs
- **Frontend Directory**: /home/user/invoices-frontend

---

**Generado por**: Claude Code Agent
**Versión**: 1.0.0
