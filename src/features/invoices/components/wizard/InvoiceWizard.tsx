import { useState } from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { pdf } from '@react-pdf/renderer';
import { InvoiceDocument } from '../pdf/InvoiceDocument';
import { useCreateInvoice, useUpdateInvoice, useUploadDocument, useInvoice } from '../../hooks/useInvoices';
import type { CreateInvoiceRequest, InvoiceItem, Invoice } from '@/types/invoice.types';
import { useCompanies } from '@/features/companies/hooks/useCompanies';
import { useClients } from '@/features/clients/hooks/useClients';
import { Step1CompanySelect } from './Step1CompanySelect';
import { Step2ClientSelect } from './Step2ClientSelect';
import { Step3InvoiceData } from './Step3InvoiceData';
import { Step4AddItems } from './Step4AddItems';
import { Step5Review } from './Step5Review';

const steps = ['Empresa', 'Cliente', 'Datos', 'Items', 'Revisar'];

interface InvoiceWizardProps {
  mode?: 'create' | 'edit';
  invoiceId?: number;
  initialData?: Partial<CreateInvoiceRequest>;
  onSuccess: (invoiceId: number) => void;
  onCancel: () => void;
}

export const InvoiceWizard: React.FC<InvoiceWizardProps> = ({
  mode = 'create',
  invoiceId,
  initialData,
  onSuccess,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateInvoiceRequest>>(
    initialData || { items: [] }
  );

  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const uploadDocumentMutation = useUploadDocument();

  // Fetch data needed for PDF generation
  const { data: companies } = useCompanies();
  const { data: clients } = useClients();
  useInvoice(invoiceId || 0); // Prefetch or keep in cache if needed, but we don't use the return value here directly

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const updateFormData = (data: Partial<CreateInvoiceRequest>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    handleNext();
  };

  const updateItems = (items: InvoiceItem[]) => {
    setFormData((prev) => ({ ...prev, items }));
    handleNext();
  };

  const generateAndUploadPdf = async (invoice: Invoice) => {
    try {
      // Find company and client details from cache
      // These should be available from the wizard steps
      const company = companies?.find(c => c.id === invoice.companyId);
      const client = clients?.find(c => c.id === invoice.clientId);

      if (!company || !client) {
        console.warn('Company or Client not found for PDF generation', {
          companyId: invoice.companyId,
          clientId: invoice.clientId
        });
        // Don't block invoice creation if PDF generation fails
        return;
      }

      // Generate PDF blob using React-PDF
      const blob = await pdf(
        <InvoiceDocument
          invoice={invoice}
          company={company}
          client={client}
        />
      ).toBlob();

      // Create file from blob with invoice number as filename
      const filename = `${invoice.invoiceNumber}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      // Upload file to backend (POST /api/documents)
      // Backend will store in MinIO and save reference in DB
      // Use silent mode to avoid double toast (invoice creation already shows success)
      await uploadDocumentMutation.mutateAsync({
        file,
        invoiceId: invoice.id,
        silent: true
      });

    } catch (error) {
      console.error('Error generating or uploading PDF:', error);
      // Don't block success flow if PDF generation fails
      // User can regenerate PDF later if needed
      // Toast notification is handled by the mutation hook
    }
  };

  const handleSubmit = async () => {
    try {
      let invoice: Invoice;

      if (mode === 'edit' && invoiceId) {
        // INMUTABLES (backend rechazará cambios): companyId, invoiceNumber
        // ACTUALIZABLES: clientId, irpfPercentage, rePercentage, settlementNumber, notes, items

        // Remover campo 'id' de los items (el backend espera CreateInvoiceItemRequest que no tiene 'id')
        // En modo EDIT, los items vienen del backend con 'id', pero CreateInvoiceItemRequest no lo tiene
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        const itemsWithoutId = (formData.items || []).map(({ id: _id, ...item }: any) => item);

        invoice = await updateMutation.mutateAsync({
          id: invoiceId,
          data: {
            // Campos inmutables - enviamos para validación
            companyId: formData.companyId,
            invoiceNumber: formData.invoiceNumber,
            // Campos actualizables
            clientId: formData.clientId,
            irpfPercentage: formData.irpfPercentage,
            rePercentage: formData.rePercentage,
            settlementNumber: formData.settlementNumber,
            notes: formData.notes,
            items: itemsWithoutId,
          },
        });
      } else {
        invoice = await createMutation.mutateAsync(formData as CreateInvoiceRequest);
      }

      // Generate and upload PDF after successful invoice creation/update
      await generateAndUploadPdf(invoice);

      onSuccess(invoice.id);
    } catch (error) {
      // Error is handled by the mutation
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} invoice: `, error);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Step1CompanySelect
            initialValue={formData.companyId}
            onNext={(companyId) => updateFormData({ companyId })}
            onCancel={onCancel}
          />
        );
      case 1:
        return (
          <Step2ClientSelect
            initialValue={formData.clientId}
            onNext={(clientId) => updateFormData({ clientId })}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step3InvoiceData
            initialValues={{
              invoiceNumber: formData.invoiceNumber,
              settlementNumber: formData.settlementNumber,
              irpfPercentage: formData.irpfPercentage,
              rePercentage: formData.rePercentage,
              notes: formData.notes,
            }}
            onNext={(data) => updateFormData(data)}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <Step4AddItems
            initialItems={formData.items || []}
            onNext={updateItems}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <Step5Review
            formData={formData as CreateInvoiceRequest}
            onSubmit={handleSubmit}
            onBack={handleBack}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            mode={mode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ minHeight: 400 }}>{renderStepContent(activeStep)}</Box>
    </Box>
  );
};
