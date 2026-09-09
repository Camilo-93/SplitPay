import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  GROUPS: '@splitpay_groups',
  EXPENSES: '@splitpay_expenses',
  CURRENT_USER_ID: '@splitpay_current_user_id',
  THEME_PREFERENCE: '@splitpay_theme_pref',
};

// Usuario actual por defecto (el usuario del dispositivo, ej. "Camilo")
export const CURRENT_USER = {
  id: 'user_camilo_01',
  name: 'Camilo (Tú)',
  email: 'camilo@splitpay.pe',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
};

// Datos semilla de ejemplo inicial para demostración inmediata
const INITIAL_GROUPS = [
  {
    id: 'grp_depa_01',
    name: 'Depa Universitario 🏢',
    description: 'Gastos de convivencia, servicios y compras del departamento',
    icon: '🏢',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    members: [
      CURRENT_USER,
      {
        id: 'usr_alejandro_02',
        name: 'Alejandro',
        email: 'alejandro@splitpay.pe',
        phone: '987654321',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr_lucia_03',
        name: 'Lucía',
        email: 'lucia@splitpay.pe',
        phone: '912345678',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'grp_viaje_02',
    name: 'Viaje de Fin de Ciclo 🏖️',
    description: 'Cusco / Máncora - Hospedaje, comida y tours',
    icon: '🏖️',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    members: [
      CURRENT_USER,
      {
        id: 'usr_alejandro_02',
        name: 'Alejandro',
        email: 'alejandro@splitpay.pe',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr_diego_04',
        name: 'Diego',
        email: 'diego@splitpay.pe',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr_valeria_05',
        name: 'Valeria',
        email: 'valeria@splitpay.pe',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      },
    ],
  },
  {
    id: 'grp_pichanga_03',
    name: 'Pichanga de los Viernes ⚽',
    description: 'Canchita sintética, hidratación y tercer tiempo',
    icon: '⚽',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    members: [
      CURRENT_USER,
      {
        id: 'usr_alejandro_02',
        name: 'Alejandro',
        email: 'alejandro@splitpay.pe',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr_diego_04',
        name: 'Diego',
        email: 'diego@splitpay.pe',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
    ],
  },
];

const INITIAL_EXPENSES = [
  {
    id: 'exp_01',
    groupId: 'grp_depa_01',
    description: 'Pizza familiar de estudio',
    amount: 54.0,
    category: 'comida',
    paidById: 'user_camilo_01',
    splitWithIds: ['user_camilo_01', 'usr_alejandro_02', 'usr_lucia_03'],
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    receiptImage: null,
    location: { address: 'Av. Universitaria 1801, San Miguel' },
  },
  {
    id: 'exp_02',
    groupId: 'grp_depa_01',
    description: 'Recibo de Internet Fibra Óptica',
    amount: 120.0,
    category: 'casa',
    paidById: 'usr_alejandro_02',
    splitWithIds: ['user_camilo_01', 'usr_alejandro_02', 'usr_lucia_03'],
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
    receiptImage: null,
    location: { address: 'Claro Hogar Lima' },
  },
  {
    id: 'exp_03',
    groupId: 'grp_depa_01',
    description: 'Compras de despensa para la semana',
    amount: 85.5,
    category: 'comida',
    paidById: 'user_camilo_01',
    splitWithIds: ['user_camilo_01', 'usr_lucia_03'],
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    receiptImage: null,
    location: { address: 'Plaza Vea Brasil' },
  },
  {
    id: 'exp_04',
    groupId: 'grp_viaje_02',
    description: 'Alquiler de casa de playa fin de semana',
    amount: 400.0,
    category: 'casa',
    paidById: 'usr_diego_04',
    splitWithIds: ['user_camilo_01', 'usr_alejandro_02', 'usr_diego_04', 'usr_valeria_05'],
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    receiptImage: null,
    location: { address: 'Punta Hermosa, Lima' },
  },
  {
    id: 'exp_05',
    groupId: 'grp_viaje_02',
    description: 'Peajes y gasolina ruta sur',
    amount: 80.0,
    category: 'transporte',
    paidById: 'user_camilo_01',
    splitWithIds: ['user_camilo_01', 'usr_alejandro_02', 'usr_diego_04', 'usr_valeria_05'],
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    receiptImage: null,
    location: { address: 'Peaje Villa Panamericana' },
  },
  {
    id: 'exp_06',
    groupId: 'grp_pichanga_03',
    description: 'Alquiler de canchita de fútbol',
    amount: 90.0,
    category: 'ocio',
    paidById: 'usr_alejandro_02',
    splitWithIds: ['user_camilo_01', 'usr_alejandro_02', 'usr_diego_04'],
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    receiptImage: null,
    location: { address: 'Complejo Deportivo El Golazo' },
  },
];

export const storageService = {
  /**
   * Obtiene todos los grupos persistidos o inicializa con datos semilla
   */
  async getGroups() {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.GROUPS);
      if (jsonValue !== null) {
        return JSON.parse(jsonValue);
      }
      // Si está vacío, inicializamos con los datos semilla
      await this.saveGroups(INITIAL_GROUPS);
      return INITIAL_GROUPS;
    } catch (error) {
      console.error('[storageService] Error al obtener grupos:', error);
      return INITIAL_GROUPS;
    }
  },

  /**
   * Guarda la lista completa de grupos
   */
  async saveGroups(groups) {
    try {
      const jsonValue = JSON.stringify(groups);
      await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, jsonValue);
      return true;
    } catch (error) {
      console.error('[storageService] Error al guardar grupos:', error);
      return false;
    }
  },

  /**
   * Añade o actualiza un grupo individual
   */
  async saveGroup(group) {
    try {
      const groups = await this.getGroups();
      const index = groups.findIndex((g) => g.id === group.id);
      let updatedGroups;
      if (index >= 0) {
        updatedGroups = [...groups];
        updatedGroups[index] = group;
      } else {
        updatedGroups = [group, ...groups];
      }
      await this.saveGroups(updatedGroups);
      return updatedGroups;
    } catch (error) {
      console.error('[storageService] Error al guardar grupo individual:', error);
      return null;
    }
  },

  /**
   * Elimina un grupo por ID
   */
  async deleteGroup(groupId) {
    try {
      const groups = await this.getGroups();
      const filtered = groups.filter((g) => g.id !== groupId);
      await this.saveGroups(filtered);

      // También eliminamos los gastos asociados
      const expenses = await this.getExpenses();
      const filteredExpenses = expenses.filter((e) => e.groupId !== groupId);
      await this.saveExpenses(filteredExpenses);

      return filtered;
    } catch (error) {
      console.error('[storageService] Error al eliminar grupo:', error);
      return null;
    }
  },

  /**
   * Obtiene todos los gastos o filtra por groupId
   */
  async getExpenses(groupId = null) {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      let allExpenses = jsonValue !== null ? JSON.parse(jsonValue) : [];
      if (jsonValue === null) {
        await this.saveExpenses(INITIAL_EXPENSES);
        allExpenses = INITIAL_EXPENSES;
      }

      if (groupId) {
        return allExpenses.filter((e) => e.groupId === groupId);
      }
      return allExpenses;
    } catch (error) {
      console.error('[storageService] Error al obtener gastos:', error);
      return groupId ? INITIAL_EXPENSES.filter((e) => e.groupId === groupId) : INITIAL_EXPENSES;
    }
  },

  /**
   * Guarda la lista completa de gastos
   */
  async saveExpenses(expenses) {
    try {
      const jsonValue = JSON.stringify(expenses);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, jsonValue);
      return true;
    } catch (error) {
      console.error('[storageService] Error al guardar gastos:', error);
      return false;
    }
  },

  /**
   * Agrega un nuevo gasto a la persistencia
   */
  async addExpense(expense) {
    try {
      const expenses = await this.getExpenses();
      const updated = [expense, ...expenses];
      await this.saveExpenses(updated);
      return updated;
    } catch (error) {
      console.error('[storageService] Error al agregar gasto:', error);
      return null;
    }
  },

  /**
   * Elimina un gasto por ID
   */
  async deleteExpense(expenseId) {
    try {
      const expenses = await this.getExpenses();
      const filtered = expenses.filter((e) => e.id !== expenseId);
      await this.saveExpenses(filtered);
      return filtered;
    } catch (error) {
      console.error('[storageService] Error al eliminar gasto:', error);
      return null;
    }
  },

  /**
   * Registra un pago/liquidación para saldar deuda
   */
  async recordSettlement({ groupId, fromMemberId, toMemberId, amount, method = 'Yape' }) {
    const settlementExpense = {
      id: `stl_${Date.now()}`,
      groupId,
      description: `Pago de liquidación vía ${method}`,
      amount: Number(amount),
      category: 'ocio', // O categoría general de liquidación
      paidById: fromMemberId,
      splitWithIds: [toMemberId], // Solo participa el receptor, saldando la deuda
      isSettlement: true,
      settlementMethod: method,
      date: new Date().toISOString(),
      receiptImage: null,
    };
    return await this.addExpense(settlementExpense);
  },

  /**
   * Guarda la preferencia de tema (claro/oscuro)
   */
  async getThemePreference() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
    } catch (error) {
      return null;
    }
  },

  async setThemePreference(theme) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
    } catch (error) {
      console.error('[storageService] Error guardando tema:', error);
    }
  },

  /**
   * Reinicia la persistencia a los datos iniciales
   */
  async resetToSeedData() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(INITIAL_GROUPS));
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      return { groups: INITIAL_GROUPS, expenses: INITIAL_EXPENSES };
    } catch (error) {
      console.error('[storageService] Error reseteando datos:', error);
      return null;
    }
  },
};
