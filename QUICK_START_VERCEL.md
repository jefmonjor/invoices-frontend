# 🚀 Quick Start - Deploy en Vercel en 5 Minutos

## Paso 1: Import en Vercel (2 min)

1. **Ve a**: https://vercel.com/new

2. **Import Git Repository**
   - Busca: `jefmonjor/invoices-frontend`
   - Click "Import"

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build (auto-detectado)
   Output Directory: dist (auto-detectado)
   Install Command: npm install (auto-detectado)
   ```

## Paso 2: Variables de Entorno (1 min)

Click en "Environment Variables" y agrega:

```bash
# REQUERIDO - URL de tu backend
VITE_API_BASE_URL=http://localhost:8080/api

# Opcional
VITE_APP_ENV=production
VITE_APP_NAME=Sistema de Facturas
```

⚠️ **IMPORTANTE**: Cambia `http://localhost:8080/api` por la URL real de tu backend cuando lo despliegues.

## Paso 3: Deploy (1 min)

1. Click **"Deploy"**
2. Espera 2-3 minutos
3. ✅ **¡Listo!**

Tu app estará en:
```
https://invoices-frontend-<random>.vercel.app
```

## Paso 4: Configurar Backend CORS (1 min)

En tu backend Spring Boot, agrega en `application.properties`:

```properties
cors.allowed-origins=https://invoices-frontend-<tu-id>.vercel.app
```

O usa variable de entorno en Railway/Render:

```bash
CORS_ALLOWED_ORIGINS=https://invoices-frontend-<tu-id>.vercel.app
```

## Paso 5: Actualizar URL del Backend

Cuando despliegues tu backend:

1. Ve a Vercel → Settings → Environment Variables
2. Edita `VITE_API_BASE_URL`:
   ```bash
   VITE_API_BASE_URL=https://tu-backend.railway.app/api
   ```
3. Redeploy:
   - Deployments → Latest → ... → Redeploy

---

## ✅ Verificación

1. Abre tu app: `https://tu-app.vercel.app`
2. Deberías ver la página de login
3. Prueba login (requiere backend corriendo)

---

## 🐛 Si algo falla

**Error CORS**:
- Verifica CORS en backend

**Error "Failed to fetch"**:
- Verifica `VITE_API_BASE_URL` en Vercel
- Asegúrate de que backend esté corriendo

**404 en refresh**:
- Ya está configurado en `vercel.json` ✅

---

## 📚 Documentación Completa

- **Deploy detallado**: `VERCEL_DEPLOYMENT.md`
- **Configurar backend**: `BACKEND_CONFIGURATION.md`
- **Guía de usuario**: `USER_GUIDE.md`

---

**¡Eso es todo! Tu app está en producción en 5 minutos** 🎉
