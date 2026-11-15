import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { groupColor, withAlpha } from '../../utils/palette';

/**
 * Avatar cuadrado redondeado.
 * Muestra la foto de la API (RandomUser). Si no hay foto, falla la carga
 * o es un avatar genérico de ui-avatars, cae a iniciales sobre un color propio.
 */
export const Avatar = ({ name = '?', uri, size = 36, ring, style }) => {
  const { theme } = useTheme();
  const [failed, setFailed] = useState(false);
  const color = groupColor(name);
  const initials = String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const isGeneric = typeof uri === 'string' && uri.includes('ui-avatars.com');
  const showPhoto = uri && !isGeneric && !failed;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
          backgroundColor: withAlpha(color, 0.22),
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          borderWidth: ring ? 2 : 0,
          borderColor: ring || 'transparent',
        },
        style,
      ]}
    >
      {showPhoto ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} onError={() => setFailed(true)} />
      ) : (
        <Text style={{ fontFamily: theme.fonts.display, fontSize: size * 0.38, color: theme.colors.text }}>
          {initials}
        </Text>
      )}
    </View>
  );
};