import { useMemo } from 'react';

/**
 * Hook de lógica de negocio para el cálculo de balances y liquidación de deudas
 * 
 * Reglas de negocio:
 * 1. Balance neto por participante = (Dinero pagado en el grupo) - (Dinero que le correspondía asumir)
 * 2. Balance > 0 -> Le deben dinero (Verde / Acreedor)
 * 3. Balance < 0 -> Debe dinero (Rojo / Deudor)
 * 4. Balance = 0 -> Cuenta equilibrada
 * 5. Algoritmo de transferencias mínimas: Minimiza la cantidad de pagos entre integrantes
 */
export const useBalances = (group, expenses = [], currentUserId = 'user_camilo_01') => {
  // 1. Cálculo de balances por miembro
  const { memberBalances, totalGroupSpent, userNetBalance } = useMemo(() => {
    if (!group || !group.members) {
      return { memberBalances: {}, totalGroupSpent: 0, userNetBalance: 0 };
    }

    const balances = {};
    let totalSpent = 0;

    // Inicializar balance en 0 para todos los miembros del grupo
    group.members.forEach((m) => {
      balances[m.id] = {
        member: m,
        paid: 0,
        owed: 0,
        net: 0,
      };
    });

    // Procesar cada gasto del grupo
    expenses.forEach((expense) => {
      const amount = Number(expense.amount) || 0;
      totalSpent += amount;

      const payerId = expense.paidById;
      const splitWith = expense.splitWithIds && expense.splitWithIds.length > 0
        ? expense.splitWithIds
        : group.members.map((m) => m.id);

      // Sumar lo pagado
      if (balances[payerId]) {
        balances[payerId].paid += amount;
      }

      // Calcular la cuota equitativa por participante
      const splitCount = splitWith.length;
      if (splitCount > 0) {
        const perPersonShare = amount / splitCount;
        splitWith.forEach((memberId) => {
          if (balances[memberId]) {
            balances[memberId].owed += perPersonShare;
          }
        });
      }
    });

    // Calcular el balance neto: Net = Paid - Owed
    Object.keys(balances).forEach((id) => {
      balances[id].net = Math.round((balances[id].paid - balances[id].owed) * 100) / 100;
    });

    const userNet = balances[currentUserId] ? balances[currentUserId].net : 0;

    return {
      memberBalances: balances,
      totalGroupSpent: totalSpent,
      userNetBalance: userNet,
    };
  }, [group, expenses, currentUserId]);

  // 2. Algoritmo de Liquidación Óptima de Deudas (Minimización de Transacciones)
  const suggestedSettlements = useMemo(() => {
    if (!memberBalances) return [];

    // Separar en deudores (net < 0) y acreedores (net > 0)
    const debtors = [];
    const creditors = [];

    Object.values(memberBalances).forEach((item) => {
      const net = Math.round(item.net * 100) / 100;
      if (net < -0.01) {
        debtors.push({ member: item.member, amount: Math.abs(net) });
      } else if (net > 0.01) {
        creditors.push({ member: item.member, amount: net });
      }
    });

    // Ordenar de mayor a menor para emparejamiento codicioso (Greedy)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const settlements = [];
    let i = 0; // Índice deudor
    let j = 0; // Índice acreedor

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      // El monto a saldar es el mínimo entre lo que debe uno y lo que le deben al otro
      const settleAmount = Math.min(debtor.amount, creditor.amount);
      const roundedAmount = Math.round(settleAmount * 100) / 100;

      if (roundedAmount > 0.01) {
        settlements.push({
          id: `${debtor.member.id}_to_${creditor.member.id}_${settlements.length}`,
          from: debtor.member,
          to: creditor.member,
          amount: roundedAmount,
          isCurrentUserDebtor: debtor.member.id === currentUserId,
          isCurrentUserCreditor: creditor.member.id === currentUserId,
        });
      }

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount <= 0.01) i++;
      if (creditor.amount <= 0.01) j++;
    }

    return settlements;
  }, [memberBalances, currentUserId]);

  return {
    memberBalances,
    totalGroupSpent,
    userNetBalance,
    suggestedSettlements,
  };
};
