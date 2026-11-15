import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const BARS = [2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2];

/**
 * Ticket / boleta: pieza visual firma de SplitPay.
 * Dos mitades separadas por una línea punteada con muescas laterales.
 */
export const Ticket = ({ top, bottom, style }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const notch = {
    position: 'absolute',
    top: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: c.background,
  };

  return (
    <View style={[{ backgroundColor: c.surface, borderRadius: 10, borderWidth: 1, borderColor: c.border }, style]}>
      <View style={{ padding: 20 }}>{top}</View>

      <View style={{ height: 20, justifyContent: 'center' }}>
        <View style={[notch, { left: -12 }]} />
        <View style={[notch, { right: -12 }]} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 18 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View key={i} style={{ width: 5, height: 1.5, backgroundColor: c.border }} />
          ))}
        </View>
      </View>

      <View style={{ padding: 20, paddingTop: 12 }}>{bottom}</View>
    </View>
  );
};

/** Código de barras decorativo. */
export const Barcode = ({ color }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 22, gap: 2 }}>
    {BARS.map((w, i) => (
      <View key={i} style={{ width: w, height: i % 5 === 0 ? 22 : 16, backgroundColor: color }} />
    ))}
  </View>
);

/** Sello rotado ("TE DEBEN", "DEBES", "AL DÍA"...). */
export const Stamp = ({ label, color }) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: color,
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        transform: [{ rotate: '-7deg' }],
        opacity: 0.9,
      }}
    >
      <Text style={{ fontFamily: theme.fonts.display, fontSize: 13, letterSpacing: 1.6, color }}>{label}</Text>
    </View>
  );
};