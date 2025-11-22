/**
 * Spanish Tax ID Validator
 * Validates DNI, NIE, and CIF (Spanish fiscal identification numbers)
 */

const CIF_REGEX = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/i;

const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';
const NIE_PREFIX_MAP: Record<string, string> = { X: '0', Y: '1', Z: '2' };

/**
 * Validates a Spanish DNI (Documento Nacional de Identidad)
 * Format: 8 digits + 1 letter (e.g., 12345678Z)
 */
export function validateDNI(dni: string): boolean {
    if (!dni) return false;

    const clean = dni.toUpperCase().replace(/[^0-9A-Z]/g, '');

    if (!/^\d{8}[A-Z]$/.test(clean)) {
        return false;
    }

    const number = parseInt(clean.substring(0, 8), 10);
    const letter = clean.charAt(8);
    const expectedLetter = DNI_LETTERS.charAt(number % 23);

    return letter === expectedLetter;
}

/**
 * Validates a Spanish NIE (Número de Identidad de Extranjero)
 * Format: X/Y/Z + 7 digits + 1 letter (e.g., X1234567L)
 */
export function validateNIE(nie: string): boolean {
    if (!nie) return false;

    const clean = nie.toUpperCase().replace(/[^0-9A-Z]/g, '');

    if (!/^[XYZ]\d{7}[A-Z]$/.test(clean)) {
        return false;
    }

    const prefix = clean.charAt(0);
    const nieAsNumber = NIE_PREFIX_MAP[prefix] + clean.substring(1, 8);
    const number = parseInt(nieAsNumber, 10);
    const letter = clean.charAt(8);
    const expectedLetter = DNI_LETTERS.charAt(number % 23);

    return letter === expectedLetter;
}

/**
 * Validates a Spanish CIF (Código de Identificación Fiscal)
 * Format: Letter + 7 digits + control digit/letter
 */
export function validateCIF(cif: string): boolean {
    if (!cif) return false;

    const clean = cif.toUpperCase().replace(/[^0-9A-Z]/g, '');

    if (!CIF_REGEX.test(clean)) {
        return false;
    }

    const letter = clean.charAt(0);
    const numbers = clean.substring(1, 8);
    const control = clean.charAt(8);

    // Calculate control digit
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        const digit = parseInt(numbers.charAt(i), 10);
        if (i % 2 === 0) {
            // Even positions (0, 2, 4, 6) - double and sum digits
            const doubled = digit * 2;
            sum += Math.floor(doubled / 10) + (doubled % 10);
        } else {
            // Odd positions (1, 3, 5)
            sum += digit;
        }
    }

    const unitDigit = sum % 10;
    const controlDigit = unitDigit === 0 ? 0 : 10 - unitDigit;

    // Organizations starting with K, P, Q, S use letter control
    const useLetterControl = ['K', 'P', 'Q', 'S'].includes(letter);

    if (useLetterControl) {
        const controlLetter = 'JABCDEFGHI'.charAt(controlDigit);
        return control === controlLetter;
    } else {
        return control === controlDigit.toString() || control === 'JABCDEFGHI'.charAt(controlDigit);
    }
}

/**
 * Validates any Spanish tax ID (DNI, NIE, or CIF)
 * Returns an object with validation result and detected type
 */
export function validateSpanishTaxId(taxId: string): {
    valid: boolean;
    type: 'DNI' | 'NIE' | 'CIF' | 'UNKNOWN';
    message: string;
} {
    if (!taxId || taxId.trim().length === 0) {
        return { valid: false, type: 'UNKNOWN', message: 'El identificador fiscal es obligatorio' };
    }

    const clean = taxId.toUpperCase().replace(/[^0-9A-Z]/g, '');

    // Check DNI
    if (/^\d{8}[A-Z]$/.test(clean)) {
        const isValid = validateDNI(clean);
        return {
            valid: isValid,
            type: 'DNI',
            message: isValid ? 'DNI válido' : 'DNI inválido - Letra de control incorrecta'
        };
    }

    // Check NIE
    if (/^[XYZ]\d{7}[A-Z]$/.test(clean)) {
        const isValid = validateNIE(clean);
        return {
            valid: isValid,
            type: 'NIE',
            message: isValid ? 'NIE válido' : 'NIE inválido - Letra de control incorrecta'
        };
    }

    // Check CIF
    if (CIF_REGEX.test(clean)) {
        const isValid = validateCIF(clean);
        return {
            valid: isValid,
            type: 'CIF',
            message: isValid ? 'CIF válido' : 'CIF inválido - Dígito/letra de control incorrecta'
        };
    }

    return {
        valid: false,
        type: 'UNKNOWN',
        message: 'Formato de identificador fiscal no reconocido (debe ser DNI, NIE o CIF)'
    };
}

/**
 * Format a Spanish tax ID with proper separators
 */
export function formatSpanishTaxId(taxId: string): string {
    if (!taxId) return '';

    const clean = taxId.toUpperCase().replace(/[^0-9A-Z]/g, '');
    const validation = validateSpanishTaxId(clean);

    if (!validation.valid) return clean;

    // Format based on type
    if (validation.type === 'DNI') {
        return `${clean.substring(0, 8)}-${clean.charAt(8)}`;
    }

    if (validation.type === 'NIE') {
        return `${clean.charAt(0)}-${clean.substring(1, 8)}-${clean.charAt(8)}`;
    }

    if (validation.type === 'CIF') {
        return `${clean.charAt(0)}-${clean.substring(1, 8)}-${clean.charAt(8)}`;
    }

    return clean;
}
