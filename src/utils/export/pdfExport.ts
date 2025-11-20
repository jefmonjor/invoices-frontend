import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InvoiceItem } from '@/types/invoice.types';
import { formatCurrency, formatDate } from '@/utils/formatters';

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
  items: InvoiceItem[];
  company?: {
    businessName: string;
    address: string;
    taxId: string;
  };
  client?: {
    businessName: string;
    address: string;
    taxId: string;
  };
}

// Helper to calculate item total
const calculateItemTotal = (item: InvoiceItem): number => {
  const subtotal = item.units * item.price;
  const discount = subtotal * ((item.discountPercentage || 0) / 100);
  const afterDiscount = subtotal - discount;
  const vat = afterDiscount * (item.vatPercentage / 100);
  return afterDiscount + vat;
};

export const exportInvoiceToPDF = (invoice: InvoiceWithDetails) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('FACTURA', 105, 20, { align: 'center' });

  // Invoice info
  doc.setFontSize(10);
  doc.text(`Número: ${invoice.invoiceNumber}`, 20, 40);
  doc.text(`Fecha: ${formatDate(invoice.issueDate)}`, 20, 46);
  if (invoice.notes) {
    doc.text(`Notas: ${invoice.notes}`, 20, 52);
  }

  // Company info (if available)
  if (invoice.company) {
    doc.setFontSize(12);
    doc.text('Empresa:', 20, 70);
    doc.setFontSize(10);
    doc.text(invoice.company.businessName, 20, 76);
    doc.text(invoice.company.address, 20, 82);
    doc.text(`CIF: ${invoice.company.taxId}`, 20, 88);
  } else {
    doc.setFontSize(10);
    doc.text(`Empresa ID: ${invoice.companyId}`, 20, 70);
  }

  // Client info (if available)
  if (invoice.client) {
    doc.setFontSize(12);
    doc.text('Cliente:', 120, 70);
    doc.setFontSize(10);
    doc.text(invoice.client.businessName, 120, 76);
    doc.text(invoice.client.address, 120, 82);
    doc.text(`CIF: ${invoice.client.taxId}`, 120, 88);
  } else {
    doc.setFontSize(10);
    doc.text(`Cliente ID: ${invoice.clientId}`, 120, 70);
  }

  // Items table
  const tableData = invoice.items.map(item => [
    item.description,
    item.units,
    formatCurrency(item.price),
    `${item.vatPercentage}%`,
    `${item.discountPercentage}%`,
    formatCurrency(calculateItemTotal(item)),
  ]);

  autoTable(doc, {
    startY: 100,
    head: [['Descripción', 'Unidades', 'Precio Unit.', 'IVA', 'Desc.', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Totals
  const finalY = (doc as typeof jsPDF.prototype & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  // Calculate VAT: totalAmount = baseAmount + VAT - IRPF + RE
  const totalVAT = invoice.totalAmount - invoice.baseAmount + invoice.irpfAmount - invoice.reAmount;

  doc.setFontSize(10);
  doc.text(`Base Imponible: ${formatCurrency(invoice.baseAmount)}`, 140, finalY);
  doc.text(`IVA: ${formatCurrency(totalVAT)}`, 140, finalY + 6);
  doc.text(`IRPF: ${formatCurrency(invoice.irpfAmount)}`, 140, finalY + 12);
  doc.text(`RE: ${formatCurrency(invoice.reAmount)}`, 140, finalY + 18);
  doc.setFontSize(12);
  doc.text(`TOTAL: ${formatCurrency(invoice.totalAmount)}`, 140, finalY + 26);

  // Save
  doc.save(`factura-${invoice.invoiceNumber}.pdf`);
};

export const exportInvoiceListToPDF = (invoices: InvoiceWithDetails[]) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Listado de Facturas', 105, 20, { align: 'center' });

  const tableData = invoices.map(inv => [
    inv.invoiceNumber,
    formatDate(inv.issueDate),
    inv.client?.businessName ?? `Cliente #${inv.clientId}`,
    formatCurrency(inv.totalAmount),
  ]);

  autoTable(doc, {
    startY: 30,
    head: [['N° Factura', 'Fecha', 'Cliente', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`facturas-${new Date().toISOString().split('T')[0]}.pdf`);
};
