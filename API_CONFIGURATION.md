# Configuración de API - Frontend

## ⚠️ IMPORTANTE: Configuración de URL Base

El frontend está configurado para que **`VITE_API_BASE_URL` incluya el prefijo `/api`**.

### Configuración Correcta

#### Desarrollo Local
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

#### Producción (Vercel)
```bash
VITE_API_BASE_URL=https://invoices-back-production.up.railway.app/api
```

### ❌ Configuración Incorrecta

**NO HAGAS ESTO:**
```bash
# ❌ Sin /api al final
VITE_API_BASE_URL=http://localhost:8080

# ❌ Sin /api al final en producción
VITE_API_BASE_URL=https://invoices-back-production.up.railway.app
```

## Cómo Funciona

El `apiClient` en `src/api/client.ts` usa `VITE_API_BASE_URL` como base y los endpoints **no** incluyen `/api/`:

```typescript
// ✅ CORRECTO
apiClient.post('/auth/login', data)
// Resultado: https://backend.com/api/auth/login

// ❌ INCORRECTO (duplicará /api)
apiClient.post('/api/auth/login', data)
// Resultado: https://backend.com/api/api/auth/login
```

## Endpoints Disponibles

Todos los endpoints del backend siguen el patrón `/api/{resource}`:

### Auth
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrarse

### Invoices
- `GET /invoices` - Listar facturas
- `GET /invoices/{id}` - Obtener factura
- `POST /invoices` - Crear factura
- `PUT /invoices/{id}` - Actualizar factura
- `DELETE /invoices/{id}` - Eliminar factura
- `GET /invoices/{id}/pdf` - Descargar PDF

### Clients
- `GET /clients` - Listar clientes
- `GET /clients/{id}` - Obtener cliente
- `POST /clients` - Crear cliente
- `PUT /clients/{id}` - Actualizar cliente
- `DELETE /clients/{id}` - Eliminar cliente

### Companies
- `GET /companies` - Listar empresas
- `GET /companies/{id}` - Obtener empresa
- `POST /companies` - Crear empresa
- `PUT /companies/{id}` - Actualizar empresa
- `DELETE /companies/{id}` - Eliminar empresa

### Users
- `GET /users` - Listar usuarios
- `GET /users/{id}` - Obtener usuario
- `POST /users` - Crear usuario
- `PUT /users/{id}` - Actualizar usuario
- `DELETE /users/{id}` - Eliminar usuario

## Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega/edita:
   ```
   Name: VITE_API_BASE_URL
   Value: https://invoices-back-production.up.railway.app/api
   ```
4. Redeploy la aplicación

## Troubleshooting

### Error 404 en `/auth/register`

**Síntoma:** La petición va a `https://backend.com/auth/register` (sin `/api`)

**Causa:** `VITE_API_BASE_URL` no incluye `/api`

**Solución:** Actualiza `VITE_API_BASE_URL` en Vercel para incluir `/api` al final

### Error 404 en `/api/api/...`

**Síntoma:** La petición va a `https://backend.com/api/api/auth/login`

**Causa:** El código tiene `/api/` en el path cuando ya está en `baseURL`

**Solución:** Revisa que los endpoints en `src/api/*.api.ts` **NO** incluyan `/api/`

## Archivos de Configuración

- `.env.development` - Desarrollo local
- `.env.production` - Producción
- `.env.e2e.example` - Tests E2E (template)
- `src/api/client.ts` - Cliente Axios con baseURL
