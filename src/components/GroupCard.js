import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BalanceBadge } from './BalanceBadge';
import { Avatar } from './ui/Avatar';
import { useBalances } from '../hooks/useBalances';
import { groupColor, withAlpha } from '../utils/palette';
import { formatCurrency } from '../utils/currencyFormatter';

/**
 * Componente GroupCard
 * Ficha de un grupo en la lista principal del Dashboard, con tira de color lateral.
 */
export const GroupCard = ({ group, expenses = [], onPress, currentUserId }) => {
  const { theme } = useTheme();
  const { colors: c, fonts: f } = theme;
  const { userNetBalance, totalGroupSpent } = useBalances(group, expenses, currentUserId);

  const members = group.members || [];
  const count = members.length;
  const tone = groupColor(group.id);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
    >
      <View style={[styles.stripe, { backgroundColor: tone }]} />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.iconBox, { backgroundColor: withAlpha(tone, 0.16) }]}>
            <Text style={styles.groupIcon}>{group.icon || '👥'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[styles.name, { color: c.text, fontFamily: f.display }]}>
              {group.name}
            </Text>
            <Text numberOfLines={1} style={[styles.meta, { color: c.textMuted, fontFamily: f.mono }]}>
              {count} integrantes · {formatCurrency(totalGroupSpent)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.stack}>
            {members.slice(0, 4).map((m, i) => (
              <Avatar
                key={m.id || i}
                name={m.name}
                uri={m.avatarUrl}
                size={28}
                ring={c.surface}
                style={{ marginLeft: i === 0 ? 0 : -8 }}
              />
            ))}
            {count > 4 ? (
              <View style={[styles.more, { backgroundColor: c.surfaceSecondary, borderColor: c.surface }]}>
                <Text style={{ color: c.textSecondary, fontFamily: f.monoMedium, fontSize: 10 }}>
                  +{count - 4}
                </Text>
              </View>
            ) : null}
          </View>
          <BalanceBadge balance={userNetBalance} compact />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stripe: { width: 5 },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconBox: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  groupIcon: { fontSize: 23 },
  name: { fontSize: 19, letterSpacing: -0.3, marginBottom: 2 },
  meta: { fontSize: 11 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stack: { flexDirection: 'row', alignItems: 'center' },
  more: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 2,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});