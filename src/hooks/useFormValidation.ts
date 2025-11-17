import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

interface ValidationError {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, any>>(schema: ZodSchema<T>) {
  const [errors, setErrors] = useState<ValidationError>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(
    async (data: Partial<T>): Promise<boolean> => {
      setIsValidating(true);
      try {
        await schema.parseAsync(data);
        setErrors({});
        setIsValidating(false);
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const validationErrors: ValidationError = {};
          error.errors.forEach(err => {
            if (err.path) {
              validationErrors[err.path.join('.')] = err.message;
            }
          });
          setErrors(validationErrors);
        }
        setIsValidating(false);
        return false;
      }
    },
    [schema]
  );

  const validateField = useCallback(
    async (fieldName: keyof T, value: any): Promise<boolean> => {
      setIsValidating(true);
      try {
        const fieldSchema = schema.shape[fieldName];
        if (fieldSchema) {
          await fieldSchema.parseAsync(value);
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName as string];
            return newErrors;
          });
        }
        setIsValidating(false);
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          setErrors(prev => ({
            ...prev,
            [fieldName]: error.errors[0]?.message || 'Error de validación',
          }));
        }
        setIsValidating(false);
        return false;
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName as string];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValidating,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
  };
}
