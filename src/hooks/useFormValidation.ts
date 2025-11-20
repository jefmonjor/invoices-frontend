import { useState, useCallback } from 'react';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

interface ValidationError {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, unknown>>(schema: ZodSchema<T>) {
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
          error.issues.forEach((err) => {
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
    async (fieldName: keyof T, value: unknown): Promise<boolean> => {
      setIsValidating(true);
      try {
        // Validate the entire object with just this field
        // This is simpler and more reliable than trying to access schema.shape
        const partialData = { [fieldName]: value } as Partial<T>;
        await schema.parseAsync(partialData);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName as string];
          return newErrors;
        });
        setIsValidating(false);
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.issues.find((err) => err.path[0] === fieldName);
          if (fieldError) {
            setErrors(prev => ({
              ...prev,
              [fieldName]: fieldError.message,
            }));
          }
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
