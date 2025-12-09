import type { Invoice } from '@/types/invoice.types';
import type { Company } from '@/types/company.types';
import type { Client } from '@/types/client.types';

/**
 * Genera un PDF blob a partir de los datos de la factura.
 * Uses dynamic import to load @react-pdf/renderer only when needed,
 * reducing the main bundle size by ~1MB.
 * 
 * @param invoice Datos de la factura
 * @param company Datos de la empresa
 * @param client Datos del cliente
 * @returns Promise con el blob del PDF generado
 */
export const generateInvoicePdfBlob = async (
  invoice: Invoice,
  company: Company,
  client: Client
): Promise<Blob> => {
  // Dynamic import - loads react-pdf only when PDF generation is requested
  const [{ pdf }, { InvoiceDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../components/pdf/InvoiceDocument')
  ]);

  return pdf(
    <InvoiceDocument
      invoice={invoice}
      company={company}
      client={client}
    />
  ).toBlob();
};

