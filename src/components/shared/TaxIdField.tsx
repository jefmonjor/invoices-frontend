import React, { useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { validateSpanishTaxId } from '@/utils/validators/spanishTaxId';

interface TaxIdFieldProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    name?: string;
    required?: boolean;
    onValidation?: (valid: boolean, type: string) => void;
}

/**
 * Tax ID input field with real-time validation
 * Validates DNI, NIE, and CIF formats
 */
const TaxIdField: React.FC<TaxIdFieldProps> = ({
    value,
    onChange,
    label = 'CIF/NIF/NIE',
    name = 'taxId',
    required = true,
    onValidation,
}) => {
    const [error, setError] = useState<string>('');
    const [isValid, setIsValid] = useState<boolean>(false);
    const [touched, setTouched] = useState<boolean>(false);

    const handleBlur = () => {
        setTouched(true);
        if (!value) {
            setError('El identificador fiscal es obligatorio');
            setIsValid(false);
            onValidation?.(false, 'UNKNOWN');
            return;
        }

        const result = validateSpanishTaxId(value);
        setIsValid(result.valid);
        setError(result.valid ? '' : result.message);
        onValidation?.(result.valid, result.type);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '');
        onChange(newValue);

        // Clear error when user starts typing
        if (touched && error) {
            setError('');
        }
    };

    return (
        <TextField
            fullWidth
            name={name}
            label={label}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            required={required}
            error={touched && !!error}
            helperText={touched ? error : 'Formato: DNI (12345678Z), NIE (X1234567L), CIF (A58818501)'}
            InputProps={{
                endAdornment: touched && (
                    <InputAdornment position="end">
                        {isValid ? (
                            <CheckCircleIcon color="success" titleAccess="Válido" />
                        ) : error ? (
                            <ErrorIcon color="error" titleAccess="Inválido" />
                        ) : null}
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default TaxIdField;
