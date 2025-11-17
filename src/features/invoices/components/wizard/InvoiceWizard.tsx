import { useState } from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { Step1CompanySelect } from './Step1CompanySelect';
import { Step2ClientSelect } from './Step2ClientSelect';
import { Step3InvoiceData } from './Step3InvoiceData';
import { Step4AddItems } from './Step4AddItems';
import { Step5Review } from './Step5Review';
import { useCreateInvoice } from '../../hooks/useInvoices';
import type { CreateInvoiceRequest, InvoiceItem } from '@/types/invoice.types';

const steps = ['Empresa', 'Cliente', 'Datos', 'Items', 'Revisar'];

interface InvoiceWizardProps {
  onSuccess: (invoiceId: number) => void;
  onCancel: () => void;
}

export const InvoiceWizard: React.FC<InvoiceWizardProps> = ({ onSuccess, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateInvoiceRequest>>({
    items: [],
  });

  const createMutation = useCreateInvoice();

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
      const invoice = await createMutation.mutateAsync(formData as CreateInvoiceRequest);
      onSuccess(invoice.id);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Error creating invoice:', error);
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
              issueDate: formData.issueDate,
              dueDate: formData.dueDate,
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
            isSubmitting={createMutation.isPending}
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
