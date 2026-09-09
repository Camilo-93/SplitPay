import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getCategoryById } from '../utils/categories';
import { formatCurrency } from '../utils/currencyFormatter';

/**
 * Componente ExpenseItem
 * Renderiza una fila de gasto dentro del historial cronológico
 */
export const ExpenseItem = ({ expense, members = [], onPress, onDelete }) => {
  const { theme } = useTheme();
  const category = getCategoryById(expense.category);

  // Encontrar el nombre del pagador
  const payer = members.find((m) => m.id === expense.paidById);
  const payerName = payer ? payer.name : 'Alguien';

  const dateObj = new Date(expense.date);
  const dateFormatted = isNaN(dateObj.getTime())
    ? 'Reciente'
    : dateObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });

  const isSettlement = expense.isSettlement;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Icono de categoría */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isSettlement ? theme.colors.successBg : category.bgColor,
          },
        ]}
      >
        <Text style={styles.iconEmoji}>{isSettlement ? '🤝' : category.icon}</Text>
      </View>

      {/* Información del gasto */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text
            numberOfLines={1}
            style={[styles.description, { color: theme.colors.text }]}
          >
            {expense.description}
          </Text>
          <Text style={[styles.amount, { color: theme.colors.text }]}>
            {formatCurrency(expense.amount)}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.payerText, { color: theme.colors.textSecondary }]}>
            {isSettlement ? 'Liquidación saldada' : `Pagó ${payerName}`}
          </Text>
          
          <View style={styles.metaRow}>
            {expense.receiptImage ? (
              <Text style={[styles.receiptTag, { color: theme.colors.primary }]}>
                📎 Recibo
              </Text>
            ) : null}
            <Text style={[styles.dateText, { color: theme.colors.textMuted }]}>
              {dateFormatted}
            </Text>
          </View>
        </View>

        {expense.location && expense.location.address ? (
          <Text
            numberOfLines={1}
            style={[styles.locationText, { color: theme.colors.textMuted }]}
          >
            📍 {expense.location.address}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  receiptTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '400',
  },
  locationText: {
    fontSize: 11,
    marginTop: 4,
  },
});
