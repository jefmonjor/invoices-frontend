# 🔧 Configuración del Backend para Vercel Frontend

## 📋 Resumen

Este documento explica cómo configurar tu backend Spring Boot para que funcione con el frontend desplegado en Vercel.

---

## 🎯 Cambios Necesarios en el Backend

### 1. Configurar CORS

El backend DEBE permitir requests desde el dominio de Vercel.

#### Opción A: application.properties

**Archivo: `src/main/resources/application.properties`**

```properties
# CORS Configuration
cors.allowed-origins=https://invoices-frontend-*.vercel.app,https://tu-dominio.com
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
cors.allowed-headers=*
cors.allow-credentials=true
cors.max-age=3600

# O usar variable de entorno
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000}
```

#### Opción B: application.yml

**Archivo: `src/main/resources/application.yml`**

```yaml
cors:
  allowed-origins:
    - https://invoices-frontend-*.vercel.app
    - https://tu-dominio.com
  allowed-methods:
    - GET
    - POST
    - PUT
    - DELETE
    - OPTIONS
  allowed-headers: "*"
  allow-credentials: true
  max-age: 3600
```

### 2. Configuración de CORS en Spring

**Archivo: `src/main/java/com/tuempresa/config/WebConfig.java`**

```java
package com.tuempresa.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${cors.allowed-origins:http://localhost:3000}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 3. Security Configuration (Si usas Spring Security)

**Archivo: `src/main/java/com/tuempresa/config/SecurityConfig.java`**

```java
package com.tuempresa.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(csrf -> csrf.disable()) // Deshabilitar CSRF para API REST
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/**").authenticated()
            )
            .httpBasic(basic -> basic.disable());

        return http.build();
    }
}
```

---

## 🌐 Configuración por Entorno

### Development (Local)

**application-dev.properties**

```properties
cors.allowed-origins=http://localhost:3000,http://localhost:5173
server.port=8080
```

### Production

**Variables de Entorno en Railway/Render/Heroku:**

```bash
# CORS
CORS_ALLOWED_ORIGINS=https://invoices-frontend-abc123.vercel.app,https://tu-dominio.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=tu-secreto-seguro-aqui
JWT_EXPIRATION=86400000

# Server
SERVER_PORT=8080
```

---

## 🚀 Deployment del Backend

### Opción 1: Railway

1. **Crear cuenta en [Railway](https://railway.app)**

2. **New Project → Deploy from GitHub**

3. **Seleccionar repositorio del backend**

4. **Configurar variables de entorno**:
   ```bash
   CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   ```

5. **Railway auto-detecta Spring Boot**
   - Build command: `./mvnw clean install -DskipTests`
   - Start command: `java -jar target/*.jar`

6. **Obtener URL**:
   ```
   https://your-backend.up.railway.app
   ```

### Opción 2: Render

1. **Crear cuenta en [Render](https://render.com)**

2. **New → Web Service**

3. **Conectar repositorio**

4. **Configurar**:
   ```
   Build Command: ./mvnw clean install -DskipTests
   Start Command: java -jar target/*.jar
   ```

5. **Variables de entorno**:
   ```bash
   CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app
   DATABASE_URL=postgresql://...
   JWT_SECRET=...
   ```

6. **Obtener URL**:
   ```
   https://your-backend.onrender.com
   ```

### Opción 3: Heroku

```bash
# Login
heroku login

# Crear app
heroku create tu-backend-invoices

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variables
heroku config:set CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app
heroku config:set JWT_SECRET=tu-secreto

# Deploy
git push heroku main

# URL
https://tu-backend-invoices.herokuapp.com
```

---

## 🔗 Conectar Frontend con Backend

### 1. Obtener URL del Backend

Después de desplegar tu backend, obtendrás una URL como:
- Railway: `https://your-app.up.railway.app`
- Render: `https://your-app.onrender.com`
- Heroku: `https://your-app.herokuapp.com`

### 2. Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Edita `VITE_API_BASE_URL`:
   ```bash
   VITE_API_BASE_URL=https://your-backend.up.railway.app/api
   ```
4. Redeploy el frontend

### 3. Verificar Conexión

```bash
# Test desde terminal
curl https://your-backend.up.railway.app/api/health

# Debería responder:
# {"status":"UP"}
```

---

## ✅ Verificación Completa

### 1. Test CORS desde Frontend

Abre DevTools en tu app de Vercel:

```javascript
// Debería funcionar sin errores CORS
fetch('https://tu-backend.com/api/companies')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error('CORS Error:', err))
```

### 2. Test de Login

1. Abre tu app en Vercel: `https://tu-app.vercel.app`
2. Intenta hacer login
3. ✅ Si funciona: Backend correctamente configurado
4. ❌ Si falla: Revisa CORS y variables de entorno

---

## 🐛 Troubleshooting

### Error: "CORS policy: No 'Access-Control-Allow-Origin'"

**Causa**: Backend no permite el origen de Vercel

**Solución**:
```java
// Verifica en WebConfig.java:
.allowedOrigins("https://tu-app.vercel.app")

// O permite todos los subdominios de Vercel:
.allowedOrigins("https://*.vercel.app")
```

### Error: "Failed to fetch"

**Causa**: URL del backend incorrecta

**Solución**:
1. Verifica `VITE_API_BASE_URL` en Vercel
2. Asegúrate de que el backend esté corriendo:
   ```bash
   curl https://tu-backend.com/api/health
   ```

### Error: "401 Unauthorized"

**Causa**: JWT o autenticación fallando

**Solución**:
1. Verifica que `JWT_SECRET` sea el mismo en ambos ambientes
2. Revisa logs del backend
3. Verifica que el token se envíe en headers:
   ```javascript
   Authorization: Bearer <token>
   ```

### Backend no responde

**Causa**: Backend dormido (Render free tier)

**Solución**:
- Render free tier se duerme después de 15 min de inactividad
- Primera request toma 30-60 segundos en despertar
- Considera upgrade a plan pagado

---

## 📊 Logs y Debugging

### Ver logs del Backend

**Railway:**
```bash
# Web UI
railway logs

# CLI
railway logs --follow
```

**Render:**
```bash
# Web UI
Dashboard → Logs

# En tiempo real
```

**Heroku:**
```bash
heroku logs --tail --app tu-backend-invoices
```

### Ver logs del Frontend (Vercel)

```bash
# Web UI
Vercel → Deployments → Latest → View Function Logs

# No hay logs de runtime porque es SPA estático
```

---

## 🔐 Consideraciones de Seguridad

### 1. HTTPS Only

✅ Vercel y Railway/Render/Heroku usan HTTPS automáticamente

### 2. CORS Restrictivo

```java
// ❌ NO hagas esto en producción:
.allowedOrigins("*")

// ✅ SÍ especifica dominios:
.allowedOrigins("https://tu-app.vercel.app", "https://tu-dominio.com")
```

### 3. Secrets

- ❌ NO hardcodees secrets en el código
- ✅ SÍ usa variables de entorno
- ✅ SÍ usa servicios como Railway/Render secrets

### 4. Rate Limiting

Considera agregar rate limiting:

```java
// pom.xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.0.0</version>
</dependency>
```

---

## 📝 Checklist de Configuración

Backend:
- [ ] ✅ CORS configurado con URL de Vercel
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Base de datos conectada
- [ ] ✅ JWT_SECRET configurado
- [ ] ✅ Backend desplegado y accesible
- [ ] ✅ HTTPS funcionando

Frontend (Vercel):
- [ ] ✅ `VITE_API_BASE_URL` apunta al backend
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Deploy exitoso
- [ ] ✅ Login funciona
- [ ] ✅ No hay errores CORS

---

## 🎉 Resultado Final

```
✅ Frontend: https://invoices-app.vercel.app
✅ Backend: https://invoices-api.railway.app
✅ Database: PostgreSQL en Railway
✅ CORS: Configurado
✅ HTTPS: Automático
✅ Deploy: Automático
```

**¡Tu aplicación está en producción! 🚀**
