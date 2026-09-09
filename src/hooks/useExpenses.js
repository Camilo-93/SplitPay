import { useState, useEffect, useCallback } from 'react';
import { useExpenseContext } from '../context/ExpenseContext';

/**
 * Hook personalizado useExpenses
 * 
 * Gestiona la consulta, filtrado, alta y baja de gastos para un grupo específico
 * utilizando useState y useEffect según la arquitectura del curso.
 * 
 * @param {string} groupId - ID del grupo actual
 */
export const useExpenses = (groupId) => {
  const {
    expenses: allExpenses,
    addExpense: contextAddExpense,
    deleteExpense: contextDeleteExpense,
    isLoading: contextLoading,
  } = useExpenseContext();

  const [groupExpenses, setGroupExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState(null);

  // Sincronizar gastos del grupo cuando cambien en el contexto global
  useEffect(() => {
    setLoading(true);
    let filtered = allExpenses.filter((e) => e.groupId === groupId);

    if (filterCategory) {
      filtered = filtered.filter((e) => e.category === filterCategory);
    }

    // Ordenar cronológicamente (más recientes primero)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setGroupExpenses(filtered);
    setLoading(false);
  }, [allExpenses, groupId, filterCategory]);

  const addExpense = useCallback(
    async (expenseData) => {
      return await contextAddExpense({
        ...expenseData,
        groupId,
      });
    },
    [contextAddExpense, groupId]
  );

  const deleteExpense = useCallback(
    async (expenseId) => {
      return await contextDeleteExpense(expenseId);
    },
    [contextDeleteExpense]
  );

  return {
    expenses: groupExpenses,
    loading: loading || contextLoading,
    filterCategory,
    setFilterCategory,
    addExpense,
    deleteExpense,
  };
};
