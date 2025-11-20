# 🎨 Invoices Frontend - Sistema de Gestión de Facturas

Frontend moderno construido con **React 18 + TypeScript + Vite**, diseñado para consumir el backend de gestión de facturas (Spring Boot 3 + Java 21).

## 📦 Stack Tecnológico

- **React 18** + **TypeScript 5** + **Vite 5**
- **Material-UI** - Component library
- **Zustand** - Estado global persistido
- **React Query** - Server state management
- **React Router v6** - Routing con protección
- **Axios** - HTTP client con JWT interceptors
- **React Hook Form** + **Zod** - Validaciones
- **currency.js** - Manejo preciso de BigDecimal

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# Abrir: http://localhost:3000
```

**Prerequisitos:** Backend corriendo en http://localhost:8080

### 👤 Crear Usuario de Prueba

Para probar la aplicación o ejecutar tests E2E, necesitas crear un usuario:

**Opción 1: Registro desde el frontend** (Recomendado)
1. Ve a: http://localhost:3000/register o https://invoices-frontend-vert.vercel.app/register
2. Completa el formulario con un email válido (ej: `admin@invoices.com`)
3. Usa las credenciales para iniciar sesión

**Opción 2: Desde la página de login**
- En la parte inferior verás "¿No tienes cuenta? **Regístrate aquí**"
- Haz clic y completa el formulario

📘 **Guía detallada**: Ver [CREAR_USUARIO_TEST.md](./CREAR_USUARIO_TEST.md)

## 📁 Estructura

```
src/
├── api/              # API Clients (Axios)
├── features/         # Features por dominio
│   ├── auth/         # Login/Register
│   ├── invoices/     # Gestión de facturas
│   └── dashboard/    # Dashboard
├── store/            # Zustand stores
├── utils/            # Utilidades Spring Boot 3
│   ├── spring-errors.ts   # Bean Validation
│   ├── formatters.ts      # BigDecimal, fechas
│   ├── validators.ts      # Zod schemas
│   └── constants.ts       # Enums de Java
└── types/            # TypeScript types
```

## 🔐 Autenticación

```typescript
// Login automático con JWT
const { setAuth } = useAuthStore();
const response = await authApi.login({ username, password });
setAuth(response.token, response.user);

// Rutas protegidas
<Route element={<PrivateRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
```

## 🔌 Integración Spring Boot 3

### BigDecimal → number
```typescript
// ✅ Solo visualización
formatCurrency(invoice.totalAmount); // "$1,500.00"

// ❌ NO hacer cálculos complejos
```

### Fechas ISO-8601
```typescript
// Enviar
toISODate(new Date(), true); // "2025-11-17"

// Visualizar
formatDate(invoice.createdAt); // "17/11/2025"
```

### Errores Bean Validation
```typescript
catch (error) {
  setSpringErrors(error, setError); // Mapeo automático
}
```

## 📡 API Usage

```typescript
// Listar facturas con paginación
const { data } = await invoicesApi.list({
  page: 0,
  size: 20,
  status: 'PENDING'
});

// Crear factura
const invoice = await invoicesApi.create({
  invoiceNumber: 'INV-001',
  issueDate: toISODate(new Date(), true),
  items: [...]
});

// Descargar PDF
await invoicesApi.downloadPDF(invoice.id, invoice.invoiceNumber);
```

## 🛠️ Scripts

```bash
npm run dev       # Servidor desarrollo (puerto 3000)
npm run build     # Build para producción
npm run preview   # Preview del build
npm run lint      # ESLint
```

## ✅ Features Implementadas

- ✅ Autenticación JWT
- ✅ Rutas protegidas
- ✅ Dashboard básico
- ✅ Integración Spring Boot 3
- ✅ Manejo errores Bean Validation
- ✅ Formateo BigDecimal/fechas
- ✅ React Query cache
- ✅ Material-UI tema personalizado

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Ejecutar tests unitarios
npm test

# Modo watch
npm test -- --watch

# Coverage
npm run test:coverage
```

**Estado**: ✅ 24/24 tests passing

### E2E Tests (Playwright)

```bash
# 1. Configurar credenciales (primera vez)
cp .env.e2e.example .env.e2e.local
# Editar .env.e2e.local con tus credenciales del backend

# 2. Instalar navegadores
npx playwright install --with-deps

# 3. Ejecutar E2E tests
npm run test:e2e

# Con UI
npm run test:e2e:ui
```

**⚠️ Importante**: Los tests E2E requieren:
- Backend corriendo y accesible
- Credenciales válidas con **email** (no username)
- Ver [E2E_TESTS.md](./E2E_TESTS.md) para configuración detallada

## 🚀 Próximos Pasos

- [x] Lista de facturas con tabla
- [x] Crear/editar factura (wizard)
- [x] Generar PDF
- [x] Módulo de usuarios (Admin)
- [x] Dashboard con gráficas
- [x] Tests (Vitest + Playwright)

## 📚 Documentación

- **Backend:** http://localhost:8080/swagger-ui.html
- **Arquitectura:** Ver FRONTEND_ARCHITECTURE.md en repo backend
- **MUI:** https://mui.com/
- **React Query:** https://tanstack.com/query/latest

---

**¡100% compatible con Spring Boot 3 + Java 21!** 🚀
