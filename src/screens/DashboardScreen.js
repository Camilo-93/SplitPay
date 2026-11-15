import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useExpenseContext } from '../context/ExpenseContext';
import { GroupCard } from '../components/GroupCard';
import { CreateGroupModal } from '../components/CreateGroupModal';
import { Avatar } from '../components/ui/Avatar';
import { Money } from '../components/ui/Money';
import { Ticket, Barcode, Stamp } from '../components/ui/Ticket';

export const DashboardScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { colors: c, fonts: f } = theme;
  const insets = useSafeAreaInsets();
  const onBand = c.onPrimary;
  const ghostBg = isDark ? 'rgba(22, 20, 15, 0.10)' : 'rgba(255, 255, 255, 0.18)';
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
      'Reiniciar datos de prueba',
      '¿Deseas restablecer los grupos y gastos de demostración iniciales?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: () => resetData() },
      ]
    );
  };

  const isPositive = overallUserBalance > 0.01;
  const isNegative = overallUserBalance < -0.01;
  const tone = isPositive ? c.success : isNegative ? c.danger : c.textMuted;
  const stamp = isPositive ? 'TE DEBEN' : isNegative ? 'DEBES' : 'AL DÍA';
  const note = isPositive
    ? 'Tus patas te deben plata. Ve cobrando.'
    : isNegative
    ? 'Toca ponerse al día con los patas.'
    : 'Cuentas claras, amistades largas.';
  const today = new Date()
    .toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
    .replace('.', '')
    .toUpperCase();

  const renderHeader = () => (
    <View>
      {/* Banda de color con saludo y acciones */}
      <View style={[styles.band, { backgroundColor: c.primary, paddingTop: insets.top + 12 }]}>
        <View style={styles.topBar}>
          <View style={styles.who}>
            <Avatar name={currentUser.name} uri={currentUser.avatarUrl} size={46} ring={onBand} />
            <View>
              <Text style={[styles.caps, { color: onBand, opacity: 0.8, fontFamily: f.monoMedium }]}>HOLA,</Text>
              <Text style={[styles.name, { color: onBand, fontFamily: f.display }]}>
                {currentUser.name.split(' ')[0]}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={toggleTheme}
              accessibilityLabel="Cambiar tema claro u oscuro"
              style={[styles.ghostBtn, { backgroundColor: ghostBg }]}
            >
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={19} color={onBand} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleResetDemoData}
              accessibilityLabel="Reiniciar datos de prueba"
              style={[styles.ghostBtn, { backgroundColor: ghostBg }]}
            >
              <Ionicons name="refresh-outline" size={19} color={onBand} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Ticket de balance general (verde si te deben, rojo si debes), montado sobre la banda */}
      <View style={styles.ticketWrap}>
        <Ticket
          style={{ marginBottom: 24 }}
          top={
            <>
              <View style={styles.ticketHead}>
                <Text style={[styles.caps, { color: c.textMuted, fontFamily: f.monoMedium }]}>BALANCE GENERAL</Text>
                <Text style={[styles.caps, { color: c.textMuted, fontFamily: f.monoMedium }]}>{today}</Text>
              </View>
              <View style={styles.amountRow}>
                <Money
                  amount={Math.abs(overallUserBalance)}
                  size={46}
                  color={isPositive || isNegative ? tone : c.text}
                />
                <Stamp label={stamp} color={tone} />
              </View>
            </>
          }
          bottom={
            <>
              <Text style={[styles.note, { color: c.textSecondary, fontFamily: f.bodyMedium }]}>{note}</Text>
              <View style={styles.ticketFoot}>
                <Barcode color={c.textMuted} />
                <Text style={[styles.caps, { color: c.textMuted, fontFamily: f.monoMedium }]}>
                  {String(groups.length).padStart(2, '0')} GRUPOS
                </Text>
              </View>
            </>
          }
        />

        <Text style={[styles.section, { color: c.text, fontFamily: f.display }]}>Tus grupos</Text>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyRing, { borderColor: c.border }]}>
        <Ionicons name="receipt-outline" size={34} color={c.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: c.text, fontFamily: f.display }]}>
        Aún no hay cuentas por dividir
      </Text>
      <Text style={[styles.emptySub, { color: c.textSecondary, fontFamily: f.body }]}>
        Crea un grupo (el depa, el viaje a Máncora, la pichanga del jueves) y SplitPay hace la matemática.
      </Text>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={isDark ? 'dark-content' : 'light-content'} />

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
            colors={[c.primary]}
            tintColor={c.primary}
          />
        }
      />

      {/* Botón flotante: nuevo grupo */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
        style={[styles.fab, { backgroundColor: c.primary }]}
      >
        <Ionicons name="add" size={22} color={c.onPrimary} />
        <Text style={[styles.fabText, { color: c.onPrimary, fontFamily: f.bodyBold }]}>Nuevo grupo</Text>
      </TouchableOpacity>

      <CreateGroupModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateGroup}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 110 },
  band: { paddingHorizontal: 16, paddingBottom: 76, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  ticketWrap: { paddingHorizontal: 16, marginTop: -56 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  caps: { fontSize: 10.5, letterSpacing: 1.4 },
  name: { fontSize: 28, letterSpacing: -0.6, lineHeight: 32 },
  actions: { flexDirection: 'row', gap: 8 },
  ghostBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ticketHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  note: { fontSize: 14 },
  ticketFoot: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14 },
  section: { fontSize: 24, letterSpacing: -0.5, marginBottom: 6 },
  empty: { alignItems: 'center', paddingHorizontal: 36, marginTop: 36 },
  emptyRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 21, letterSpacing: -0.4, textAlign: 'center', marginBottom: 8 },
  emptySub: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 14,
    paddingRight: 20,
    height: 52,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabText: { fontSize: 15 },
});