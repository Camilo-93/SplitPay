import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/currencyFormatter';

/**
 * Componente BalanceBadge
 * Renderiza el estado financiero del usuario:
 * - Verde si le deben dinero (> 0)
 * - Rojo si debe dinero (< 0)
 * - Neutro si la cuenta está equilibrada (= 0)
 */
export const BalanceBadge = ({ balance = 0, compact = false, showLabel = true }) => {
  const { theme } = useTheme();
  const numericBalance = Number(balance) || 0;
  const rounded = Math.round(numericBalance * 100) / 100;

  if (rounded > 0.01) {
    return (
      <View
        style={[
          styles.badge,
          { backgroundColor: theme.colors.successBg },
          compact && styles.compactBadge,
        ]}
      >
        <Text style={[styles.amount, { color: theme.colors.success }]}>
          {showLabel ? 'Te deben ' : '+'}
          {formatCurrency(rounded)}
        </Text>
      </View>
    );
  }

  if (rounded < -0.01) {
    return (
      <View
        style={[
          styles.badge,
          { backgroundColor: theme.colors.dangerBg },
          compact && styles.compactBadge,
        ]}
      >
        <Text style={[styles.amount, { color: theme.colors.danger }]}>
          {showLabel ? 'Debes ' : '-'}
          {formatCurrency(Math.abs(rounded))}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme.colors.surfaceSecondary },
        compact && styles.compactBadge,
      ]}
    >
      <Text style={[styles.amount, { color: theme.colors.textMuted }]}>
        Cuenta equilibrada (S/. 0.00)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
  },
});
