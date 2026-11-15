import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useExpenseContext } from '../context/ExpenseContext';
import { useExpenses } from '../hooks/useExpenses';
import { useBalances } from '../hooks/useBalances';
import { ExpenseItem } from '../components/ExpenseItem';
import { BalanceBadge } from '../components/BalanceBadge';
import { CATEGORY_LIST, getCategoryById } from '../utils/categories';
import { formatCurrency } from '../utils/currencyFormatter';
import { apiService } from '../services/apiService';
import { Avatar } from '../components/ui/Avatar';
import { Money } from '../components/ui/Money';
import { groupColor, withAlpha } from '../utils/palette';

export const GroupDetailScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { theme, isDark } = useTheme();
  const { getGroupById, deleteGroup, addMemberToGroup, currentUser, deleteExpense } = useExpenseContext();

  const group = getGroupById(groupId);
  const { expenses, filterCategory, setFilterCategory } = useExpenses(groupId);
  const { memberBalances, totalGroupSpent, userNetBalance } = useBalances(group, expenses, currentUser.id);

  // Pestaña activa: 'gastos' | 'balances'
  const [activeTab, setActiveTab] = useState('gastos');

  // Estado para el Modal de Detalle de Gasto
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>Grupo no encontrado</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[styles.backBtnText, { color: theme.colors.onPrimary }]}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleDeleteGroup = () => {
    Alert.alert(
      'Eliminar Grupo',
      `¿Estás seguro de eliminar "${group.name}" y todos sus gastos registrados?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteGroup(group.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleOpenExpenseDetail = (expense) => {
    setSelectedExpense(expense);
    setDetailModalVisible(true);
  };

  const handleDeleteSelectedExpense = async () => {
    if (!selectedExpense) return;
    await deleteExpense(selectedExpense.id);
    setDetailModalVisible(false);
    setSelectedExpense(null);
  };

  const renderGroupHeader = () => {
    const c = theme.colors;
    const f = theme.fonts;
    const gc = groupColor(group.id);
    const netTone =
      userNetBalance > 0.01 ? c.success : userNetBalance < -0.01 ? c.danger : c.textMuted;

    return (
      <View style={[hs.hero, { backgroundColor: withAlpha(gc, 0.12), borderBottomColor: c.border }]}>
        <View style={hs.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityLabel="Volver"
            style={[hs.ghost, { borderColor: c.border, backgroundColor: c.surface }]}
          >
            <Ionicons name="chevron-back" size={20} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteGroup}
            accessibilityLabel="Eliminar grupo"
            style={[hs.ghost, { borderColor: c.border, backgroundColor: c.surface }]}
          >
            <Ionicons name="trash-outline" size={18} color={c.danger} />
          </TouchableOpacity>
        </View>

        <View style={[hs.iconTile, { backgroundColor: withAlpha(gc, 0.2) }]}>
          <Text style={{ fontSize: 30 }}>{group.icon || '👥'}</Text>
        </View>
        <Text numberOfLines={2} style={[hs.title, { color: c.text, fontFamily: f.display }]}>
          {group.name}
        </Text>
        <Text numberOfLines={1} style={[hs.sub, { color: c.textSecondary, fontFamily: f.body }]}>
          {group.description || `${group.members.length} integrantes`}
        </Text>

        <View style={[hs.stats, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={hs.statCol}>
            <Text style={[hs.caps, { color: c.textMuted, fontFamily: f.monoMedium }]}>GASTO TOTAL</Text>
            <Money amount={totalGroupSpent} size={26} />
          </View>
          <View style={[hs.vline, { backgroundColor: c.border }]} />
          <View style={hs.statCol}>
            <Text style={[hs.caps, { color: c.textMuted, fontFamily: f.monoMedium }]}>TU BALANCE</Text>
            <Money amount={userNetBalance} size={26} color={netTone} sign />
          </View>
        </View>

        {/* Selector segmentado: Gastos / Balances */}
        <View style={[hs.segment, { backgroundColor: c.surfaceSecondary }]}>
          {[
            ['gastos', 'Gastos', expenses.length, 'receipt-outline'],
            ['balances', 'Balances', group.members.length, 'people-outline'],
          ].map(([key, label, count, icon]) => {
            const active = activeTab === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveTab(key)}
                style={[
                  hs.segBtn,
                  active && { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <Ionicons name={icon} size={16} color={active ? c.text : c.textMuted} />
                <Text style={{ color: active ? c.text : c.textMuted, fontFamily: f.bodyBold, fontSize: 13 }}>
                  {label}
                </Text>
                <Text style={{ color: c.textMuted, fontFamily: f.mono, fontSize: 11 }}>{count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Filtros de categoría si la pestaña Gastos está activa */}
        {activeTab === 'gastos' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => setFilterCategory(null)}
              style={[
                hs.chip,
                {
                  backgroundColor: !filterCategory ? c.primary : 'transparent',
                  borderColor: !filterCategory ? c.primary : c.border,
                },
              ]}
            >
              <Text style={{ color: !filterCategory ? c.onPrimary : c.text, fontFamily: f.bodyMedium, fontSize: 13 }}>
                Todos
              </Text>
            </TouchableOpacity>
            {CATEGORY_LIST.map((cat) => {
              const sel = filterCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setFilterCategory(sel ? null : cat.id)}
                  style={[
                    hs.chip,
                    { backgroundColor: sel ? cat.color : 'transparent', borderColor: sel ? cat.color : c.border },
                  ]}
                >
                  <Ionicons name={cat.vectorIcon} size={14} color={sel ? '#fff' : cat.color} />
                  <Text style={{ color: sel ? '#fff' : c.text, fontFamily: f.bodyMedium, fontSize: 13 }}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}
      </View>
    );
  };

  const renderBalancesTab = () => {
    const c = theme.colors;
    const f = theme.fonts;
    const maxPaid = Math.max(1, ...group.members.map((m) => (memberBalances[m.id] || {}).paid || 0));

    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 18 }}>
        <Text style={[hs.caps, { color: c.textMuted, fontFamily: f.monoMedium, marginBottom: 6 }]}>
          QUIÉN PUSO Y QUIÉN DEBE
        </Text>
        {group.members.map((member) => {
          const d = memberBalances[member.id] || { paid: 0, owed: 0, net: 0 };
          const barTone = d.net > 0.01 ? c.success : d.net < -0.01 ? c.danger : c.textMuted;
          return (
            <View key={member.id} style={[hs.memberRow, { borderBottomColor: c.border }]}>
              <Avatar name={member.name} uri={member.avatarUrl} size={46} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontFamily: f.bodyBold, fontSize: 15 }}>
                  {member.name}
                  {member.id === currentUser.id ? '  (tú)' : ''}
                </Text>
                <View style={[hs.track, { backgroundColor: c.surfaceSecondary }]}>
                  <View
                    style={{
                      width: `${Math.min(100, (d.paid / maxPaid) * 100)}%`,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: barTone,
                    }}
                  />
                </View>
                <Text style={{ color: c.textSecondary, fontFamily: f.mono, fontSize: 11 }}>
                  Pagó {formatCurrency(d.paid)} · Le toca {formatCurrency(d.owed)}
                </Text>
              </View>
              <BalanceBadge balance={d.net} compact showLabel={false} />
            </View>
          );
        })}
      </View>
    );
  };

  // Datos para el modal de detalle
  const payer = selectedExpense
    ? group.members.find((m) => m.id === selectedExpense.paidById)
    : null;
  const categoryInfo = selectedExpense ? getCategoryById(selectedExpense.category) : null;
  const splitMembers = selectedExpense && selectedExpense.splitWithIds
    ? group.members.filter((m) => selectedExpense.splitWithIds.includes(m.id))
    : group.members;
  const perPersonShare = selectedExpense && splitMembers.length > 0
    ? selectedExpense.amount / splitMembers.length
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {activeTab === 'gastos' ? (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderGroupHeader}
          renderItem={({ item }) => (
            <ExpenseItem
              expense={item}
              members={group.members}
              onPress={() => handleOpenExpenseDetail(item)}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyExpenses}>
              <Ionicons name="receipt-outline" size={40} color={theme.colors.textMuted} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                No hay gastos registrados en esta categoría
              </Text>
              <Text style={[styles.emptySubText, { color: theme.colors.textSecondary }]}>
                Presiona "Registrar Gasto" para agregar el primero.
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {renderGroupHeader()}
          {renderBalancesTab()}
        </ScrollView>
      )}

      {/* Modal de Detalle de Gasto Completo (Compatible con Web, iOS y Android) */}
      <Modal
        visible={detailModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.surface }]}>
            {selectedExpense && (
              <>
                <View style={styles.modalHeaderRow}>
                  <View style={[styles.modalCategoryBadge, { backgroundColor: categoryInfo?.bgColor }]}>
                    <Ionicons name={categoryInfo?.vectorIcon} size={16} color={categoryInfo?.color} />
                    <Text style={[styles.modalCategoryText, { color: categoryInfo?.color }]}>
                      {categoryInfo?.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={22} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalExpenseTitle, { color: theme.colors.text, fontFamily: theme.fonts.display }]}>
                  {selectedExpense.description}
                </Text>
                <Money
                  amount={selectedExpense.amount}
                  size={36}
                  color={theme.colors.text}
                  style={{ marginBottom: 16 }}
                />

                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                  {/* Pagador */}
                  <View style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                      Pagado por:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {payer ? payer.name : 'Alguien'} {payer?.id === currentUser.id ? '(Tú)' : ''}
                    </Text>
                  </View>

                  {/* Fecha */}
                  <View style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                      Fecha:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {new Date(selectedExpense.date).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>

                  {/* Ubicación si existe */}
                  {selectedExpense.location && selectedExpense.location.address ? (
                    <View style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                        Ubicación:
                      </Text>
                      <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                        {selectedExpense.location.address}
                      </Text>
                    </View>
                  ) : null}

                  {/* Participantes y cuota */}
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
                      División ({splitMembers.length} participantes — {formatCurrency(perPersonShare)} c/u):
                    </Text>
                    <View style={styles.splitMembersList}>
                      {splitMembers.map((m) => (
                        <View
                          key={m.id}
                          style={[styles.splitMemberChip, { backgroundColor: theme.colors.surfaceSecondary }]}
                        >
                          <Text style={[styles.splitMemberName, { color: theme.colors.text }]}>
                            {m.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Foto de Recibo / Boleta si existe */}
                  {selectedExpense.receiptImage ? (
                    <View style={{ marginTop: 14 }}>
                      <Text style={[styles.detailLabel, { color: theme.colors.textSecondary, marginBottom: 6 }]}>
                        Comprobante de Pago Adjunto:
                      </Text>
                      <Image
                        source={{ uri: selectedExpense.receiptImage }}
                        style={styles.modalReceiptImage}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}
                </ScrollView>

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    onPress={handleDeleteSelectedExpense}
                    style={[styles.deleteExpenseBtn, { backgroundColor: theme.colors.dangerBg }]}
                  >
                    <Text style={[styles.deleteExpenseBtnText, { color: theme.colors.danger }]}>
                      Eliminar gasto
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                    style={[styles.closeModalPrimaryBtn, { backgroundColor: theme.colors.primary }]}
                  >
                    <Text style={[styles.closeModalPrimaryBtnText, { color: theme.colors.onPrimary }]}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Barra de acciones inferior */}
      <View
        style={[
          styles.bottomActionBar,
          { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('SettleUp', { groupId: group.id })}
          style={[hs.btnGhost, { borderColor: theme.colors.text }]}
        >
          <Ionicons name="swap-horizontal" size={18} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 }}>
            Liquidar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AddExpense', { groupId: group.id })}
          style={[hs.btnSolid, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="add" size={20} color={theme.colors.onPrimary} />
          <Text style={{ color: theme.colors.onPrimary, fontFamily: theme.fonts.bodyBold, fontSize: 15 }}>
            Registrar gasto
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  headerCard: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  backArrow: {
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
  groupMainInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupIconBig: {
    fontSize: 28,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  groupDesc: {
    fontSize: 12,
  },
  deleteGroupBtn: {
    padding: 8,
  },
  deleteGroupText: {
    fontSize: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    fontWeight: '800',
  },
  categoryFilterRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  balancesContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  balancesSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  memberBalanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  memberBalanceInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  memberSubDetails: {
    fontSize: 12,
  },
  emptyExpenses: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 13,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  modalCategoryIcon: {
    fontSize: 16,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalExpenseTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalExpenseAmount: {
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  splitMembersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  splitMemberChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  splitMemberName: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalReceiptImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  deleteExpenseBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  deleteExpenseBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  closeModalPrimaryBtn: {
    flex: 1.2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeModalPrimaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
    borderTopWidth: 1,
  },
  actionBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '800',
  },
  actionBtnPrimary: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

// Estilos del rediseño (encabezado tipo hero, selector segmentado, filas de balance)
const hs = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, borderBottomWidth: 1, marginBottom: 4 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  ghost: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconTile: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 34, letterSpacing: -1, lineHeight: 38 },
  sub: { fontSize: 14, marginTop: 4, marginBottom: 16 },
  stats: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, paddingVertical: 14, marginBottom: 14 },
  statCol: { flex: 1, paddingHorizontal: 16, gap: 4 },
  vline: { width: 1 },
  caps: { fontSize: 10, letterSpacing: 1.3 },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 12 },
  segBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  track: { height: 4, borderRadius: 2, marginVertical: 6 },
  btnGhost: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 50, borderRadius: 14, borderWidth: 1.5 },
  btnSolid: { flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 50, borderRadius: 14 },
});