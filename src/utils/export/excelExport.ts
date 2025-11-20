import * as XLSX from 'xlsx';
import type { Invoice } from '@/types/invoice.types';
import type { Client } from '@/types/client.types';
import type { Company } from '@/types/company.types';
import { formatDate } from '@/utils/formatters';

// Extended type for invoices with company/client details
export interface InvoiceWithDetails extends Invoice {
  company?: { name: string };
  client?: { name: string };
}

export const exportInvoicesToExcel = (invoices: InvoiceWithDetails[]) => {
  const data = invoices.map(inv => ({
    'N° Factura': inv.invoiceNumber,
    'Fecha': formatDate(inv.date),
    'Empresa': inv.company?.name ?? `Empresa #${inv.companyId}`,
    'Cliente': inv.client?.name ?? `Cliente #${inv.clientId}`,
    'Subtotal': inv.subtotal,
    'IVA': inv.totalVAT,
    'IRPF': inv.totalIRPF,
    'RE': inv.totalRE,
    'Total': inv.total,
    'Notas': inv.notes ?? '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Facturas');

  // Column widths
  const maxWidth = data.reduce((w, r) => Math.max(w, r['N° Factura'].length), 10);
  ws['!cols'] = [
    { wch: maxWidth },
    { wch: 12 },
    { wch: 20 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 30 },
  ];

  XLSX.writeFile(wb, `facturas-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportClientsToExcel = (clients: Client[]) => {
  const data = clients.map(client => ({
    'ID': client.id,
    'Nombre': client.name,
    'CIF/NIF': client.taxId,
    'Dirección': client.address,
    'Email': client.email,
    'Teléfono': client.phone || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

  ws['!cols'] = [
    { wch: 8 },
    { wch: 25 },
    { wch: 12 },
    { wch: 35 },
    { wch: 25 },
    { wch: 15 },
  ];

  XLSX.writeFile(wb, `clientes-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportCompaniesToExcel = (companies: Company[]) => {
  const data = companies.map(company => ({
    'ID': company.id,
    'Nombre': company.name,
    'CIF': company.taxId,
    'Dirección': company.address,
    'Email': company.email,
    'Teléfono': company.phone || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Empresas');

  ws['!cols'] = [
    { wch: 8 },
    { wch: 25 },
    { wch: 12 },
    { wch: 35 },
    { wch: 25 },
    { wch: 15 },
  ];

  XLSX.writeFile(wb, `empresas-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Generic export function
export const exportToExcel = <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName: string = 'Data'
) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
};
