import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import type { Invoice, CompanyDTO, ClientDTO } from '@/types/invoice.types';

// Register fonts
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
    ],
});

// Simple color palette
const colors = {
    border: '#999',
    headerBg: '#f5f5f5',
    text: '#333',
    textLight: '#666',
    accent: '#c00000',
};

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Roboto',
        fontSize: 8,
        padding: 25,
        paddingBottom: 50,
        color: colors.text,
    },
    // Header - NO BORDERS
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    logoSpace: {
        width: '25%',
        height: 45,
    },
    companyInfo: {
        width: '45%',
        textAlign: 'center',
    },
    companyName: {
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 2,
    },
    companyNif: {
        fontSize: 9,
        fontWeight: 700,
        marginBottom: 2,
    },
    companyAddress: {
        fontSize: 7,
        color: colors.textLight,
    },
    qrSpace: {
        width: '25%',
        height: 45,
        alignItems: 'flex-end',
    },
    // Meta - Simple inline text
    metaSection: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    metaItem: {
        marginRight: 20,
    },
    metaLabel: {
        fontSize: 7,
        color: colors.textLight,
    },
    metaValue: {
        fontSize: 9,
        fontWeight: 700,
    },
    // Client - Simple box
    clientSection: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    clientTitle: {
        fontSize: 8,
        fontWeight: 700,
        backgroundColor: colors.headerBg,
        padding: 3,
    },
    clientContent: {
        padding: 5,
    },
    clientName: {
        fontSize: 9,
        fontWeight: 700,
    },
    clientText: {
        fontSize: 7,
        color: colors.textLight,
    },
    // Table
    table: {
        flexGrow: 1,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.headerBg,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 3,
    },
    tableRow: {
        flexDirection: 'row',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
        paddingVertical: 2,
        minHeight: 11,
    },
    cellHeader: {
        fontSize: 7,
        fontWeight: 700,
        textAlign: 'center',
    },
    cell: {
        fontSize: 7,
        paddingHorizontal: 2,
    },
    // Standard invoice columns
    colDescStd: { width: '42%', textAlign: 'left', paddingLeft: 3 },
    colUdsStd: { width: '8%', textAlign: 'center' },
    colDtoStd: { width: '8%', textAlign: 'center' },
    colPriceStd: { width: '14%', textAlign: 'right' },
    colIvaStd: { width: '8%', textAlign: 'center' },
    colImporteStd: { width: '20%', textAlign: 'right', paddingRight: 3 },
    // Transport invoice columns
    colDateTr: { width: '10%', textAlign: 'center' },
    colPlateTr: { width: '10%', textAlign: 'center' },
    colDescTr: { width: '32%', textAlign: 'left', paddingLeft: 3 },
    colZoneTr: { width: '10%', textAlign: 'center' },
    colPriceTr: { width: '14%', textAlign: 'right' },
    colGasTr: { width: '8%', textAlign: 'center' },
    colImporteTr: { width: '16%', textAlign: 'right', paddingRight: 3 },
    // Footer Section - Only on page 1
    footerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    observaciones: {
        width: '55%',
    },
    observacionesLabel: {
        fontSize: 7,
        fontWeight: 700,
        color: colors.textLight,
        marginBottom: 2,
    },
    observacionesText: {
        fontSize: 7,
    },
    totalsBox: {
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    totalLabel: {
        fontSize: 10,
    },
    totalValue: {
        fontSize: 10,
        textAlign: 'right',
    },
    totalDivider: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginTop: 4,
        paddingTop: 4,
    },
    grandTotalLabel: {
        fontSize: 12,
        fontWeight: 700,
        color: colors.accent,
    },
    grandTotalValue: {
        fontSize: 12,
        fontWeight: 700,
        color: colors.accent,
    },
    // VeriFactu - Fixed at bottom
    verifactuFooter: {
        position: 'absolute',
        bottom: 25,
        left: 25,
        right: 25,
        textAlign: 'center',
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    verifactuText: {
        fontSize: 10,
        color: '#333',
    },
    pageNumber: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 7,
        color: '#999',
    },
});

