import ExcelJS from 'exceljs';
import type { Client } from '@/types/client.types';
import type { Company } from '@/types/company.types';
import { formatDate } from '@/utils/formatters';

// Type for invoices with company/client details (for exports)
// Note: Not extending Invoice to allow partial company/client data
export interface InvoiceWithDetails {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  companyId: number;
  clientId: number;
  baseAmount: number;
  irpfAmount: number;
  reAmount: number;
  totalAmount: number;
  notes?: string;
  company?: { businessName: string };
  client?: { businessName: string };
}

/**
 * Helper to trigger file download from workbook buffer
 */
const downloadWorkbook = async (workbook: ExcelJS.Workbook, filename: string) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportInvoicesToExcel = async (invoices: InvoiceWithDetails[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Facturas');

  // Define columns
  worksheet.columns = [
    { header: 'N° Factura', key: 'invoiceNumber', width: 15 },
    { header: 'Fecha', key: 'date', width: 12 },
    { header: 'Empresa', key: 'company', width: 25 },
    { header: 'Cliente', key: 'client', width: 25 },
    { header: 'Base Imponible', key: 'baseAmount', width: 15 },
    { header: 'IVA', key: 'vat', width: 12 },
    { header: 'IRPF', key: 'irpf', width: 12 },
    { header: 'RE', key: 're', width: 12 },
    { header: 'Total', key: 'total', width: 12 },
    { header: 'Notas', key: 'notes', width: 30 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data rows
  invoices.forEach(inv => {
    const totalVAT = inv.totalAmount - inv.baseAmount + inv.irpfAmount - inv.reAmount;
    worksheet.addRow({
      invoiceNumber: inv.invoiceNumber,
      date: formatDate(inv.issueDate),
      company: inv.company?.businessName ?? `Empresa #${inv.companyId}`,
      client: inv.client?.businessName ?? `Cliente #${inv.clientId}`,
      baseAmount: inv.baseAmount,
      vat: totalVAT,
      irpf: inv.irpfAmount,
      re: inv.reAmount,
      total: inv.totalAmount,
      notes: inv.notes ?? '',
    });
  });

  await downloadWorkbook(workbook, 'facturas');
};

export const exportClientsToExcel = async (clients: Client[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Clientes');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Nombre', key: 'name', width: 25 },
    { header: 'CIF/NIF', key: 'taxId', width: 15 },
    { header: 'Dirección', key: 'address', width: 35 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Teléfono', key: 'phone', width: 15 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  clients.forEach(client => {
    worksheet.addRow({
      id: client.id,
      name: client.businessName,
      taxId: client.taxId,
      address: client.address,
      email: client.email,
      phone: client.phone || '',
    });
  });

  await downloadWorkbook(workbook, 'clientes');
};

export const exportCompaniesToExcel = async (companies: Company[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Empresas');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Nombre', key: 'name', width: 25 },
    { header: 'CIF', key: 'taxId', width: 15 },
    { header: 'Dirección', key: 'address', width: 35 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Teléfono', key: 'phone', width: 15 },
  ];

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  companies.forEach(company => {
    worksheet.addRow({
      id: company.id,
      name: company.businessName,
      taxId: company.taxId,
      address: company.address,
      email: company.email,
      phone: company.phone || '',
    });
  });

  await downloadWorkbook(workbook, 'empresas');
};

// Generic export function
export const exportToExcel = async <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  sheetName: string = 'Data'
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (data.length > 0) {
    // Auto-generate columns from first object keys
    const keys = Object.keys(data[0]);
    worksheet.columns = keys.map(key => ({
      header: key,
      key: key,
      width: 15,
    }));

    worksheet.getRow(1).font = { bold: true };

    data.forEach(row => {
      worksheet.addRow(row);
    });
  }

  await downloadWorkbook(workbook, filename);
};
