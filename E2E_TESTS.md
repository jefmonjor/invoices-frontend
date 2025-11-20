# E2E Tests con Playwright

## 📋 Descripción

Los tests End-to-End (E2E) utilizan Playwright para probar la aplicación completa, incluyendo la interacción con el backend real.

## ⚠️ Requisitos Previos

### 1. Backend Funcionando

Los tests E2E requieren que el backend esté corriendo y accesible. Por defecto, los tests esperan:

- **Backend URL**: `https://invoices-back-production.up.railway.app`
- **Credenciales de prueba**:
  - Username: `admin`
  - Password: `admin123`

### 2. Usuario de Prueba Configurado

Asegúrate de que el backend tenga un usuario con las credenciales anteriores o actualiza los tests con las credenciales correctas.

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

### Error: Login falla / No redirige a dashboard

Verificar:
1. ✅ Backend está corriendo y accesible
2. ✅ Usuario `admin` / `admin123` existe en el backend
3. ✅ No hay problemas de CORS
4. ✅ URL del backend es correcta

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

Si necesitas cambiar las credenciales de prueba, actualiza los archivos:

**e2e/invoices.spec.ts** y **e2e/auth.spec.ts**:

```typescript
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/username|usuario/i).fill('TU_USUARIO');
  await page.getByLabel(/password|contraseña/i).fill('TU_PASSWORD');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();
  await expect(page).toHaveURL(/.*dashboard/);
}
```
