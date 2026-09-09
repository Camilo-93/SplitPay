import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenseContext } from '../context/ExpenseContext';
import { GroupCard } from '../components/GroupCard';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { formatCurrency } from '../utils/currencyFormatter';

export const DashboardScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const {
    groups,
    expenses,
    currentUser,
    overallUserBalance,
    isLoading,
    refreshData,
    createGroup,
    resetData,
  } = useExpenseContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCreateGroup = async (groupData) => {
    const newGroup = await createGroup(groupData);
    if (newGroup) {
      navigation.navigate('GroupDetail', { groupId: newGroup.id });
    }
  };

  const handleResetDemoData = () => {
    Alert.alert(
      'Reiniciar Datos de Prueba',
      '¿Deseas restablecer los grupos y gastos de demostración iniciales?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: () => resetData() },
      ]
    );
  };

  const isPositive = overallUserBalance > 0.01;
  const isNegative = overallUserBalance < -0.01;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Barra superior de bienvenida y acciones */}
      <View style={styles.topBar}>
        <View style={styles.userGreeting}>
          <Image
            source={{ uri: currentUser.avatarUrl }}
            style={[styles.userAvatar, { borderColor: theme.colors.primary }]}
          />
          <View>
            <Text style={[styles.greetingSub, { color: theme.colors.textSecondary }]}>
              Bienvenido de nuevo
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {currentUser.name}
            </Text>
          </View>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceSecondary }]}
          >
            <Text style={styles.iconBtnEmoji}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleResetDemoData}
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceSecondary }]}
          >
            <Text style={styles.iconBtnEmoji}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tarjeta de Balance General (Verde si le deben, Roja si debe) */}
      <View
        style={[
          styles.balanceCard,
          {
            backgroundColor: isPositive
              ? theme.colors.primaryDark
              : isNegative
              ? '#b91c1c'
              : theme.colors.surface,
            borderColor: isPositive || isNegative ? 'transparent' : theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.balanceLabel,
            { color: isPositive || isNegative ? '#e2e8f0' : theme.colors.textSecondary },
          ]}
        >
          {isPositive
            ? '💰 Balance Total (Te deben)'
            : isNegative
            ? '💸 Balance Total (Debes)'
            : '⚖️ Balance General'}
        </Text>

        <Text
          style={[
            styles.balanceAmount,
            { color: isPositive || isNegative ? '#ffffff' : theme.colors.text },
          ]}
        >
          {formatCurrency(Math.abs(overallUserBalance))}
        </Text>

        <Text
          style={[
            styles.balanceSubtitle,
            { color: isPositive || isNegative ? '#cbd5e1' : theme.colors.textMuted },
          ]}
        >
          {isPositive
            ? 'Tus amigos tienen pagos pendientes hacia ti.'
            : isNegative
            ? 'Tienes deudas pendientes por saldar.'
            : 'Todas tus cuentas en los grupos están al día.'}
        </Text>
      </View>

      {/* Título de sección de grupos */}
      <View style={styles.sectionTitleRow}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Tus Grupos Activos ({groups.length})
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={[styles.createLink, { color: theme.colors.primary }]}>
            + Nuevo Grupo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📂</Text>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No tienes grupos creados
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Crea un grupo para empezar a dividir gastos con tus amigos o compañeros.
      </Text>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[styles.emptyButton, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={styles.emptyButtonText}>Crear Primer Grupo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            expenses={expenses.filter((e) => e.groupId === item.id)}
            currentUserId={currentUser.id}
            onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || isLoading}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      {/* Botón Flotante (FAB) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>

      {/* Modal de Crear Grupo */}
      <CreateGroupModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateGroup}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 90,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
  },
  greetingSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnEmoji: {
    fontSize: 18,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 6,
  },
  balanceSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  createLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 30,
  },
});
