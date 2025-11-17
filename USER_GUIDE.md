# Guía de Usuario - Sistema de Gestión de Facturas

## Índice
1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Gestión de Facturas](#gestión-de-facturas)
4. [Empresas y Clientes](#empresas-y-clientes)
5. [Usuarios](#usuarios)
6. [Exportación](#exportación)
7. [Configuración](#configuración)

## Introducción

Sistema completo de gestión de facturas con las siguientes características:
- ✅ Gestión de facturas (crear, editar, eliminar)
- ✅ Gestión de empresas y clientes
- ✅ Control de usuarios y roles
- ✅ Exportación a PDF y Excel
- ✅ Dashboard con estadísticas
- ✅ Modo oscuro/claro
- ✅ Búsqueda global
- ✅ Filtros avanzados

## Primeros Pasos

### 1. Inicio de Sesión
1. Accede a la aplicación en tu navegador
2. Ingresa tu usuario y contraseña
3. Haz clic en "Iniciar Sesión"

### 2. Dashboard
El dashboard muestra:
- Métricas clave (facturas totales, pendientes, pagadas)
- Gráficos de ingresos mensuales
- Distribución por estado
- Facturas recientes

### 3. Navegación
Usa el menú lateral para navegar entre:
- **Dashboard**: Vista general
- **Facturas**: Gestión de facturas
- **Empresas**: Tus empresas emisoras
- **Clientes**: Base de clientes
- **Usuarios**: Gestión de usuarios (solo admin)
- **Perfil**: Tu información personal

## Gestión de Facturas

### Crear Nueva Factura
1. Ve a **Facturas** → **Nueva Factura**
2. Sigue el wizard de 5 pasos:
   - **Paso 1**: Selecciona la empresa emisora
   - **Paso 2**: Selecciona el cliente
   - **Paso 3**: Datos de la factura (número, fechas)
   - **Paso 4**: Agregar ítems/productos
   - **Paso 5**: Revisar y confirmar

### Editar Factura
1. Ve a **Facturas**
2. Haz clic en la factura que deseas editar
3. Haz clic en el botón "Editar"
4. Realiza los cambios necesarios
5. Guarda los cambios

### Exportar Factura
1. Abre el detalle de la factura
2. Haz clic en el botón "Exportar"
3. Selecciona el formato:
   - **PDF**: Para enviar al cliente
   - **Excel**: Para análisis de datos

### Estados de Factura
- **Borrador**: Factura en creación
- **Pendiente**: Factura emitida, pendiente de pago
- **Pagada**: Factura pagada completamente
- **Cancelada**: Factura anulada

## Empresas y Clientes

### Gestión de Empresas
Las empresas son tus entidades emisoras de facturas.

**Crear Empresa:**
1. Ve a **Empresas** → **Nueva Empresa**
2. Completa el formulario:
   - Nombre
   - CIF/NIF
   - Dirección
   - Email
   - Teléfono (opcional)
3. Haz clic en "Crear"

### Gestión de Clientes
Los clientes son los destinatarios de las facturas.

**Crear Cliente:**
1. Ve a **Clientes** → **Nuevo Cliente**
2. Completa el formulario con los datos del cliente
3. Haz clic en "Crear"

## Usuarios

### Gestión de Usuarios (Solo Administradores)

**Crear Usuario:**
1. Ve a **Usuarios** → **Nuevo Usuario**
2. Completa:
   - Email
   - Contraseña
   - Nombre y apellido
   - Roles (ROLE_USER, ROLE_ADMIN)
   - Estado (activo/inactivo)
3. Haz clic en "Crear"

**Roles:**
- **ROLE_USER**: Usuario estándar
- **ROLE_ADMIN**: Administrador con todos los permisos

## Exportación

### Exportar a PDF
- **Facturas individuales**: Botón en detalle de factura
- **Listado de facturas**: Botón "Exportar PDF" en la tabla

### Exportar a Excel
- **Facturas**: Botón "Exportar Excel" en la tabla
- **Clientes**: Botón "Exportar Excel" en la tabla
- **Empresas**: Botón "Exportar Excel" en la tabla

## Búsqueda y Filtros

### Búsqueda Global
1. Presiona `Ctrl+K` (o `Cmd+K` en Mac)
2. Escribe para buscar en facturas, empresas, clientes
3. Selecciona un resultado para navegar

### Filtros Avanzados
1. Haz clic en "Filtros Avanzados"
2. Configura:
   - Rango de fechas
   - Estado
   - Rango de montos
   - Empresa/Cliente
3. Los resultados se actualizan automáticamente

## Configuración

### Cambiar Tema
- Haz clic en el ícono de sol/luna en el header
- Alterna entre modo claro y oscuro

### Perfil
1. Ve a **Perfil**
2. Actualiza tu información personal
3. Cambia tu contraseña si es necesario

## Atajos de Teclado

- `Ctrl+K` / `Cmd+K`: Búsqueda global
- `Esc`: Cerrar diálogos

## Soporte

Para soporte técnico, contacta a:
- Email: support@yourcompany.com
- Documentación: https://docs.yourcompany.com

## Preguntas Frecuentes

**¿Puedo recuperar una factura cancelada?**
No, las facturas canceladas no se pueden recuperar. Asegúrate antes de cancelar.

**¿Cómo cambio el número de factura?**
Los números de factura se asignan automáticamente, pero puedes editarlos en el paso 3 del wizard.

**¿Puedo tener múltiples empresas?**
Sí, puedes crear tantas empresas como necesites.

**¿Los datos se guardan automáticamente?**
No, debes hacer clic en "Guardar" para confirmar los cambios.
