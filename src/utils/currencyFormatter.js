/**
 * Utilidad centralizada para formatear montos en moneda Soles (S/.)
 * 
 * Regla del proyecto: La moneda utilizada en toda la aplicación es soles (S/.),
 * por ejemplo S/. 45.50.
 */

/**
 * Formatea un número o string a formato de moneda peruana S/. XX.XX
 * @param {number|string} amount - Monto numérico
 * @param {boolean} [showSymbol=true] - Si debe incluir el prefijo S/.
 * @returns {string} Ejemplo: "S/. 45.50"
 */
export const formatCurrency = (amount, showSymbol = true) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return showSymbol ? 'S/. 0.00' : '0.00';
  }

  const formatted = numericAmount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `S/. ${formatted}` : formatted;
};

/**
 * Parsea un string con formato o coma a número flotante válido
 * @param {string|number} input 
 * @returns {number}
 */
export const parseCurrencyInput = (input) => {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  const cleaned = input.toString().replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};
