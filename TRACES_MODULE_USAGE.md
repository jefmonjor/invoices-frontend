# Módulo de Auditoría (Traces) - Guía de Uso

## 📚 Descripción

El módulo de Traces (Auditoría) registra todos los eventos importantes del sistema para trazabilidad, cumplimiento normativo y debugging. Cada acción crítica genera un log de auditoría almacenado en Redis Streams + PostgreSQL.

---

## 🎯 Casos de Uso

1. **Auditoría de seguridad**: Quién hizo qué y cuándo
2. **Cumplimiento normativo**: GDPR, SOX, ISO 27001
3. **Debugging**: Rastrear problemas y errores
4. **Análisis de comportamiento**: Patrones de uso
5. **Timeline de eventos**: Historial de una factura o cliente

---

## 🚀 Ejemplos de Uso

### 1. Ver Timeline de una Factura

```tsx
import { useTracesByInvoice } from '@/features/traces/hooks/useTraces';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

function InvoiceTimeline({ invoiceId }: { invoiceId: number }) {
  const { data: traces, isLoading } = useTracesByInvoice(invoiceId);

  if (isLoading) return <p>Cargando historial...</p>;

  return (
    <div className="timeline">
      <h3>Historial de Eventos</h3>

      {traces?.map((trace) => (
        <div key={trace.id} className="timeline-item">
          <div className="timeline-icon">
            {getEventIcon(trace.eventType)}
          </div>

          <div className="timeline-content">
            <strong>{getEventLabel(trace.eventType)}</strong>
            <p>{trace.description}</p>
            <span className="text-muted">
              {trace.username} • {formatDistanceToNow(new Date(trace.timestamp), {
                addSuffix: true,
                locale: es,
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper para iconos según tipo de evento
function getEventIcon(eventType: string) {
  const icons: Record<string, string> = {
    INVOICE_CREATED: '📄',
    INVOICE_UPDATED: '✏️',
    INVOICE_DELETED: '🗑️',
    INVOICE_PAID: '✅',
    INVOICE_PDF_GENERATED: '📥',
    DOCUMENT_UPLOADED: '📎',
    DOCUMENT_DOWNLOADED: '⬇️',
  };
  return icons[eventType] || '•';
}

// Helper para etiquetas amigables
function getEventLabel(eventType: string) {
  const labels: Record<string, string> = {
    INVOICE_CREATED: 'Factura creada',
    INVOICE_UPDATED: 'Factura actualizada',
    INVOICE_DELETED: 'Factura eliminada',
    INVOICE_PAID: 'Factura pagada',
    INVOICE_PDF_GENERATED: 'PDF generado',
    DOCUMENT_UPLOADED: 'Documento adjuntado',
    DOCUMENT_DOWNLOADED: 'Documento descargado',
  };
  return labels[eventType] || eventType;
}
```

### 2. Panel de Auditoría (Admin)

```tsx
import { useTraces } from '@/features/traces/hooks/useTraces';
import { useState } from 'react';

function AuditLogViewer() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    eventType: undefined,
    userId: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  const { data, isLoading } = useTraces({
    page,
    size: 20,
    sort: 'timestamp,desc',
    ...filters,
  });

  return (
    <div>
      <h2>Logs de Auditoría</h2>

      {/* Filtros */}
      <div className="filters">
        <select onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}>
          <option value="">Todos los eventos</option>
          <option value="INVOICE_CREATED">Facturas creadas</option>
          <option value="INVOICE_PAID">Facturas pagadas</option>
          <option value="USER_LOGIN">Inicios de sesión</option>
        </select>

        <input
          type="date"
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          placeholder="Fecha inicio"
        />

        <input
          type="date"
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          placeholder="Fecha fin"
        />
      </div>

      {/* Tabla de logs */}
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Evento</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Entidad</th>
            <th>Descripción</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {data?.content.map((trace) => (
            <tr key={trace.id}>
              <td>{new Date(trace.timestamp).toLocaleString()}</td>
              <td>{trace.eventType}</td>
              <td>{trace.username}</td>
              <td>{trace.action}</td>
              <td>
                {trace.entityType} #{trace.entityId}
              </td>
              <td>{trace.description}</td>
              <td>{trace.ipAddress}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="pagination">
        <button onClick={() => setPage(p => p - 1)} disabled={data?.first}>
          Anterior
        </button>
        <span>Página {(data?.number || 0) + 1} de {data?.totalPages}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={data?.last}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
```

