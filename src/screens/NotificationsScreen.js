import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useExpenseContext } from '../context/ExpenseContext';

/**
 * NotificationsScreen
 * Panel in-app de notificaciones: nuevo gasto, deuda saldada, etc.
 * Se marca como "leído" automáticamente al abrir la pantalla.
 */
export const NotificationsScreen = () => {
  const { theme } = useTheme();
  const { inAppNotifications, markNotificationsRead, clearNotifications } =
    useExpenseContext();

  // Al abrir el panel, marcar todo como leído
  useEffect(() => {
    markNotificationsRead();
  }, [markNotificationsRead]);

  const renderItem = ({ item }) => {
    const date = new Date(item.createdAt);
    const timeLabel = date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    const dateLabel = date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: item.read ? theme.colors.surface : theme.colors.primaryBg,
            borderColor: item.read ? theme.colors.border : theme.colors.primary,
          },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: theme.colors.text, fontFamily: theme.fonts.bodyBold }]}>
            {item.title}
          </Text>
          <Text style={[styles.cardBody2, { color: theme.colors.textSecondary, fontFamily: theme.fonts.body }]}>
            {item.body}
          </Text>
          <Text style={[styles.cardTime, { color: theme.colors.textMuted, fontFamily: theme.fonts.monoMedium }]}>
            {dateLabel} · {timeLabel}
          </Text>
        </View>

        {!item.read && (
          <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.display }]}>
          Notificaciones
        </Text>
        {inAppNotifications.length > 0 && (
          <TouchableOpacity onPress={clearNotifications} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={inAppNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={56} color={theme.colors.border} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text, fontFamily: theme.fonts.bodyBold }]}>
              Sin notificaciones
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              Aquí aparecerán los nuevos gastos y pagos saldados.
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  clearBtn: { padding: 6 },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, marginBottom: 2 },
  cardBody2: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  cardTime: { fontSize: 11, letterSpacing: 0.5 },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, marginTop: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
});