interface InvoiceDocumentProps {
    invoice: Invoice;
    company?: CompanyDTO;
    client?: ClientDTO;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount) + ' €';
};

const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES');
};

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice, company, client }) => {
    // Detect invoice type
    const isTransportInvoice = invoice.items.some(
        item => item.vehiclePlate || item.zone || item.itemDate
    );

    // Calculations
    const baseAmount = invoice.baseAmount ?? invoice.items.reduce((acc, item) => {
        const itemTotal = item.units * item.price;
        const discount = itemTotal * ((item.discountPercentage || 0) / 100);
        return acc + (itemTotal - discount);
    }, 0);

    const vatAmount = invoice.items.reduce((acc, item) => {
        const itemTotal = item.units * item.price;
        const discount = itemTotal * ((item.discountPercentage || 0) / 100);
        return acc + ((itemTotal - discount) * (item.vatPercentage / 100));
    }, 0);

    const totalAmount = invoice.totalAmount ?? (baseAmount + vatAmount);
    const vatPercentage = invoice.items[0]?.vatPercentage || 21;

    // Render table header
    const renderTableHeader = () => (
        <View style={styles.tableHeader} fixed>
            {isTransportInvoice ? (
                <>
                    <Text style={[styles.cellHeader, styles.colDateTr]}>FECHA</Text>
                    <Text style={[styles.cellHeader, styles.colPlateTr]}>MATRÍCULA</Text>
                    <Text style={[styles.cellHeader, styles.colDescTr]}>CONCEPTO</Text>
                    <Text style={[styles.cellHeader, styles.colZoneTr]}>ZONA</Text>
                    <Text style={[styles.cellHeader, styles.colPriceTr]}>PRECIO</Text>
                    <Text style={[styles.cellHeader, styles.colGasTr]}>% GAS</Text>
                    <Text style={[styles.cellHeader, styles.colImporteTr]}>IMPORTE</Text>
                </>
            ) : (
                <>
                    <Text style={[styles.cellHeader, styles.colDescStd]}>Descripción producto/servicio</Text>
                    <Text style={[styles.cellHeader, styles.colUdsStd]}>Uds</Text>
                    <Text style={[styles.cellHeader, styles.colDtoStd]}>Dto%</Text>
                    <Text style={[styles.cellHeader, styles.colPriceStd]}>Precio</Text>
                    <Text style={[styles.cellHeader, styles.colIvaStd]}>IVA%</Text>
                    <Text style={[styles.cellHeader, styles.colImporteStd]}>Importe</Text>
                </>
            )}
        </View>
    );

    // Render table row
    const renderTableRow = (item: typeof invoice.items[0], index: number) => {
        const itemSubtotal = item.units * item.price;
        const itemDiscount = itemSubtotal * ((item.discountPercentage || 0) / 100);
        const itemTotal = itemSubtotal - itemDiscount;

        return (
            <View key={index} style={styles.tableRow} wrap={false}>
                {isTransportInvoice ? (
                    <>
                        <Text style={[styles.cell, styles.colDateTr]}>{item.itemDate ? formatDate(item.itemDate) : ''}</Text>
                        <Text style={[styles.cell, styles.colPlateTr]}>{item.vehiclePlate || ''}</Text>
                        <Text style={[styles.cell, styles.colDescTr]}>{item.description}</Text>
                        <Text style={[styles.cell, styles.colZoneTr]}>{item.zone || ''}</Text>
                        <Text style={[styles.cell, styles.colPriceTr]}>{formatCurrency(item.price)}</Text>
                        <Text style={[styles.cell, styles.colGasTr]}>{item.gasPercentage || ''}</Text>
                        <Text style={[styles.cell, styles.colImporteTr]}>{formatCurrency(itemTotal)}</Text>
                    </>
                ) : (
                    <>
                        <Text style={[styles.cell, styles.colDescStd]}>{item.description}</Text>
                        <Text style={[styles.cell, styles.colUdsStd]}>{item.units}</Text>
                        <Text style={[styles.cell, styles.colDtoStd]}>{item.discountPercentage || ''}</Text>
                        <Text style={[styles.cell, styles.colPriceStd]}>{formatCurrency(item.price)}</Text>
                        <Text style={[styles.cell, styles.colIvaStd]}>{item.vatPercentage}</Text>
                        <Text style={[styles.cell, styles.colImporteStd]}>{formatCurrency(itemTotal)}</Text>
                    </>
                )}
            </View>
        );
    };

    // Render footer with observaciones and totals
    const renderFooter = () => (
        <View style={styles.footerSection} wrap={false}>
            <View style={styles.observaciones}>
                <Text style={styles.observacionesLabel}>Observaciones / Datos de pago:</Text>
                {company?.iban && <Text style={styles.observacionesText}>IBAN: {company.iban}</Text>}
                {invoice.notes && <Text style={styles.observacionesText}>{invoice.notes}</Text>}
            </View>

            <View style={styles.totalsBox}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Base imponible:</Text>
                    <Text style={styles.totalValue}>{formatCurrency(baseAmount)}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>IVA ({vatPercentage}%):</Text>
                    <Text style={styles.totalValue}>{formatCurrency(vatAmount)}</Text>
                </View>
                <View style={[styles.totalRow, styles.totalDivider]}>
                    <Text style={styles.grandTotalLabel}>TOTAL:</Text>
                    <Text style={styles.grandTotalValue}>{formatCurrency(totalAmount)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header - Fixed on all pages */}
                <View style={styles.headerSection} fixed>
                    <View style={styles.logoSpace}>
                        {/* Future: <Image src={company?.logoUrl} /> */}
                    </View>
                    <View style={styles.companyInfo}>
                        <Text style={styles.companyName}>{company?.businessName || 'EMPRESA'}</Text>
                        {company?.taxId && <Text style={styles.companyNif}>{company.taxId}</Text>}
                        {company?.address && (
                            <Text style={styles.companyAddress}>
                                {company.address}, {company.postalCode} {company.city} ({company.province})
                            </Text>
                        )}
                        {company?.phone && <Text style={styles.companyAddress}>{company.phone}</Text>}
                    </View>
                    <View style={styles.qrSpace}>
                        {/* Future: <Image src={qrCodeUrl} /> */}
                    </View>
                </View>

                {/* Meta - Simple inline */}
                <View style={styles.metaSection}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>FACTURA Nº:</Text>
                        <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>FECHA:</Text>
                        <Text style={styles.metaValue}>{formatDate(invoice.issueDate)}</Text>
                    </View>
                    {invoice.settlementNumber && (
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>LIQUIDACIÓN Nº:</Text>
                            <Text style={styles.metaValue}>{invoice.settlementNumber}</Text>
                        </View>
                    )}
                </View>

                {/* Client */}
                <View style={styles.clientSection}>
                    <Text style={styles.clientTitle}>Datos del cliente</Text>
                    <View style={styles.clientContent}>
                        <Text style={styles.clientName}>{client?.businessName}</Text>
                        {client?.taxId && <Text style={styles.clientText}>{client.taxId}</Text>}
                        {client?.address && (
                            <Text style={styles.clientText}>
                                {client.address}, {client.postalCode} {client.city} - {client.province}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Items Table - wraps across pages as needed */}
                <View style={styles.table}>
                    {renderTableHeader()}
                    {invoice.items.map((item, index) => renderTableRow(item, index))}
                </View>

                {/* Footer with Observaciones + Totals - ONLY ONCE after all items (last page) */}
                {/* wrap={false} keeps this block together, placed after table ends */}
                {renderFooter()}

                {/* VeriFactu - Fixed at bottom of all pages */}
                <View style={styles.verifactuFooter} fixed>
                    <Text style={styles.verifactuText}>
                        Factura verificable en la sede electrónica de la AEAT - VERI*FACTU
                    </Text>
                </View>

                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) =>
                    `Página ${pageNumber} / ${totalPages}`
                } fixed />
            </Page>
        </Document>
    );
};
