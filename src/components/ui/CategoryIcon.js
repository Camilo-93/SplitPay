import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { withAlpha } from '../../utils/palette';

/** Ficha cuadrada con el ícono de la categoría sobre un fondo teñido. */
export const CategoryIcon = ({ category, size = 44, tint }) => {
  const c = tint || category.color;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: withAlpha(c, 0.14),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={category.vectorIcon} size={size * 0.5} color={c} />
    </View>
  );
};