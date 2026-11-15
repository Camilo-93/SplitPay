import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { withAlpha } from '../utils/palette';

/**
 * Componente BalanceBadge
 * Renderiza el estado financiero del usuario:
 * - Verde si le deben dinero (> 0)
 * - Rojo si debe dinero (< 0)
 * - Neutro si la cuenta está equilibrada (= 0)
 */
export const BalanceBadge = ({ balance = 0, compact = false, showLabel = true }) => {
  const { theme } = useTheme();
  const { colors: c, fonts: f } = theme;
  const rounded = Math.round((Number(balance) || 0) * 100) / 100;

  let tone = c.textMuted;
  let label = 'al día';
  let prefix = '';
  if (rounded > 0.01) {
    tone = c.success;
    label = 'te deben';
    prefix = '+';
  } else if (rounded < -0.01) {
    tone = c.danger;
    label = 'debes';
    prefix = '−';
  }
  const settled = Math.abs(rounded) <= 0.01;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: settled ? 'transparent' : withAlpha(tone, 0.12),
          borderColor: settled ? c.border : withAlpha(tone, 0.35),
        },
        compact && styles.compact,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: tone }]} />
      {showLabel ? (
        <Text style={[styles.label, { color: tone, fontFamily: f.bodyMedium }]}>{label}</Text>
      ) : null}
      {!settled ? (
        <Text style={[styles.amount, { color: tone, fontFamily: f.monoMedium }]}>
          {showLabel ? '' : prefix}
          {formatCurrency(Math.abs(rounded))}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  compact: { paddingHorizontal: 9, paddingVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 12 },
  amount: { fontSize: 13 },
});