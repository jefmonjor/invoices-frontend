# E2E Tests con Playwright

## 📋 Descripción

Los tests End-to-End (E2E) utilizan Playwright para probar la aplicación completa, incluyendo la interacción con el backend real.

## ⚠️ Requisitos Previos

### 1. Backend Funcionando

Los tests E2E requieren que el backend esté corriendo y accesible. Por defecto, los tests esperan:

- **Backend URL**: `https://invoices-back-production.up.railway.app`
- **Credenciales de prueba** (por defecto en los tests):
  - **Email**: `admin@invoices.com` ⚠️ **DEBE SER UN EMAIL VÁLIDO**
  - **Password**: `admin123`

### 2. Usuario de Prueba Configurado

⚠️ **IMPORTANTE**: El backend requiere un **email válido**, no un username simple como "admin".

Asegúrate de que el backend tenga un usuario con credenciales válidas:

1. El email debe tener formato válido (ej: `admin@invoices.com`, `test@example.com`)
2. El usuario debe existir en la base de datos
3. La contraseña debe coincidir

Si las credenciales del backend son diferentes, actualiza las constantes en los archivos de test:
- `e2e/auth.spec.ts` → `TEST_EMAIL` y `TEST_PASSWORD`
- `e2e/invoices.spec.ts` → `TEST_EMAIL` y `TEST_PASSWORD`

### 3. Playwright Instalado

```bash
# Instalar dependencias de Playwright
npx playwright install --with-deps
```

## 🚀 Ejecutar Tests E2E

### Modo Headless (CI/CD)

```bash
npm run test:e2e
```

### Modo con UI (Desarrollo)

```bash
npm run test:e2e:ui
```

### Modo con Browser Visible

```bash
npm run test:e2e:headed
```

## 📝 Estructura de Tests

```
e2e/
├── auth.spec.ts       # Tests de autenticación
└── invoices.spec.ts   # Tests de gestión de facturas
```

## ⚙️ Configuración

### Configuración de Playwright

Ver `playwright.config.ts` para configuración de:
- URL base del frontend
- Timeouts
- Navegadores
- Screenshots en fallos

### Variables de Entorno

Puedes configurar variables de entorno para los tests:

```bash
# .env.test
VITE_API_BASE_URL=https://invoices-back-production.up.railway.app/api
```

## 🔧 Tests en CI/CD

Los tests E2E están configurados como **no bloqueantes** en el workflow de CI/CD (`continue-on-error: true`).

**Razón**: Los tests E2E requieren:
- Backend en producción disponible
- Credenciales válidas
- Datos de prueba en el backend

Estos requisitos pueden no estar disponibles en todos los entornos de CI/CD, por lo que los tests se ejecutan pero no bloquean el merge si fallan.

### ✅ Recomendación

Los tests E2E deben ejecutarse:
- **Localmente** durante el desarrollo
- **En staging** antes de deploy a producción
- **Manualmente** cuando se necesite validación completa

Los tests unitarios (Vitest) cubren la lógica del frontend y **SÍ son bloqueantes** en CI/CD.

## 🐛 Troubleshooting

### Error: "Executable doesn't exist"

```bash
# Instalar navegadores de Playwright
npx playwright install --with-deps chromium
```

### Error: "Email must be valid" o validación de email falla

Este error ocurre cuando intentas autenticarte con un username en lugar de un email válido.

**Causa**: El backend requiere que el campo de login sea un email con formato válido.

**Solución**:
1. Verifica que estés usando un email válido (ej: `admin@invoices.com`)
2. NO uses un username simple como `admin` o `user123`
3. Actualiza las constantes `TEST_EMAIL` en los archivos de test

```typescript
// ❌ INCORRECTO
const TEST_EMAIL = 'admin';

// ✅ CORRECTO
const TEST_EMAIL = 'admin@invoices.com';
```

### Error: Login falla / No redirige a dashboard (401 Unauthorized)

Verificar:
1. ✅ Backend está corriendo y accesible
2. ✅ Estás usando un **email válido** (no un username)
3. ✅ El usuario existe en la base de datos del backend
4. ✅ La contraseña es correcta
5. ✅ No hay problemas de CORS
6. ✅ URL del backend es correcta

**Logs del backend útiles**:
- `Invalid credentials: Invalid email or password` → Usuario o contraseña incorrectos
- `Email must be valid` → Formato de email inválido

### Error: Tests timeout

Aumentar timeout en `playwright.config.ts`:

```typescript
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  timeout: 30000, // Aumentar timeout global
});
```

## 📚 Recursos

- [Documentación de Playwright](https://playwright.dev/)
- [Best Practices para E2E](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

## 🔄 Actualizar Credenciales de Prueba

Si necesitas cambiar las credenciales de prueba, actualiza las constantes al inicio de ambos archivos:

**e2e/auth.spec.ts** y **e2e/invoices.spec.ts**:

```typescript
// ⚠️ IMPORTANTE: Actualiza estas credenciales con las de tu entorno
// El backend requiere un email válido, no un username
const TEST_EMAIL = 'tu.email@ejemplo.com'; // ⬅️ Cambiar por tu email válido
const TEST_PASSWORD = 'tu_password_aqui';  // ⬅️ Cambiar por tu contraseña

// Helper to login before tests
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email|correo/i).fill(TEST_EMAIL);
  await page.getByLabel(/password|contraseña/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/.*dashboard/);
}
```

### ⚠️ Nota Importante sobre Email

El backend valida que el campo de login sea un **email válido**. No uses un username simple como "admin".

**✅ Válido**: `admin@invoices.com`, `test@example.com`
**❌ Inválido**: `admin`, `user123`
