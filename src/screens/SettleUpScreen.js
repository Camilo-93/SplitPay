import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenseContext } from '../context/ExpenseContext';
import { useExpenses } from '../hooks/useExpenses';
import { useBalances } from '../hooks/useBalances';
import { formatCurrency } from '../utils/currencyFormatter';

const PAYMENT_METHODS = [
  { id: 'Yape', name: 'Yape 💜', color: '#742284', bgColor: '#f3e8ff' },
  { id: 'Plin', name: 'Plin 💙', color: '#00a4e4', bgColor: '#e0f2fe' },
  { id: 'Efectivo', name: 'Efectivo 💵', color: '#059669', bgColor: '#d1fae5' },
];

export const SettleUpScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { theme, isDark } = useTheme();
  const { getGroupById, settleDebt, currentUser } = useExpenseContext();

  const group = getGroupById(groupId);
  const { expenses } = useExpenses(groupId);
  const { suggestedSettlements, userNetBalance } = useBalances(group, expenses, currentUser.id);

  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('Yape');
  const [modalVisible, setModalVisible] = useState(false);

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Grupo no encontrado</Text>
      </SafeAreaView>
    );
  }

  const handleOpenSettleModal = (settlement) => {
    setSelectedSettlement(settlement);
    setSelectedMethod('Yape');
    setModalVisible(true);
  };

  const handleConfirmSettlement = async () => {
    if (!selectedSettlement) return;

    try {
      await settleDebt({
        groupId: group.id,
        fromMemberId: selectedSettlement.from.id,
        toMemberId: selectedSettlement.to.id,
        amount: selectedSettlement.amount,
        method: selectedMethod,
      });

      setModalVisible(false);
      Alert.alert(
        '¡Deuda Saldada! 🎉',
        `Se registró la transferencia de ${formatCurrency(selectedSettlement.amount)} de ${
          selectedSettlement.from.name
        } para ${selectedSettlement.to.name} vía ${selectedMethod}.`
      );
    } catch (e) {
      Alert.alert('Error', 'No se pudo registrar la liquidación.');
    }
  };

  const renderSettlementItem = ({ item }) => {
    const isCurrentUserFrom = item.from.id === currentUser.id;
    const isCurrentUserTo = item.to.id === currentUser.id;

    return (
      <View
        style={[
          styles.settlementCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isCurrentUserFrom
              ? theme.colors.danger
              : isCurrentUserTo
              ? theme.colors.success
              : theme.colors.border,
          },
        ]}
      >
        {/* Avatares y flujo de transferencia */}
        <View style={styles.transferFlowRow}>
          <View style={styles.personCol}>
            <Image
              source={{
                uri:
                  item.from.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(item.from.name)}&background=ef4444&color=fff`,
              }}
              style={styles.personAvatar}
            />
            <Text numberOfLines={1} style={[styles.personName, { color: theme.colors.text }]}>
              {item.from.name} {isCurrentUserFrom ? '(Tú)' : ''}
            </Text>
            <Text style={[styles.roleBadge, { color: theme.colors.danger }]}>Deudor</Text>
          </View>

          <View style={styles.arrowCol}>
            <Text style={[styles.amountPill, { color: theme.colors.primary }]}>
              {formatCurrency(item.amount)}
            </Text>
            <Text style={[styles.arrowSymbol, { color: theme.colors.primary }]}>➔</Text>
            <Text style={[styles.transferLabel, { color: theme.colors.textMuted }]}>transfiere a</Text>
          </View>

          <View style={styles.personCol}>
            <Image
              source={{
                uri:
                  item.to.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(item.to.name)}&background=10b981&color=fff`,
              }}
              style={styles.personAvatar}
            />
            <Text numberOfLines={1} style={[styles.personName, { color: theme.colors.text }]}>
              {item.to.name} {isCurrentUserTo ? '(Tú)' : ''}
            </Text>
            <Text style={[styles.roleBadge, { color: theme.colors.success }]}>Acreedor</Text>
          </View>
        </View>

        {/* Botón de acción para saldar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleOpenSettleModal(item)}
          style={[styles.settleActionBtn, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.settleActionBtnText}>
            ✓ Registrar Pago / Saldar Cuentas
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Liquidación de Deudas
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={suggestedSettlements}
        keyExtractor={(item) => item.id}
        renderItem={renderSettlementItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.explanationBox}>
            <Text style={[styles.groupTag, { color: theme.colors.primary }]}>
              {group.icon} {group.name}
            </Text>
            <Text style={[styles.explanationTitle, { color: theme.colors.text }]}>
              Transferencias Óptimas Sugeridas
            </Text>
            <Text style={[styles.explanationDesc, { color: theme.colors.textSecondary }]}>
              El algoritmo calcula la menor cantidad de transacciones necesarias para que nadie deba dinero en el grupo.
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              ¡Todas las cuentas están al día!
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              No hay deudas pendientes por liquidar en este momento.
            </Text>
          </View>
        )}
      />

      {/* Modal para Confirmar Método de Pago (Yape, Plin, Efectivo) */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Confirmar Liquidación
            </Text>

            {selectedSettlement ? (
              <View style={styles.modalDetails}>
                <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
                  Monto a saldar:
                </Text>
                <Text style={[styles.modalAmount, { color: theme.colors.primary }]}>
                  {formatCurrency(selectedSettlement.amount)}
                </Text>
                <Text style={[styles.modalSub, { color: theme.colors.text }]}>
                  De <Text style={{ fontWeight: '800' }}>{selectedSettlement.from.name}</Text> para{' '}
                  <Text style={{ fontWeight: '800' }}>{selectedSettlement.to.name}</Text>
                </Text>
              </View>
            ) : null}

            <Text style={[styles.methodLabel, { color: theme.colors.textSecondary }]}>
              Selecciona el método de pago:
            </Text>

            <View style={styles.methodsRow}>
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => setSelectedMethod(method.id)}
                    style={[
                      styles.methodCard,
                      {
                        backgroundColor: isSelected ? method.bgColor : theme.colors.surfaceSecondary,
                        borderColor: isSelected ? method.color : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.methodName,
                        { color: isSelected ? method.color : theme.colors.text },
                        isSelected && { fontWeight: '800' },
                      ]}
                    >
                      {method.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtnCancel, { borderColor: theme.colors.border }]}
              >
                <Text style={[styles.modalBtnCancelText, { color: theme.colors.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmSettlement}
                style={[styles.modalBtnConfirm, { backgroundColor: theme.colors.primary }]}
              >
                <Text style={styles.modalBtnConfirmText}>Marcar Saldado</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  explanationBox: {
    marginBottom: 20,
  },
  groupTag: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  explanationTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  explanationDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  settlementCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  transferFlowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  personCol: {
    alignItems: 'center',
    width: '32%',
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
  },
  personName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  arrowCol: {
    alignItems: 'center',
    width: '36%',
  },
  amountPill: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  arrowSymbol: {
    fontSize: 24,
    fontWeight: '700',
  },
  transferLabel: {
    fontSize: 11,
  },
  settleActionBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settleActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 14,
    textAlign: 'center',
  },
  modalDetails: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  modalText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalAmount: {
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 4,
  },
  modalSub: {
    fontSize: 14,
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  methodCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodName: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalBtnConfirm: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalBtnConfirmText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
