import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import type { Invoice, CompanyDTO, ClientDTO } from '@/types/invoice.types';

// Register fonts
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    ],
});

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Roboto',
        fontSize: 10,
        padding: 40,
        color: '#333',
        lineHeight: 1.5,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    invoiceTitle: {
        fontSize: 20,
        fontWeight: 700,
        color: '#2c3e50',
        textTransform: 'uppercase',
    },
    invoiceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        marginLeft: 20,
    },
    metaLabel: {
        fontSize: 8,
        color: '#999',
        textTransform: 'uppercase',
    },
    metaValue: {
        fontSize: 10,
        fontWeight: 700,
    },
    addressSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    addressCol: {
        width: '45%',
    },
    colTitle: {
        fontSize: 9,
        fontWeight: 700,
        color: '#999',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    entityName: {
        fontSize: 12,
        fontWeight: 700,
        color: '#2c3e50',
        marginBottom: 2,
    },
    entityInfo: {
        fontSize: 9,
        color: '#555',
    },
    table: {
        marginTop: 10,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#2c3e50',
        paddingBottom: 5,
        marginBottom: 5,
    },
    headerText: {
        fontSize: 8,
        fontWeight: 700,
        color: '#999',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    // Column widths
    colDesc: { width: '40%' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colDiscount: { width: '10%', textAlign: 'right' },
    colVat: { width: '10%', textAlign: 'right' },
    colTotal: { width: '15%', textAlign: 'right' },

    // Transport specific columns
    colDate: { width: '10%' },
    colPlate: { width: '10%' },
    colDescTransport: { width: '25%' },
    colZone: { width: '10%' },
    colOrder: { width: '10%' },

    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    totalsTable: {
        width: '35%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
    },
    totalLabel: {
        fontSize: 9,
        color: '#666',
    },
    totalValue: {
        fontSize: 9,
        fontWeight: 500,
        textAlign: 'right',
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 5,
    },
    grandTotalLabel: {
        fontSize: 11,
        fontWeight: 700,
        color: '#2c3e50',
    },
    grandTotalValue: {
        fontSize: 11,
        fontWeight: 700,
        color: '#2c3e50',
    },
    bottomSection: {
        marginTop: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    notesSection: {
        width: '60%',
    },
    ibanSection: {
        width: '35%',
    },
    bottomLabel: {
        fontSize: 8,
        fontWeight: 700,
        color: '#999',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    bottomText: {
        fontSize: 9,
        color: '#555',
    },
});

interface InvoiceDocumentProps {
    invoice: Invoice;
    company?: CompanyDTO;
    client?: ClientDTO;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(amount);
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES');
};

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice, company, client }) => {
    // Detect if this is a transport invoice based on item fields
    const isTransportInvoice = invoice.items.some(
        item => item.vehiclePlate || item.zone || item.orderNumber || item.itemDate
    );

    const calculateSubtotal = () => {
        return invoice.items.reduce((acc, item) => {
            const itemTotal = item.units * item.price;
            const discount = itemTotal * ((item.discountPercentage || 0) / 100);
            return acc + (itemTotal - discount);
        }, 0);
    };

    const calculateVatAmount = () => {
        return invoice.items.reduce((acc, item) => {
            const itemTotal = item.units * item.price;
            const discount = itemTotal * ((item.discountPercentage || 0) / 100);
            const taxable = itemTotal - discount;
            return acc + (taxable * (item.vatPercentage / 100));
        }, 0);
    };

    const calculateIrpfAmount = () => {
        const subtotal = calculateSubtotal();
        return subtotal * ((invoice.irpfPercentage || 0) / 100);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const vat = calculateVatAmount();
        const irpf = calculateIrpfAmount();
        return subtotal + vat - irpf;
    };

    const formatAddress = (dto?: CompanyDTO | ClientDTO) => {
        if (!dto) return '';
        return `${dto.address}, ${dto.postalCode} ${dto.city} (${dto.province})`;
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Top Bar: Title & Meta */}
                <View style={styles.topBar}>
                    <Text style={styles.invoiceTitle}>FACTURA</Text>
                    <View style={styles.invoiceMeta}>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Nº Factura</Text>
                            <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Fecha</Text>
                            <Text style={styles.metaValue}>{formatDate(invoice.issueDate)}</Text>
                        </View>
                        {invoice.settlementNumber && (
                            <View style={styles.metaItem}>
                                <Text style={styles.metaLabel}>Expediente</Text>
                                <Text style={styles.metaValue}>{invoice.settlementNumber}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Address Section: Company (Left) & Client (Right) */}
                <View style={styles.addressSection}>
                    <View style={styles.addressCol}>
                        <Text style={styles.colTitle}>De:</Text>
                        <Text style={styles.entityName}>{company?.businessName || 'EMPRESA'}</Text>
                        <Text style={styles.entityInfo}>{formatAddress(company)}</Text>
                        <Text style={styles.entityInfo}>NIF: {company?.taxId}</Text>
                        <Text style={styles.entityInfo}>{company?.email}</Text>
                        <Text style={styles.entityInfo}>{company?.phone}</Text>
                    </View>

                    <View style={styles.addressCol}>
                        <Text style={styles.colTitle}>Para:</Text>
                        <Text style={styles.entityName}>{client?.businessName}</Text>
                        <Text style={styles.entityInfo}>{formatAddress(client)}</Text>
                        <Text style={styles.entityInfo}>NIF: {client?.taxId}</Text>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        {isTransportInvoice ? (
                            <>
                                <Text style={[styles.headerText, styles.colDate]}>FECHA</Text>
                                <Text style={[styles.headerText, styles.colPlate]}>MATRÍCULA</Text>
                                <Text style={[styles.headerText, styles.colDescTransport]}>DESCRIPCIÓN</Text>
                                <Text style={[styles.headerText, styles.colZone]}>ZONA</Text>
                                <Text style={[styles.headerText, styles.colOrder]}>PEDIDO</Text>
                                <Text style={[styles.headerText, styles.colQty]}>CANT.</Text>
                                <Text style={[styles.headerText, styles.colPrice]}>PRECIO</Text>
                                <Text style={[styles.headerText, styles.colTotal]}>TOTAL</Text>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.headerText, styles.colDesc]}>DESCRIPCIÓN</Text>
                                <Text style={[styles.headerText, styles.colQty]}>CANT.</Text>
                                <Text style={[styles.headerText, styles.colPrice]}>PRECIO</Text>
                                <Text style={[styles.headerText, styles.colDiscount]}>DESC.</Text>
                                <Text style={[styles.headerText, styles.colVat]}>IVA</Text>
                                <Text style={[styles.headerText, styles.colTotal]}>TOTAL</Text>
                            </>
                        )}
                    </View>

                    {invoice.items.map((item, index) => {
                        const itemSubtotal = item.units * item.price;
                        const itemDiscount = itemSubtotal * ((item.discountPercentage || 0) / 100);
                        const itemTotal = itemSubtotal - itemDiscount;

                        return (
                            <View key={index} style={styles.tableRow}>
                                {isTransportInvoice ? (
                                    <>
                                        <Text style={styles.colDate}>{item.itemDate ? formatDate(item.itemDate) : '-'}</Text>
                                        <Text style={styles.colPlate}>{item.vehiclePlate || '-'}</Text>
                                        <Text style={styles.colDescTransport}>{item.description}</Text>
                                        <Text style={styles.colZone}>{item.zone || '-'}</Text>
                                        <Text style={styles.colOrder}>{item.orderNumber || '-'}</Text>
                                        <Text style={styles.colQty}>{item.units}</Text>
                                        <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
                                        <Text style={styles.colTotal}>{formatCurrency(itemTotal)}</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.colDesc}>{item.description}</Text>
                                        <Text style={styles.colQty}>{item.units}</Text>
                                        <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
                                        <Text style={styles.colDiscount}>{item.discountPercentage ? `${item.discountPercentage}%` : '-'}</Text>
                                        <Text style={styles.colVat}>{item.vatPercentage}%</Text>
                                        <Text style={styles.colTotal}>{formatCurrency(itemTotal)}</Text>
                                    </>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalsTable}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Base Imponible</Text>
                            <Text style={styles.totalValue}>{formatCurrency(calculateSubtotal())}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>IVA</Text>
                            <Text style={styles.totalValue}>{formatCurrency(calculateVatAmount())}</Text>
                        </View>
                        {invoice.irpfPercentage > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>IRPF ({invoice.irpfPercentage}%)</Text>
                                <Text style={styles.totalValue}>-{formatCurrency(calculateIrpfAmount())}</Text>
                            </View>
                        )}
                        <View style={styles.grandTotal}>
                            <Text style={styles.grandTotalLabel}>TOTAL</Text>
                            <Text style={styles.grandTotalValue}>{formatCurrency(calculateTotal())}</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Section: Notes & IBAN */}
                <View style={styles.bottomSection}>
                    <View style={styles.notesSection}>
                        {invoice.notes && (
                            <>
                                <Text style={styles.bottomLabel}>Observaciones</Text>
                                <Text style={styles.bottomText}>{invoice.notes}</Text>
                            </>
                        )}
                    </View>

                    <View style={styles.ibanSection}>
                        {company?.iban && (
                            <>
                                <Text style={styles.bottomLabel}>Datos de Pago</Text>
                                <Text style={styles.bottomText}>IBAN: {company.iban}</Text>
                            </>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    );
};
