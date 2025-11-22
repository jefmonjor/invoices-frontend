/**
 * Validates Spanish Tax IDs (NIF, NIE, CIF)
 */

const DNI_REGEX = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
const NIE_REGEX = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
const CIF_REGEX = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i;

const CONTROL_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

export const validateDNI = (dni: string): boolean => {
    const str = dni.toUpperCase();
    if (!DNI_REGEX.test(str)) return false;

    const number = parseInt(str.substr(0, 8), 10);
    const letter = str.substr(8, 1);
    const calculatedLetter = CONTROL_LETTERS.charAt(number % 23);

    return letter === calculatedLetter;
};

export const validateNIE = (nie: string): boolean => {
    let str = nie.toUpperCase();
    if (!NIE_REGEX.test(str)) return false;

    // Replace X, Y, Z with 0, 1, 2
    str = str.replace('X', '0').replace('Y', '1').replace('Z', '2');

    const number = parseInt(str.substr(0, 8), 10);
    const letter = str.substr(8, 1);
    const calculatedLetter = CONTROL_LETTERS.charAt(number % 23);

    return letter === calculatedLetter;
};

export const validateCIF = (cif: string): boolean => {
    const str = cif.toUpperCase();
    if (!CIF_REGEX.test(str)) return false;

    const number = str.substr(1, 7);
    const control = str.charAt(8);

    let evenSum = 0;
    let oddSum = 0;
    let n: number;

    for (let i = 0; i < number.length; i++) {
        n = parseInt(number.charAt(i), 10);
        if (i % 2 === 0) {
            // Odd positions (1, 3, 5...) but 0-indexed is even
            n *= 2;
            oddSum += n < 10 ? n : n - 9;
        } else {
            evenSum += n;
        }
    }

    const sum = evenSum + oddSum;
    const unit = sum % 10;
    const digit = unit === 0 ? 0 : 10 - unit;

    const controlDigit = digit.toString();
    const controlLetter = 'JABCDEFGHI'.charAt(digit);

    // CIF can end in digit or letter depending on type
    return control === controlDigit || control === controlLetter;
};

export const validateSpanishTaxId = (value: string): boolean => {
    if (!value) return false;
    const str = value.trim().toUpperCase();
    return validateDNI(str) || validateNIE(str) || validateCIF(str);
};
