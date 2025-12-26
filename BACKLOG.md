# Invoices App - Backlog

> Última actualización: 2025-12-16

## 🔴 Alta Prioridad

### Vista Trimestral + Descarga por Trimestre
**Tiempo estimado:** ~10 horas

- [ ] Selector de trimestre (Q1-Q4) en vista de facturas
- [ ] Por defecto mostrar trimestre actual, otros colapsados
- [ ] Botón prominente "Descargar T[X]" para descargar ZIP del trimestre
- [ ] Botón secundario "Descargar Todas" (menos visible)
- [ ] Backend: Endpoint `/api/invoices/download-quarter?year=2025&quarter=4`

---

## 🟡 Media Prioridad

### Exportar a Excel
**Tiempo estimado:** ~4-5 horas

- [ ] Backend: Endpoint `/api/invoices/export?format=xlsx` usando Apache POI
- [ ] Frontend: Botón "Exportar Excel"
- [ ] Columnas: Nº Factura, Fecha, Cliente, Base, IVA, IRPF, Total, Estado, todas dependiendo el tipo de factura 

---

## 🟢 Baja Prioridad

### Resumen IVA para Modelo 303
**Tiempo estimado:** ~3 horas

- [ ] Vista de totales por trimestre: Base, IVA Repercutido, IRPF
- [ ] Facilitar declaración trimestral de IVA

### Optimización de Bundles
**Tiempo estimado:** ~2 horas

- [ ] Reducir chunk vendor-pdf (>1.4MB)
- [ ] Code splitting para carga más rápida

### Cloud Run Min Instance
**Tiempo estimado:** Config
**Costo:** ~$5-10/mes

- [ ] Activar min-instances=1 para eliminar cold starts

---

## ✅ Completado (Sesión 2025-12-16)

- [x] Logo de empresa (upload, display, PDF)
- [x] Fix mobile black screen (SW v3)
- [x] PWA icons (logo192.png, logo512.png)
- [x] Cold start UX (timeout 60s + mensaje)
- [x] Null items crash en lista de facturas
- [x] React 19.2.2 (CVE patch)
