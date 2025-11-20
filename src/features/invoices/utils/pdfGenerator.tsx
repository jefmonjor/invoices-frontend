import { pdf } from '@react-pdf/renderer';
import { InvoiceDocument } from '../components/pdf/InvoiceDocument';
import type { Invoice } from '@/types/invoice.types';
import type { Company } from '@/types/company.types';
import type { Client } from '@/types/client.types';

/**
 * Genera un PDF blob a partir de los datos de la factura
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
  return pdf(
    <InvoiceDocument
      invoice={invoice}
      company={company}
      client={client}
    />
  ).toBlob();
};
