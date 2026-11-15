import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

/**
 * Monto en Soles con "S/" y decimales pequeños y el entero grande.
 * Es la marca visual de todos los importes de SplitPay.
 */
export const Money = ({ amount = 0, size = 28, color, sign = false, style }) => {
  const { theme } = useTheme();
  const n = Number(amount) || 0;
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const c = color || theme.colors.text;
  const small = {
    fontFamily: theme.fonts.monoMedium,
    fontSize: size * 0.4,
    color: c,
    marginTop: size * 0.14,
  };

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start' }, style]}>
      {sign && Math.abs(n) > 0.01 ? (
        <Text style={[small, { fontSize: size * 0.6, marginTop: size * 0.08, marginRight: 2 }]}>
          {n > 0 ? '+' : '−'}
        </Text>
      ) : null}
      <Text style={[small, { marginRight: 3 }]}>S/</Text>
      <Text
        style={{
          fontFamily: theme.fonts.display,
          fontSize: size,
          lineHeight: size * 1.12,
          letterSpacing: -size * 0.03,
          color: c,
        }}
      >
        {intFmt}
      </Text>
      <Text style={small}>.{dec}</Text>
    </View>
  );
};