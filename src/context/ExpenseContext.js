import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { storageService, CURRENT_USER } from '../services/storageService';
import { notificationService } from '../services/notificationService';

// Clave para notificaciones in-app en AsyncStorage
const NOTIF_STORAGE_KEY = '@splitpay_inapp_notifications';

const ExpenseContext = createContext({
  groups: [],
  expenses: [],
  currentUser: CURRENT_USER,
  isLoading: true,
  overallUserBalance: 0,
  inAppNotifications: [],
  unreadCount: 0,
  refreshData: async () => {},
  createGroup: async () => {},
  updateGroup: async () => {},
  deleteGroup: async () => {},
  addMemberToGroup: async () => {},
  addExpense: async () => {},
  deleteExpense: async () => {},
  settleDebt: async () => {},
  resetData: async () => {},
  markNotificationsRead: async () => {},
  clearNotifications: async () => {},
  getGroupById: () => null,
  getExpensesForGroup: () => [],
});

export const ExpenseProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [currentUser] = useState(CURRENT_USER);
  const [isLoading, setIsLoading] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState([]);

  // Helper para agregar una notificación in-app y persistirla
  const pushNotification = useCallback(async ({ icon, title, body }) => {
    const newNotif = {
      id: `notif_${Date.now()}`,
      icon,
      title,
      body,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setInAppNotifications((prev) => {
      const updated = [newNotif, ...prev];
      // Persistir en AsyncStorage de forma asíncrona
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      });
      return updated;
    });
  }, []);

  // Carga inicial de datos desde AsyncStorage
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedGroups, loadedExpenses] = await Promise.all([
        storageService.getGroups(),
        storageService.getExpenses(),
      ]);
      setGroups(loadedGroups || []);
      setExpenses(loadedExpenses || []);

      // Cargar notificaciones in-app persistidas
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const notifJson = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
      if (notifJson) setInAppNotifications(JSON.parse(notifJson));
    } catch (error) {
      console.error('[ExpenseContext] Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cálculo del balance neto total del usuario en toda la app
  const overallUserBalance = useMemo(() => {
    let total = 0;
    expenses.forEach((expense) => {
      const amount = Number(expense.amount) || 0;
      const payerId = expense.paidById;
      const splitWith = expense.splitWithIds || [];

      // Si el usuario pagó, suma lo que los otros le deben
      if (payerId === currentUser.id) {
        if (splitWith.length > 0) {
          const othersCount = splitWith.filter((id) => id !== currentUser.id).length;
          const share = amount / splitWith.length;
          total += share * othersCount;
        } else {
          total += amount;
        }
      } else if (splitWith.includes(currentUser.id)) {
        // Si otro pagó y el usuario participa, el usuario debe su parte
        const share = amount / (splitWith.length || 1);
        total -= share;
      }
    });
    return Math.round(total * 100) / 100;
  }, [expenses, currentUser.id]);

  // Crear un nuevo grupo
  const createGroup = async ({ name, description, icon = '👥', members = [] }) => {
    try {
      const newGroup = {
        id: `grp_${Date.now()}`,
        name: name.trim(),
        description: description ? description.trim() : '',
        icon: icon || '👥',
        createdAt: new Date().toISOString(),
        members: [
          currentUser,
          ...members.filter((m) => m.id !== currentUser.id),
        ],
      };

      const updated = await storageService.saveGroup(newGroup);
      if (updated) {
        setGroups(updated);
        return newGroup;
      }
      return null;
    } catch (error) {
      console.error('[ExpenseContext] Error creando grupo:', error);
      return null;
    }
  };

  // Actualizar un grupo existente
  const updateGroup = async (group) => {
    try {
      const updated = await storageService.saveGroup(group);
      if (updated) {
        setGroups(updated);
        return group;
      }
      return null;
    } catch (error) {
      console.error('[ExpenseContext] Error actualizando grupo:', error);
      return null;
    }
  };

  // Eliminar un grupo
  const deleteGroup = async (groupId) => {
    try {
      const updated = await storageService.deleteGroup(groupId);
      if (updated) {
        setGroups(updated);
        // Actualizar lista de gastos
        const updatedExpenses = await storageService.getExpenses();
        setExpenses(updatedExpenses);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[ExpenseContext] Error eliminando grupo:', error);
      return false;
    }
  };

  // Añadir un miembro a un grupo existente
  const addMemberToGroup = async (groupId, newMember) => {
    try {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return null;

      const updatedMembers = [...group.members, newMember];
      const updatedGroup = { ...group, members: updatedMembers };

      const updated = await storageService.saveGroup(updatedGroup);
      if (updated) {
        setGroups(updated);
        return updatedGroup;
      }
      return null;
    } catch (error) {
      console.error('[ExpenseContext] Error agregando miembro:', error);
      return null;
    }
  };

  // Registrar un nuevo gasto
  const addExpense = async (expenseData) => {
    try {
      const newExpense = {
        id: `exp_${Date.now()}`,
        date: new Date().toISOString(),
        ...expenseData,
        amount: Number(expenseData.amount),
      };

      const updated = await storageService.addExpense(newExpense);
      if (updated) {
        setExpenses(updated);

        // Notificación del sistema (push)
        const group = groups.find((g) => g.id === newExpense.groupId);
        const groupName = group ? group.name : 'Grupo';
        notificationService.notifyExpenseAdded(groupName, newExpense.description, `S/. ${newExpense.amount.toFixed(2)}`);

        // Notificación in-app
        pushNotification({
          icon: '🧾',
          title: 'Nuevo gasto registrado',
          body: `"${newExpense.description}" · S/. ${newExpense.amount.toFixed(2)} en ${groupName}`,
        });

        return newExpense;
      }
      return null;
    } catch (error) {
      console.error('[ExpenseContext] Error registrando gasto:', error);
      return null;
    }
  };

  // Eliminar un gasto
  const deleteExpense = async (expenseId) => {
    try {
      const updated = await storageService.deleteExpense(expenseId);
      if (updated) {
        setExpenses(updated);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[ExpenseContext] Error eliminando gasto:', error);
      return false;
    }
  };

  // Registrar pago de liquidación para saldar cuentas
  const settleDebt = async ({ groupId, fromMemberId, toMemberId, amount, method = 'Yape' }) => {
    try {
      const updated = await storageService.recordSettlement({
        groupId,
        fromMemberId,
        toMemberId,
        amount,
        method,
      });
      if (updated) {
        setExpenses(updated);

        // Buscar nombres de miembros para la notificación
        const group = groups.find((g) => g.id === groupId);
        const fromMember = group?.members.find((m) => m.id === fromMemberId);
        const toMember = group?.members.find((m) => m.id === toMemberId);
        const fromName = fromMember?.name ?? 'Alguien';
        const toName = toMember?.name ?? 'alguien';
        const amountStr = `S/. ${Number(amount).toFixed(2)}`;

        // Notificación del sistema (push)
        notificationService.notifyDebtSettled(fromName, toName, amountStr, method);

        // Notificación in-app
        pushNotification({
          icon: '✅',
          title: '¡Deuda saldada!',
          body: `${fromName} pagó ${amountStr} a ${toName} vía ${method}.`,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error('[ExpenseContext] Error liquidando deuda:', error);
      return false;
    }
  };

  // Reiniciar a datos de prueba
  const resetData = async () => {
    const result = await storageService.resetToSeedData();
    if (result) {
      setGroups(result.groups);
      setExpenses(result.expenses);
    }
  };

  const getGroupById = useCallback(
    (groupId) => groups.find((g) => g.id === groupId) || null,
    [groups]
  );

  const getExpensesForGroup = useCallback(
    (groupId) => expenses.filter((e) => e.groupId === groupId),
    [expenses]
  );

  // Marcar todas las notificaciones como leídas
  const markNotificationsRead = useCallback(async () => {
    setInAppNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      });
      return updated;
    });
  }, []);

  // Limpiar todo el historial de notificaciones
  const clearNotifications = useCallback(async () => {
    setInAppNotifications([]);
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.removeItem(NOTIF_STORAGE_KEY);
  }, []);

  // Conteo de notificaciones no leídas
  const unreadCount = useMemo(
    () => inAppNotifications.filter((n) => !n.read).length,
    [inAppNotifications]
  );

  return (
    <ExpenseContext.Provider
      value={{
        groups,
        expenses,
        currentUser,
        isLoading,
        overallUserBalance,
        inAppNotifications,
        unreadCount,
        refreshData: loadData,
        createGroup,
        updateGroup,
        deleteGroup,
        addMemberToGroup,
        addExpense,
        deleteExpense,
        settleDebt,
        resetData,
        markNotificationsRead,
        clearNotifications,
        getGroupById,
        getExpensesForGroup,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenseContext = () => useContext(ExpenseContext);
