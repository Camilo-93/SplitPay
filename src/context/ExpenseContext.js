import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { storageService, CURRENT_USER } from '../services/storageService';
import { notificationService } from '../services/notificationService';

const ExpenseContext = createContext({
  groups: [],
  expenses: [],
  currentUser: CURRENT_USER,
  isLoading: true,
  overallUserBalance: 0,
  refreshData: async () => {},
  createGroup: async () => {},
  updateGroup: async () => {},
  deleteGroup: async () => {},
  addMemberToGroup: async () => {},
  addExpense: async () => {},
  deleteExpense: async () => {},
  settleDebt: async () => {},
  resetData: async () => {},
  getGroupById: () => null,
  getExpensesForGroup: () => [],
});

export const ExpenseProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [currentUser] = useState(CURRENT_USER);
  const [isLoading, setIsLoading] = useState(true);

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

        // Notificación local de nuevo gasto
        const group = groups.find((g) => g.id === newExpense.groupId);
        const groupName = group ? group.name : 'Grupo';
        notificationService.notifyExpenseAdded(groupName, newExpense.description, `S/. ${newExpense.amount.toFixed(2)}`);

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

  return (
    <ExpenseContext.Provider
      value={{
        groups,
        expenses,
        currentUser,
        isLoading,
        overallUserBalance,
        refreshData: loadData,
        createGroup,
        updateGroup,
        deleteGroup,
        addMemberToGroup,
        addExpense,
        deleteExpense,
        settleDebt,
        resetData,
        getGroupById,
        getExpensesForGroup,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenseContext = () => useContext(ExpenseContext);
