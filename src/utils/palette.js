/**
 * Paleta de acentos para grupos y avatares.
 * El color se deriva de un identificador, así cada grupo/persona conserva siempre el mismo.
 */
export const TILE_COLORS = ['#FF5A36', '#2F7BFF', '#00B488', '#9B3DFF', '#FF2E88', '#00A9D4', '#FFA800'];

const hash = (s = '') => [...String(s)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);

export const groupColor = (key) => TILE_COLORS[hash(key) % TILE_COLORS.length];

/** Aplica transparencia a un color hexadecimal de 6 dígitos (#RRGGBB). */
export const withAlpha = (hex, alpha) =>
  `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;