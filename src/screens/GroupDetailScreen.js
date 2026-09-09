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
import { useTheme } from '../context/ThemeContext';
import { useExpenseContext } from '../context/ExpenseContext';
import { useExpenses } from '../hooks/useExpenses';
import { useBalances } from '../hooks/useBalances';
import { ExpenseItem } from '../components/ExpenseItem';
import { BalanceBadge } from '../components/BalanceBadge';
import { CATEGORY_LIST, getCategoryById } from '../utils/categories';
import { formatCurrency } from '../utils/currencyFormatter';
import { apiService } from '../services/apiService';

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
            <Text style={styles.backBtnText}>Volver al inicio</Text>
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

  const renderGroupHeader = () => (
    <View style={[styles.headerCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backIconBtn, { backgroundColor: theme.colors.surfaceSecondary }]}
        >
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>‹</Text>
        </TouchableOpacity>

        <View style={styles.groupMainInfo}>
          <Text style={styles.groupIconBig}>{group.icon || '👥'}</Text>
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[styles.groupTitle, { color: theme.colors.text }]}>
              {group.name}
            </Text>
            <Text numberOfLines={1} style={[styles.groupDesc, { color: theme.colors.textSecondary }]}>
              {group.description || `${group.members.length} integrantes`}
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleDeleteGroup} style={styles.deleteGroupBtn}>
          <Text style={styles.deleteGroupText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Resumen financiero del grupo */}
      <View style={[styles.statsRow, { backgroundColor: theme.colors.surfaceSecondary }]}>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Gasto Total</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {formatCurrency(totalGroupSpent)}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tu Balance</Text>
          <BalanceBadge balance={userNetBalance} compact />
        </View>
      </View>

      {/* Selector de Pestañas (Tab Navigator interno: Gastos / Balances) */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('gastos')}
          style={[
            styles.tabButton,
            activeTab === 'gastos' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 },
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'gastos' ? theme.colors.primary : theme.colors.textSecondary },
              activeTab === 'gastos' && styles.tabButtonTextActive,
            ]}
          >
            🧾 Gastos ({expenses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('balances')}
          style={[
            styles.tabButton,
            activeTab === 'balances' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 },
          ]}
        >
          <Text
            style={[
              styles.tabButtonText,
              { color: activeTab === 'balances' ? theme.colors.primary : theme.colors.textSecondary },
              activeTab === 'balances' && styles.tabButtonTextActive,
            ]}
          >
            ⚖️ Balances ({group.members.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de categoría si la pestaña Gastos está activa */}
      {activeTab === 'gastos' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterRow}>
          <TouchableOpacity
            onPress={() => setFilterCategory(null)}
            style={[
              styles.filterChip,
              { backgroundColor: !filterCategory ? theme.colors.primary : theme.colors.surfaceSecondary },
            ]}
          >
            <Text style={[styles.filterChipText, { color: !filterCategory ? '#fff' : theme.colors.text }]}>
              Todos
            </Text>
          </TouchableOpacity>
          {CATEGORY_LIST.map((cat) => {
            const isSelected = filterCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setFilterCategory(isSelected ? null : cat.id)}
                style={[
                  styles.filterChip,
                  { backgroundColor: isSelected ? cat.color : theme.colors.surfaceSecondary },
                ]}
              >
                <Text style={[styles.filterChipText, { color: isSelected ? '#fff' : theme.colors.text }]}>
                  {cat.icon} {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );

  const renderBalancesTab = () => (
    <View style={styles.balancesContainer}>
      <Text style={[styles.balancesSectionTitle, { color: theme.colors.textSecondary }]}>
        Resumen de participación individual
      </Text>
      {group.members.map((member) => {
        const data = memberBalances[member.id] || { paid: 0, owed: 0, net: 0 };
        return (
          <View
            key={member.id}
            style={[
              styles.memberBalanceCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Image
              source={{
                uri:
                  member.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=10b981&color=fff`,
              }}
              style={styles.memberAvatar}
            />

            <View style={styles.memberBalanceInfo}>
              <Text style={[styles.memberName, { color: theme.colors.text }]}>
                {member.name} {member.id === currentUser.id ? '(Tú)' : ''}
              </Text>
              <Text style={[styles.memberSubDetails, { color: theme.colors.textSecondary }]}>
                Pagó: {formatCurrency(data.paid)} • Le toca: {formatCurrency(data.owed)}
              </Text>
            </View>

            <BalanceBadge balance={data.net} compact />
          </View>
        );
      })}
    </View>
  );

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
              <Text style={styles.emptyEmoji}>🧾</Text>
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
                    <Text style={styles.modalCategoryIcon}>{categoryInfo?.icon}</Text>
                    <Text style={[styles.modalCategoryText, { color: categoryInfo?.color }]}>
                      {categoryInfo?.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                    style={styles.modalCloseBtn}
                  >
                    <Text style={[styles.modalCloseText, { color: theme.colors.textMuted }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalExpenseTitle, { color: theme.colors.text }]}>
                  {selectedExpense.description}
                </Text>
                <Text style={[styles.modalExpenseAmount, { color: theme.colors.primary }]}>
                  {formatCurrency(selectedExpense.amount)}
                </Text>

                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                  {/* Pagador */}
                  <View style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                      Pagado por:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      👤 {payer ? payer.name : 'Alguien'} {payer?.id === currentUser.id ? '(Tú)' : ''}
                    </Text>
                  </View>

                  {/* Fecha */}
                  <View style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                      Fecha:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      📅 {new Date(selectedExpense.date).toLocaleDateString('es-PE', {
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
                        📍 {selectedExpense.location.address}
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
                            ✓ {m.name}
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
                      🗑️ Eliminar Gasto
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                    style={[styles.closeModalPrimaryBtn, { backgroundColor: theme.colors.primary }]}
                  >
                    <Text style={styles.closeModalPrimaryBtnText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Barra de Acciones Inferior */}
      <View
        style={[
          styles.bottomActionBar,
          { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('SettleUp', { groupId: group.id })}
          style={[styles.actionBtnSecondary, { borderColor: theme.colors.primary }]}
        >
          <Text style={[styles.actionBtnSecondaryText, { color: theme.colors.primary }]}>
            🤝 Liquidar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('AddExpense', { groupId: group.id })}
          style={[styles.actionBtnPrimary, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.actionBtnPrimaryText}>＋ Registrar Gasto</Text>
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
