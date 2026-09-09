import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { BalanceBadge } from './BalanceBadge';
import { useBalances } from '../hooks/useBalances';

/**
 * Componente GroupCard
 * Renderiza la tarjeta de un grupo en la lista principal del Dashboard
 */
export const GroupCard = ({ group, expenses = [], onPress, currentUserId }) => {
  const { theme } = useTheme();
  const { userNetBalance, totalGroupSpent } = useBalances(group, expenses, currentUserId);

  const memberCount = group.members ? group.members.length : 0;
  const previewMembers = group.members ? group.members.slice(0, 4) : [];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.cardShadow,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryBg }]}>
          <Text style={styles.groupIcon}>{group.icon || '👥'}</Text>
        </View>

        <View style={styles.titleArea}>
          <Text
            numberOfLines={1}
            style={[styles.groupName, { color: theme.colors.text }]}
          >
            {group.name}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.description, { color: theme.colors.textSecondary }]}
          >
            {group.description || `${memberCount} integrantes`}
          </Text>
        </View>
      </View>

      {/* Fila inferior: Avatares de integrantes y Badge de balance */}
      <View style={styles.bottomRow}>
        <View style={styles.avatarStack}>
          {previewMembers.map((m, idx) => (
            <Image
              key={m.id || idx}
              source={{
                uri:
                  m.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=10b981&color=fff`,
              }}
              style={[
                styles.avatar,
                {
                  marginLeft: idx === 0 ? 0 : -10,
                  borderColor: theme.colors.surface,
                },
              ]}
            />
          ))}
          {memberCount > 4 ? (
            <View
              style={[
                styles.moreAvatar,
                {
                  marginLeft: -10,
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.surface,
                },
              ]}
            >
              <Text style={[styles.moreText, { color: theme.colors.textSecondary }]}>
                +{memberCount - 4}
              </Text>
            </View>
          ) : null}
        </View>

        <BalanceBadge balance={userNetBalance} compact />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 7,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupIcon: {
    fontSize: 24,
  },
  titleArea: {
    flex: 1,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
  },
  moreAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
