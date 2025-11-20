import { useState } from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { Step1CompanySelect } from './Step1CompanySelect';
import { Step2ClientSelect } from './Step2ClientSelect';
import { Step3InvoiceData } from './Step3InvoiceData';
import { Step4AddItems } from './Step4AddItems';
import { Step5Review } from './Step5Review';
import { useCreateInvoice, useUpdateInvoice } from '../../hooks/useInvoices';
import type { CreateInvoiceRequest, InvoiceItem } from '@/types/invoice.types';

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

  const handleSubmit = async () => {
    try {
      if (mode === 'edit' && invoiceId) {
        // Para UPDATE enviamos los campos actualizables según UpdateInvoiceRequest del backend
        // Campos actualizables: settlementNumber, notes, items
        // Campos inmutables (NO se pueden cambiar): companyId, clientId, invoiceNumber, irpfPercentage, rePercentage

        // Remover campo 'id' de los items (el backend espera CreateInvoiceItemRequest que no tiene 'id')
        // En modo EDIT, los items vienen del backend con 'id', pero CreateInvoiceItemRequest no lo tiene
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        const itemsWithoutId = (formData.items || []).map(({ id: _id, ...item }: any) => item);

        const invoice = await updateMutation.mutateAsync({
          id: invoiceId,
          data: {
            settlementNumber: formData.settlementNumber,
            notes: formData.notes,
            items: itemsWithoutId,
          },
        });
        onSuccess(invoice.id);
      } else {
        const invoice = await createMutation.mutateAsync(formData as CreateInvoiceRequest);
        onSuccess(invoice.id);
      }
    } catch (error) {
      // Error is handled by the mutation
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} invoice:`, error);
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
