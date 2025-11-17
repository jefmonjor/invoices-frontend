# 🚀 Deployment en Vercel - Guía Completa

## 📋 Requisitos Previos

- [ ] Cuenta en [Vercel](https://vercel.com)
- [ ] Repositorio de GitHub conectado
- [ ] Backend desplegado y accesible (o URL del backend)

---

## 🎯 Paso 1: Preparar Variables de Entorno

### Variables Requeridas en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

```bash
# API Backend (REQUERIDO)
VITE_API_BASE_URL=https://tu-backend.railway.app/api

# Ambiente
VITE_APP_ENV=production

# Features (Opcional)
VITE_ENABLE_WEBSOCKETS=false
VITE_ENABLE_ANALYTICS=true

# Sentry (Opcional pero recomendado)
VITE_SENTRY_DSN=tu-sentry-dsn-aqui
VITE_SENTRY_ENVIRONMENT=production

# App Info
VITE_APP_NAME=Sistema de Gestión de Facturas
VITE_APP_VERSION=1.0.0
```

### ⚠️ IMPORTANTE: URL del Backend

**Opción 1: Backend en Railway**
```bash
VITE_API_BASE_URL=https://your-app.up.railway.app/api
```

**Opción 2: Backend en Render**
```bash
VITE_API_BASE_URL=https://your-app.onrender.com/api
```

**Opción 3: Backend en Heroku**
```bash
VITE_API_BASE_URL=https://your-app.herokuapp.com/api
```

**Opción 4: Backend local (solo para desarrollo)**
```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🚀 Paso 2: Deploy desde Vercel Dashboard

### Opción A: Import desde GitHub (Recomendado)

1. **Ve a [vercel.com/new](https://vercel.com/new)**

2. **Selecciona tu repositorio**
   - Busca: `jefmonjor/invoices-frontend`
   - Click en "Import"

3. **Configura el proyecto**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Agrega Environment Variables**
   - Copia y pega todas las variables de arriba
   - Asegúrate de que `VITE_API_BASE_URL` apunte a tu backend

5. **Click en "Deploy"**
   - Vercel detectará automáticamente la configuración de `vercel.json`
   - El deploy tomará 2-3 minutos

6. **¡Listo!** Tu app estará en:
   ```
   https://invoices-frontend-<random>.vercel.app
   ```

### Opción B: Deploy desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Seguir las instrucciones interactivas
```

---

## 🔧 Paso 3: Configurar CORS en el Backend

Tu backend **DEBE** permitir requests desde Vercel. Agrega esto en tu backend:

### Spring Boot Configuration

**Archivo: `src/main/resources/application.properties`**

```properties
# CORS Configuration
cors.allowed-origins=https://invoices-frontend-*.vercel.app,https://tu-dominio-custom.com
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true
```

**Archivo: `src/main/java/config/WebConfig.java`**

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Variables de Entorno en el Backend

Agrega en tu backend (Railway, Render, etc.):

```bash
CORS_ALLOWED_ORIGINS=https://invoices-frontend-abc123.vercel.app,https://tu-dominio.com
```

---

## ✅ Paso 4: Verificar el Deployment

### 4.1 Verificar que el Frontend cargó

1. Abre la URL de Vercel: `https://tu-app.vercel.app`
2. Deberías ver la página de login
3. Abre DevTools (F12) → Console
4. No deberías ver errores de carga

### 4.2 Verificar Conexión con Backend

1. Intenta hacer login
2. Si funciona: ✅ Backend conectado correctamente
3. Si ves error CORS:
   - Verifica la configuración CORS en el backend
   - Asegúrate de que la URL de Vercel esté en `allowedOrigins`

### 4.3 Verificar Variables de Entorno

En DevTools → Console, ejecuta:
```javascript
console.log(import.meta.env)
```

Deberías ver:
```javascript
{
  VITE_API_BASE_URL: "https://tu-backend.com/api",
  VITE_APP_ENV: "production",
  ...
}
```

---

## 🔄 Paso 5: Deploys Automáticos

Vercel hace deploy automático cuando:
- ✅ Pusheas a `main` (producción)
- ✅ Abres un PR (preview deployment)
- ✅ Pusheas a cualquier branch (preview)

### Configurar Branch de Producción

1. Ve a Settings → Git
2. Production Branch: `main` o `master`
3. Guardar

---

## 🌐 Paso 6: Dominio Personalizado (Opcional)

### Agregar Dominio Custom

1. Ve a Settings → Domains
2. Click "Add"
3. Ingresa tu dominio: `facturas.tuempresa.com`
4. Sigue las instrucciones de DNS:
   ```
   Type: CNAME
   Name: facturas
   Value: cname.vercel-dns.com
   ```
5. Espera propagación DNS (5-60 minutos)

### SSL Automático

Vercel configura SSL automáticamente con Let's Encrypt. No necesitas hacer nada.

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"

**Problema**: El frontend no puede conectar con el backend

**Solución**:
1. Verifica `VITE_API_BASE_URL` en Vercel
2. Asegúrate de que el backend esté corriendo
3. Verifica CORS en el backend

```bash
# Test desde terminal
curl https://tu-backend.com/api/health
```

### Error: CORS

**Problema**: `Access-Control-Allow-Origin` error

**Solución**:
```java
// En tu backend, agrega:
.allowedOrigins("https://tu-app.vercel.app")
.allowedOrigins("https://*.vercel.app") // Para todos los subdominos
```

### Error: Environment variables not loaded

**Problema**: Variables no se cargan

**Solución**:
1. Vercel → Settings → Environment Variables
2. Asegúrate de que empiecen con `VITE_`
3. Redeploy: Deployments → Latest → Redeploy

### Error 404 en rutas

**Problema**: Refresh da 404

**Solución**: Ya está solucionado en `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📊 Monitoreo

### Vercel Analytics

1. Ve a Analytics en tu proyecto
2. Verás:
   - Visitors
   - Page views
   - Top pages
   - Performance metrics

### Sentry (Error Tracking)

Si configuraste Sentry:
1. Ve a [sentry.io](https://sentry.io)
2. Verás errores en tiempo real
3. Stack traces completos
4. User context

---

## 🔐 Security Headers

Ya configurados en `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🚀 Performance

### Build Optimization

Vercel automáticamente:
- ✅ Comprime assets con Brotli
- ✅ Sirve desde CDN global
- ✅ Cachea assets estáticos
- ✅ Optimiza imágenes

### Verificar Performance

```bash
# Lighthouse
npx lighthouse https://tu-app.vercel.app --view

# Deberías ver:
# Performance: 90+
# Best Practices: 95+
# Accessibility: 90+
# SEO: 95+
```

---

## 📝 Checklist Final

Antes de compartir la URL con usuarios:

- [ ] ✅ Frontend desplegado en Vercel
- [ ] ✅ Backend corriendo y accesible
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ CORS configurado en backend
- [ ] ✅ Login funciona correctamente
- [ ] ✅ Crear factura funciona
- [ ] ✅ No hay errores en Console
- [ ] ✅ SSL funcionando (https://)
- [ ] ✅ Sentry configurado (opcional)
- [ ] ✅ Dominio custom (opcional)

---

## 📞 Soporte

Si tienes problemas:

1. **Vercel Logs**: Deployments → Latest → View Function Logs
2. **Browser DevTools**: F12 → Console / Network
3. **Backend Logs**: Railway/Render logs

---

## 🎉 ¡Listo!

Tu aplicación está ahora en producción:

```
✅ Frontend: https://tu-app.vercel.app
✅ Backend: https://tu-backend.railway.app
✅ SSL: Automático
✅ Deploy: Automático en push
✅ Monitoring: Vercel Analytics + Sentry
```

**¡Felicidades! 🚀**