### 3. Actividad Reciente (Dashboard)

```tsx
import { useRecentTraces } from '@/features/traces/hooks/useTraces';

function RecentActivityWidget() {
  const { data } = useRecentTraces(5);

  return (
    <div className="widget">
      <h4>Actividad Reciente</h4>

      <ul className="activity-list">
        {data?.content.map((trace) => (
          <li key={trace.id}>
            <strong>{trace.username}</strong>
            <span>{trace.description}</span>
            <time>{formatDistanceToNow(new Date(trace.timestamp), { addSuffix: true })}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. Auditoría de Usuario Específico

```tsx
import { useTracesByUser } from '@/features/traces/hooks/useTraces';

function UserActivityLog({ userId }: { userId: number }) {
  const { data: traces, isLoading } = useTracesByUser(userId);

  return (
    <div>
      <h3>Actividad del Usuario</h3>

      {traces?.map((trace) => (
        <div key={trace.id}>
          <p>
            {new Date(trace.timestamp).toLocaleString()} - {trace.description}
          </p>
        </div>
      ))}
    </div>
  );
}
```

### 5. Filtrar por Tipo de Evento

```tsx
import { useTracesByEventType } from '@/features/traces/hooks/useTraces';

function LoginHistory() {
  const { data: logins } = useTracesByEventType('USER_LOGIN');

  return (
    <div>
      <h3>Historial de Inicios de Sesión</h3>

      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Fecha/Hora</th>
            <th>IP</th>
            <th>Navegador</th>
          </tr>
        </thead>
        <tbody>
          {logins?.map((login) => (
            <tr key={login.id}>
              <td>{login.username}</td>
              <td>{new Date(login.timestamp).toLocaleString()}</td>
              <td>{login.ipAddress}</td>
              <td>{login.userAgent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 🔧 API Reference

### Hooks Disponibles

#### `useTraces(params?: AuditLogListParams)`

Lista logs con paginación y filtros.

```typescript
const { data, isLoading } = useTraces({
  page: 0,
  size: 20,
  sort: 'timestamp,desc',
  eventType: 'INVOICE_CREATED',
  startDate: '2025-11-01',
  endDate: '2025-11-30',
});
// data: PagedResponse<AuditLog>
```

#### `useTrace(id: number)`

Obtiene un log específico.

```typescript
const { data } = useTrace(123);
// data: AuditLog
```

#### `useTracesByInvoice(invoiceId: number)`

Logs de una factura específica.

```typescript
const { data } = useTracesByInvoice(456);
// data: AuditLog[]
```

#### `useTracesByClient(clientId: number)`

Logs de un cliente específico.

```typescript
const { data } = useTracesByClient(789);
// data: AuditLog[]
```

#### `useTracesByUser(userId: number)`

Logs de un usuario específico.

```typescript
const { data } = useTracesByUser(10);
// data: AuditLog[]
```

#### `useTracesByEventType(eventType: EventType)`

Logs de un tipo de evento.

```typescript
const { data } = useTracesByEventType('USER_LOGIN');
// data: AuditLog[]
```

#### `useRecentTraces(limit?: number)`

Actividad reciente (auto-refresh cada minuto).

```typescript
const { data } = useRecentTraces(10);
// data: PagedResponse<AuditLog>
```

---

## 📋 Tipos TypeScript

### `AuditLog`

```typescript
interface AuditLog {
  id: number;
  eventType: EventType;
  userId: number;
  username: string;
  userEmail?: string;
  entityType: EntityType;
  entityId: number;
  action: ActionType;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  createdAt: string;
}
```

### `EventType`

```typescript
type EventType =
  | 'INVOICE_CREATED'
  | 'INVOICE_UPDATED'
  | 'INVOICE_DELETED'
  | 'INVOICE_PAID'
  | 'INVOICE_CANCELLED'
  | 'INVOICE_PDF_GENERATED'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_DELETED'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_PASSWORD_CHANGED'
  | 'CLIENT_CREATED'
  | 'CLIENT_UPDATED'
  | 'CLIENT_DELETED'
  | 'COMPANY_CREATED'
  | 'COMPANY_UPDATED'
  | 'COMPANY_DELETED';
```

### `AuditLogListParams`

```typescript
interface AuditLogListParams {
  page?: number;
  size?: number;
  sort?: string;
  invoiceId?: number;
  clientId?: number;
  userId?: number;
  eventType?: EventType;
  entityType?: EntityType;
  action?: ActionType;
  startDate?: string;
  endDate?: string;
  search?: string;
}
```

---

## ⚠️ Consideraciones

### Privacidad y GDPR

- ⚠️ Los logs pueden contener datos personales
- ✅ Implementar retención limitada (ej: 90 días)
- ✅ Anonimizar logs antiguos
- ✅ Permitir exportación de logs de un usuario (derecho de portabilidad)
- ✅ Permitir eliminación de logs de un usuario (derecho al olvido)

### Performance

- ✅ Índices en PostgreSQL para `userId`, `invoiceId`, `eventType`, `timestamp`
- ✅ Particionamiento de tabla por fecha
- ✅ Cache de 2 minutos para queries frecuentes
- ✅ Paginación obligatoria para listados grandes
- ✅ Redis Streams para eventos en tiempo real

### Seguridad

- 🔒 Solo usuarios con rol `ADMIN` pueden ver todos los logs
- 🔒 Usuarios normales solo ven sus propios logs
- 🔒 No exponer IPs ni User-Agents a usuarios no admin
- 🔒 Logs de auditoría son **inmutables** (no se pueden modificar)

---

## 🧪 Testing

### Test de Hook

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useTracesByInvoice } from '@/features/traces/hooks/useTraces';

describe('Traces Module', () => {
  it('should fetch traces by invoice', async () => {
    const { result } = renderHook(() => useTracesByInvoice(1));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeInstanceOf(Array);
  });
});
```

---

## 🔗 Backend Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/traces` | Listar logs (paginado) |
| GET | `/api/traces/{id}` | Obtener log específico |
| GET | `/api/traces?invoiceId=X` | Logs de una factura |
| GET | `/api/traces?clientId=Y` | Logs de un cliente |
| GET | `/api/traces?eventType=Z` | Logs por tipo |
| GET | `/api/traces?userId=U` | Logs de un usuario |

---

## 📊 Métricas y Alertas

### Eventos Críticos a Monitorear

1. **Múltiples logins fallidos** → Posible ataque de fuerza bruta
2. **Eliminación masiva de facturas** → Posible comportamiento malicioso
3. **Cambios de contraseña frecuentes** → Cuenta comprometida
4. **Acceso desde IPs inusuales** → Acceso no autorizado

### Dashboard Sugerido

```tsx
function SecurityDashboard() {
  const { data: logins } = useTracesByEventType('USER_LOGIN');
  const { data: deletions } = useTracesByEventType('INVOICE_DELETED');

  return (
    <div>
      <h2>Dashboard de Seguridad</h2>

      <div className="stats">
        <div className="stat-card">
          <h4>Logins Hoy</h4>
          <p>{logins?.length || 0}</p>
        </div>

        <div className="stat-card">
          <h4>Eliminaciones Hoy</h4>
          <p>{deletions?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Integración con Backend

El backend registra automáticamente eventos cuando ocurren acciones críticas. **No necesitas llamar manualmente** a la API de traces para crear logs, solo para **leer** logs existentes.

### Eventos Automáticos

```java
// Backend (ejemplo)
@Service
public class InvoiceService {
  @Autowired
  private AuditLogService auditService;

  public Invoice createInvoice(CreateInvoiceRequest request) {
    Invoice invoice = // ... crear factura

    // Auto-registro de evento
    auditService.log(AuditLog.builder()
      .eventType("INVOICE_CREATED")
      .userId(getCurrentUser().getId())
      .entityType("Invoice")
      .entityId(invoice.getId())
      .description("Factura " + invoice.getInvoiceNumber() + " creada")
      .build());

    return invoice;
  }
}
```

---

**✅ Módulo completamente funcional y listo para usar**
