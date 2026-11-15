import { withAlpha } from './palette';

/**
 * Categorías de gastos de SplitPay.
 * `icon` (emoji) se conserva por compatibilidad con datos guardados;
 * la interfaz usa `vectorIcon` (Ionicons) sobre una ficha teñida con `color`.
 */
const make = (id, name, icon, vectorIcon, color, description) => ({
  id,
  name,
  icon,
  vectorIcon,
  color,
  bgColor: withAlpha(color, 0.14), // transparente: se ve bien en modo claro y oscuro
  description,
});

export const CATEGORIES = {
  comida: make('comida', 'Comida', '🍕', 'restaurant', '#F2501F', 'Restaurantes, delivery, súper, snacks'),
  transporte: make('transporte', 'Transporte', '🚕', 'car', '#1E6BFF', 'Taxis, gasolina, pasajes, peajes'),
  casa: make('casa', 'Casa', '🏠', 'home', '#C77700', 'Alquiler, luz, agua, internet, hogar'),
  ocio: make('ocio', 'Ocio', '🍻', 'beer', '#9B3DFF', 'Salidas, cine, juegos, celebraciones'),
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const getCategoryById = (id) => {
  if (!id) return CATEGORIES.comida;
  return CATEGORIES[String(id).toLowerCase()] || CATEGORIES.comida;
};