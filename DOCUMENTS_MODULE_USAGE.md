# Módulo de Documentos - Guía de Uso

## 📚 Descripción

El módulo de Documentos permite subir, descargar, listar y eliminar archivos PDF adjuntos a facturas. Los archivos se almacenan en MinIO (desarrollo) o Cloudflare R2 (producción).

---

## 🎯 Casos de Uso

1. **Subir contratos firmados** a una factura
2. **Adjuntar recibos de pago**
3. **Almacenar documentación adicional** (albaranes, notas de entrega, etc.)
4. **Descargar documentos** previamente subidos
5. **Listar todos los documentos** de una factura

---

## 🚀 Ejemplos de Uso

### 1. Subir un Documento

```tsx
import { useUploadDocument } from '@/features/documents/hooks/useDocuments';

function InvoiceDocumentUploader({ invoiceId }: { invoiceId: number }) {
  const uploadMutation = useUploadDocument();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    // Validar tamaño (ej: máx 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('El archivo no debe superar 10MB');
      return;
    }

    // Subir documento
    uploadMutation.mutate({ file, invoiceId });
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        disabled={uploadMutation.isPending}
      />

      {uploadMutation.isPending && (
        <p>Subiendo documento...</p>
      )}
    </div>
  );
}
```

### 2. Listar Documentos de una Factura

```tsx
import { useDocumentsByInvoice, useDownloadDocument, useDeleteDocument } from '@/features/documents/hooks/useDocuments';

function InvoiceDocumentList({ invoiceId }: { invoiceId: number }) {
  const { data: documents, isLoading, error } = useDocumentsByInvoice(invoiceId);
  const downloadMutation = useDownloadDocument();
  const deleteMutation = useDeleteDocument();

  if (isLoading) return <p>Cargando documentos...</p>;
  if (error) return <p>Error al cargar documentos</p>;

  const handleDownload = (id: number, fileName: string) => {
    downloadMutation.mutate({ id, fileName });
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Eliminar este documento?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <h3>Documentos Adjuntos ({documents?.length || 0})</h3>

      {documents?.length === 0 && (
        <p>No hay documentos adjuntos</p>
      )}

      <ul>
        {documents?.map((doc) => (
          <li key={doc.id}>
            <span>{doc.originalFileName}</span>
            <span>{formatFileSize(doc.fileSize)}</span>
            <span>{formatDate(doc.createdAt)}</span>

            <button onClick={() => handleDownload(doc.id, doc.originalFileName)}>
              Descargar
            </button>

            <button onClick={() => handleDelete(doc.id)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper para formatear tamaño de archivo
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
```

### 3. Componente Completo con Drag & Drop

```tsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDocumentsByInvoice, useUploadDocument } from '@/features/documents/hooks/useDocuments';

function InvoiceDocumentsPanel({ invoiceId }: { invoiceId: number }) {
  const { data: documents } = useDocumentsByInvoice(invoiceId);
  const uploadMutation = useUploadDocument();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadMutation.mutate({ file, invoiceId });
    });
  }, [invoiceId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  return (
    <div>
      {/* Zona de Drop */}
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#f0f0f0' : 'white',
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Suelta los archivos aquí...</p>
        ) : (
          <p>Arrastra archivos PDF o haz clic para seleccionar</p>
        )}
      </div>

      {/* Lista de documentos */}
      <div>
        <h4>Documentos ({documents?.length || 0})</h4>
        {/* Renderizar lista aquí */}
      </div>
    </div>
  );
}
```

### 4. Descargar Documento Programáticamente

```tsx
import { useDownloadDocument } from '@/features/documents/hooks/useDocuments';

function useAutoDownload() {
  const downloadMutation = useDownloadDocument();

  const downloadDocumentById = (id: number, fileName?: string) => {
    downloadMutation.mutate({ id, fileName });
  };

  return { downloadDocumentById, isDownloading: downloadMutation.isPending };
}

// Uso:
const { downloadDocumentById } = useAutoDownload();
downloadDocumentById(123, 'contrato-firmado.pdf');
```

---

## 🔧 API Reference

### Hooks Disponibles

#### `useDocumentsByInvoice(invoiceId: number)`

Obtiene todos los documentos de una factura.

```typescript
const { data, isLoading, error } = useDocumentsByInvoice(123);
// data: Document[]
```

#### `useDocument(id: number)`

Obtiene metadata de un documento específico.

```typescript
const { data, isLoading } = useDocument(456);
// data: Document
```

#### `useUploadDocument()`

Sube un documento.

```typescript
const uploadMutation = useUploadDocument();
uploadMutation.mutate({ file, invoiceId });
```

#### `useDownloadDocument()`

Descarga un documento.

```typescript
const downloadMutation = useDownloadDocument();
downloadMutation.mutate({ id: 123, fileName: 'documento.pdf' });
```

#### `useDeleteDocument()`

Elimina un documento.

```typescript
const deleteMutation = useDeleteDocument();
deleteMutation.mutate(123);
```

---

## 📋 Tipos TypeScript

### `Document`

```typescript
interface Document {
  id: number;
  fileName: string;
  originalFileName: string;
  fileSize: number; // bytes
  fileType: string; // "application/pdf"
  storageUrl: string;
  invoiceId: number;
  uploadedBy: number;
  uploadedByName?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## ⚠️ Consideraciones

### Validaciones Recomendadas

1. **Tipo de archivo**: Solo PDF (`application/pdf`)
2. **Tamaño máximo**: 10 MB (configurable)
3. **Nombre de archivo**: Sanitizar caracteres especiales
4. **Permisos**: Solo usuarios autorizados pueden subir/eliminar

### Seguridad

- ✅ JWT automático con Bearer token
- ✅ Validación de tipos MIME en backend
- ✅ Sanitización de nombres de archivo
- ✅ Límite de tamaño de archivo
- ✅ Escaneo de virus (recomendado en producción)

### Performance

- ✅ Caché de 5 minutos para listas
- ✅ Invalidación automática al subir/eliminar
- ✅ Upload con `FormData` multipart
- ✅ Download como `Blob` con `responseType: 'blob'`

---

## 🧪 Testing

### Test de Integración

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useDocumentsByInvoice } from '@/features/documents/hooks/useDocuments';

describe('Documents Module', () => {
  it('should fetch documents by invoice', async () => {
    const { result } = renderHook(() => useDocumentsByInvoice(1));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeInstanceOf(Array);
  });
});
```

---

## 🔗 Backend Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/documents` | Subir documento |
| GET | `/api/documents/{id}` | Obtener metadata |
| GET | `/api/documents/{id}/download` | Descargar PDF |
| GET | `/api/documents?invoiceId=X` | Listar por factura |
| DELETE | `/api/documents/{id}` | Eliminar documento |

---

## 📦 Dependencias Requeridas

```bash
npm install react-dropzone  # Para drag & drop (opcional)
```

---

**✅ Módulo completamente funcional y listo para usar**
