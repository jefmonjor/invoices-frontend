# ✅ Deployment Checklist - Vercel

## 🎯 Objetivo
Desplegar **invoices-frontend** en Vercel y conectarlo con el backend.

---

## 📚 Documentación Disponible

- **`QUICK_START_VERCEL.md`** ← Empieza aquí (5 minutos)
- **`VERCEL_DEPLOYMENT.md`** ← Guía detallada completa
- **`BACKEND_CONFIGURATION.md`** ← Configurar backend después
- **`DEPLOYMENT.md`** ← Alternativas (Netlify, Docker)

---

## 🚀 Pasos Rápidos (5 minutos)

### 1. Import en Vercel
1. Ve a: https://vercel.com/new
2. Import Git Repository: `jefmonjor/invoices-frontend`
3. Click "Import"

### 2. Configurar Proyecto
```
Framework Preset: Vite
Build Command: npm run build (auto-detectado)
Output Directory: dist (auto-detectado)
Install Command: npm install (auto-detectado)
```

### 3. Variables de Entorno
Click "Environment Variables" y agrega:

```bash
# REQUERIDO
VITE_API_BASE_URL=http://localhost:8080/api

# OPCIONAL
VITE_APP_ENV=production
VITE_APP_NAME=Sistema de Facturas
VITE_SENTRY_DSN=
```

⚠️ **IMPORTANTE**: Cambia `http://localhost:8080/api` por la URL real de tu backend cuando esté desplegado.

### 4. Deploy
1. Click **"Deploy"**
2. Espera 2-3 minutos
3. ✅ Tu app estará en: `https://invoices-frontend-<random>.vercel.app`

---

## 🔧 Después del Deploy

### Actualizar URL del Backend

Cuando despliegues tu backend (Railway, Render, etc.):

1. Ve a Vercel → Settings → Environment Variables
2. Edita `VITE_API_BASE_URL`:
   ```bash
   VITE_API_BASE_URL=https://tu-backend.railway.app/api
   ```
3. Redeploy: Deployments → Latest → ... → Redeploy

### Configurar CORS en Backend

Tu backend **DEBE** permitir requests desde Vercel.

**En `application.properties`:**
```properties
cors.allowed-origins=https://invoices-frontend-*.vercel.app
```

**Ver detalles completos en:** `BACKEND_CONFIGURATION.md`

---

## ✅ Verificación

1. Abre: `https://tu-app.vercel.app`
2. ✅ Deberías ver página de login
3. ✅ Intenta login (requiere backend corriendo)
4. ✅ No hay errores CORS en DevTools Console

---

## 🐛 Troubleshooting Rápido

| Error | Solución |
|-------|----------|
| **"Failed to fetch"** | Verifica `VITE_API_BASE_URL` en Vercel y que backend esté corriendo |
| **Error CORS** | Agrega URL de Vercel en `cors.allowed-origins` del backend |
| **404 en refresh** | Ya configurado en `vercel.json` ✅ |
| **Variables no cargan** | Asegúrate que empiecen con `VITE_` y redeploy |

---

## 📋 Checklist Completo

### Frontend (Vercel)
- [ ] Repositorio importado en Vercel
- [ ] Framework detectado como Vite
- [ ] `VITE_API_BASE_URL` configurada
- [ ] Deploy exitoso
- [ ] App carga sin errores

### Backend (Railway/Render/Heroku)
- [ ] Backend desplegado y accesible
- [ ] CORS configurado con URL de Vercel
- [ ] Variables de entorno configuradas
- [ ] Base de datos conectada
- [ ] Health check responde

### Integración
- [ ] Frontend actualizado con URL del backend
- [ ] Redeploy del frontend completado
- [ ] Login funciona correctamente
- [ ] No hay errores CORS
- [ ] Todas las funcionalidades probadas

---

## 🎉 Estado Actual del Proyecto

```
✅ 100% Completado - Sprint 4
✅ 22/22 Features implementados
✅ Tests E2E con Playwright
✅ CI/CD con GitHub Actions
✅ Docker configurado
✅ Documentación completa
✅ Listo para producción
```

---

## 📞 Próximos Pasos

1. **AHORA**: Deploy en Vercel (5 min)
2. **LUEGO**: Deploy backend (10-15 min)
3. **FINALMENTE**: Conectar ambos y verificar (5 min)

**Tiempo total estimado: 20-25 minutos**

---

## 🔗 Enlaces Útiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentación Vercel**: https://vercel.com/docs
- **Railway** (Backend): https://railway.app
- **Render** (Backend): https://render.com

---

**¡Todo está listo para producción! 🚀**
