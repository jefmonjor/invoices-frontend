# 🚀 Guía Rápida: Crear Usuario de Prueba

Esta guía te ayuda a crear el usuario necesario para ejecutar los tests E2E.

## 📋 Pasos para Crear Usuario de Prueba

### Opción 1: Registro desde el Frontend (Recomendado) ✨

**1. Accede a la página de registro:**

🌐 **Producción**: https://invoices-frontend-vert.vercel.app/register

🏠 **Local**: http://localhost:3000/register

**2. Completa el formulario:**

```
Email:      admin@invoices.com
Nombre:     Admin
Apellido:   Test
Contraseña: admin123
Confirmar:  admin123
```

**3. Haz clic en "Registrarse"**

✅ Verás un mensaje: "¡Registro exitoso! Ahora puedes iniciar sesión."

**4. Inicia sesión con las credenciales:**
- Email: `admin@invoices.com`
- Contraseña: `admin123`

---

### Opción 2: Desde la Página de Login 🔗

1. Ve a la página de login
2. En la parte inferior verás: **"¿No tienes cuenta? Regístrate aquí"**
3. Haz clic en "Regístrate aquí"
4. Sigue los pasos de la Opción 1

---

### Opción 3: SQL Directo (Avanzado) 💾

Si tienes acceso directo a la base de datos PostgreSQL:

```sql
-- 1. Generar hash BCrypt para 'admin123' en https://bcrypt-generator.com/
-- O usa este hash de ejemplo (rounds=10):
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- 2. Insertar usuario
INSERT INTO users (email, password, first_name, last_name, roles, enabled, created_at)
VALUES (
  'admin@invoices.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Admin',
  'Test',
  ARRAY['ROLE_USER', 'ROLE_ADMIN'],
  true,
  NOW()
);
```

---

## ✅ Verificar que el Usuario Funciona

### Prueba de Login Manual

1. Ve a: https://invoices-frontend-vert.vercel.app/login
2. Ingresa:
   - **Email**: `admin@invoices.com`
   - **Contraseña**: `admin123`
3. Deberías ser redirigido al Dashboard

### Prueba con Tests E2E

```bash
# 1. Actualizar credenciales en los tests (si usaste datos diferentes)
# Editar e2e/auth.spec.ts y e2e/invoices.spec.ts
const TEST_EMAIL = 'admin@invoices.com';
const TEST_PASSWORD = 'admin123';

# 2. Ejecutar tests E2E
npm run test:e2e
```

---

## 🎯 Importante

⚠️ **El backend requiere formato de EMAIL válido**

✅ **Válido**:
- `admin@invoices.com`
- `test@example.com`
- `usuario@dominio.org`

❌ **Inválido** (rechazado por validación):
- `admin` (sin @)
- `user123` (sin @)
- `test` (sin @)

---

## 🔍 Troubleshooting

### Error: "Email must be valid"

El backend valida el formato del email. Asegúrate de usar un email con @ y dominio.

### Error: "Invalid credentials"

1. Verifica que el usuario existe en la base de datos
2. Confirma que la contraseña es correcta
3. Revisa los logs del backend para más detalles

### Error: "User already exists"

Si ya existe un usuario con ese email:
- Usa otro email
- O elimina el usuario existente de la BD
- O usa las credenciales del usuario existente

---

## 📚 Documentación Relacionada

- **E2E Tests**: Ver [E2E_TESTS.md](./E2E_TESTS.md)
- **API Contract**: Ver [API_COMPATIBILITY_ANALYSIS.md](./API_COMPATIBILITY_ANALYSIS.md)

---

## 🎉 ¡Listo!

Una vez que hayas creado el usuario, puedes:

1. ✅ Hacer login en el frontend
2. ✅ Ejecutar los tests E2E
3. ✅ Probar todas las funcionalidades de la aplicación

**¡Tu usuario de prueba está listo para usar!** 🚀
