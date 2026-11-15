import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getCategoryById } from '../utils/categories';
import { CategoryIcon } from './ui/CategoryIcon';
import { Money } from './ui/Money';
import { withAlpha } from '../utils/palette';

/**
 * Componente ExpenseItem
 * Fila de gasto del historial, con aspecto de renglón de boleta.
 */
export const ExpenseItem = ({ expense, members = [], onPress }) => {
  const { theme } = useTheme();
  const { colors: c, fonts: f } = theme;
  const category = getCategoryById(expense.category);
  const payer = members.find((m) => m.id === expense.paidById);
  const isSettlement = expense.isSettlement;

  const d = new Date(expense.date);
  const date = isNaN(d.getTime())
    ? 'reciente'
    : d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }).replace('.', '');

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.row, { borderBottomColor: c.border }]}
    >
      {isSettlement ? (
        <View style={[styles.settleIcon, { backgroundColor: withAlpha(c.success, 0.14) }]}>
          <Ionicons name="swap-horizontal" size={22} color={c.success} />
        </View>
      ) : (
        <CategoryIcon category={category} size={44} />
      )}

      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={[styles.title, { color: c.text, fontFamily: f.bodyBold }]}>
          {expense.description}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: c.textSecondary, fontFamily: f.body }]}>
            {isSettlement ? 'Liquidación' : `Pagó ${payer ? payer.name.split(' ')[0] : 'alguien'}`}
          </Text>
          <Text style={[styles.meta, { color: c.textMuted, fontFamily: f.mono }]}>· {date}</Text>
          {expense.receiptImage ? <Ionicons name="attach" size={14} color={c.textMuted} /> : null}
          {expense.location && expense.location.address ? (
            <Ionicons name="location-outline" size={13} color={c.textMuted} />
          ) : null}
        </View>
      </View>

      <Money amount={expense.amount} size={19} color={isSettlement ? c.success : c.text} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    marginHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settleIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, marginBottom: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { fontSize: 12 },
});