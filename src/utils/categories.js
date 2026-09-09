/**
 * Definición centralizada de categorías, íconos y colores para SplitPay
 */

export const CATEGORIES = {
  comida: {
    id: 'comida',
    name: 'Comida',
    icon: '🍕',
    vectorIcon: 'fast-food',
    color: '#f97316', // Orange
    bgColor: '#ffedd5',
    description: 'Restaurantes, delivery, compras de súper, snacks',
  },
  transporte: {
    id: 'transporte',
    name: 'Transporte',
    icon: '🚕',
    vectorIcon: 'car',
    color: '#3b82f6', // Blue
    bgColor: '#dbeafe',
    description: 'Taxis, gasolina, pasajes, peajes',
  },
  casa: {
    id: 'casa',
    name: 'Casa',
    icon: '🏠',
    vectorIcon: 'home',
    color: '#10b981', // Emerald / Green
    bgColor: '#d1fae5',
    description: 'Alquiler, servicios de luz/agua/internet, artículos de hogar',
  },
  ocio: {
    id: 'ocio',
    name: 'Ocio',
    icon: '🍻',
    vectorIcon: 'beer',
    color: '#a855f7', // Purple
    bgColor: '#f3e8ff',
    description: 'Salidas, cine, juegos, celebraciones y eventos',
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

/**
 * Obtiene la categoría por ID con fallback a 'comida'
 * @param {string} id 
 */
export const getCategoryById = (id) => {
  if (!id) return CATEGORIES.comida;
  const key = id.toLowerCase();
  return CATEGORIES[key] || CATEGORIES.comida;
};
