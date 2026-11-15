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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useExpenseContext } from '../context/ExpenseContext';
import { useExpenses } from '../hooks/useExpenses';
import { useBalances } from '../hooks/useBalances';
import { formatCurrency } from '../utils/currencyFormatter';
import { Avatar } from '../components/ui/Avatar';
import { Money } from '../components/ui/Money';
import { Ticket, Stamp } from '../components/ui/Ticket';
import { withAlpha } from '../utils/palette';

// Métodos de pago soportados (Perú): billeteras digitales y efectivo
const PAYMENT_METHODS = [
  { id: 'Yape', name: 'Yape', color: '#742284', letter: 'Y' },
  { id: 'Plin', name: 'Plin', color: '#00A9CE', letter: 'P' },
  { id: 'Efectivo', name: 'Efectivo', color: '#2E7D4F', icon: 'cash-outline' },
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
        '¡Deuda saldada!',
        `Se registró la transferencia de ${formatCurrency(selectedSettlement.amount)} de ${
          selectedSettlement.from.name
        } para ${selectedSettlement.to.name} vía ${selectedMethod}.`
      );
    } catch (e) {
      Alert.alert('Error', 'No se pudo registrar la liquidación.');
    }
  };

  const renderSettlementItem = ({ item, index }) => {
    const c = theme.colors;
    const f = theme.fonts;
    const fromMe = item.from.id === currentUser.id;
    const toMe = item.to.id === currentUser.id;
    const tone = fromMe ? c.danger : toMe ? c.success : c.text;
    const dash = { flex: 1, height: 0, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: c.border };

    return (
      <View style={{ marginVertical: 7 }}>
        <Ticket
          top={
            <>
              <View style={sx.topRow}>
                <Text style={[sx.caps, { color: c.textMuted, fontFamily: f.monoMedium }]}>
                  PAGO SUGERIDO {String(index + 1).padStart(2, '0')}
                </Text>
                {fromMe ? <Stamp label="TÚ PAGAS" color={c.danger} /> : null}
                {toMe ? <Stamp label="TE PAGAN" color={c.success} /> : null}
              </View>

              <View style={sx.flowRow}>
                <View style={sx.personCol}>
                  <Avatar name={item.from.name} uri={item.from.avatarUrl} size={54} />
                  <Text numberOfLines={1} style={[sx.personName, { color: c.text, fontFamily: f.bodyBold }]}>
                    {item.from.name.split(' ')[0]}
                  </Text>
                </View>

                <View style={sx.arrowCol}>
                  <View style={dash} />
                  <Ionicons name="arrow-forward" size={18} color={tone} style={{ marginHorizontal: 4 }} />
                  <View style={dash} />
                </View>

                <View style={sx.personCol}>
                  <Avatar name={item.to.name} uri={item.to.avatarUrl} size={54} />
                  <Text numberOfLines={1} style={[sx.personName, { color: c.text, fontFamily: f.bodyBold }]}>
                    {item.to.name.split(' ')[0]}
                  </Text>
                </View>
              </View>
            </>
          }
          bottom={
            <>
              <View style={{ alignItems: 'center', marginBottom: 14 }}>
                <Money amount={item.amount} size={38} color={tone} />
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleOpenSettleModal(item)}
                style={[sx.payBtn, { backgroundColor: c.primary }]}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={c.onPrimary} />
                <Text style={{ color: c.onPrimary, fontFamily: f.bodyBold, fontSize: 15 }}>Registrar pago</Text>
              </TouchableOpacity>
            </>
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
          style={[sx.ghost, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 20 }]}>
          Liquidar
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={suggestedSettlements}
        keyExtractor={(item) => item.id}
        renderItem={renderSettlementItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={{ paddingHorizontal: 4, paddingTop: 6, paddingBottom: 10 }}>
            <Text style={[sx.caps, { color: theme.colors.textMuted, fontFamily: theme.fonts.monoMedium }]}>
              {group.name.toUpperCase()}
            </Text>
            <View style={sx.bigRow}>
              <Text style={[sx.bigNumber, { color: theme.colors.primary, fontFamily: theme.fonts.display }]}>
                {suggestedSettlements.length}
              </Text>
              <Text style={[sx.bigText, { color: theme.colors.text, fontFamily: theme.fonts.displayMedium }]}>
                {suggestedSettlements.length === 1 ? 'transferencia basta' : 'transferencias bastan'} para dejar todo en cero.
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={56} color={theme.colors.success} />
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
                <Money amount={selectedSettlement.amount} size={40} color={theme.colors.text} />
                <Text style={[styles.modalSub, { color: theme.colors.text }]}>
                  De <Text style={{ fontWeight: '800' }}>{selectedSettlement.from.name}</Text> para{' '}
                  <Text style={{ fontWeight: '800' }}>{selectedSettlement.to.name}</Text>
                </Text>
              </View>
            ) : null}

            <Text style={[styles.methodLabel, { color: theme.colors.textSecondary }]}>
              Selecciona el método de pago:
            </Text>

            <View style={{ gap: 8, marginBottom: 18 }}>
              {PAYMENT_METHODS.map((m) => {
                const sel = selectedMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setSelectedMethod(m.id)}
                    style={[
                      sx.method,
                      {
                        borderWidth: sel ? 2 : 1,
                        borderColor: sel ? m.color : theme.colors.border,
                        backgroundColor: sel ? withAlpha(m.color, 0.1) : 'transparent',
                      },
                    ]}
                  >
                    <View style={[sx.methodMark, { backgroundColor: m.color }]}>
                      {m.icon ? (
                        <Ionicons name={m.icon} size={19} color="#fff" />
                      ) : (
                        <Text style={{ color: '#fff', fontFamily: theme.fonts.display, fontSize: 17 }}>{m.letter}</Text>
                      )}
                    </View>
                    <Text style={{ flex: 1, color: theme.colors.text, fontFamily: theme.fonts.bodyBold, fontSize: 15 }}>
                      {m.name}
                    </Text>
                    {sel ? <Ionicons name="checkmark-circle" size={22} color={m.color} /> : null}
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
                <Text style={[styles.modalBtnConfirmText, { color: theme.colors.onPrimary }]}>Marcar saldado</Text>
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

// Estilos del rediseño (tickets de transferencia, métodos de pago)
const sx = StyleSheet.create({
  ghost: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  caps: { fontSize: 10.5, letterSpacing: 1.4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 30, marginBottom: 14 },
  flowRow: { flexDirection: 'row', alignItems: 'center' },
  personCol: { width: 82, alignItems: 'center' },
  personName: { fontSize: 13, marginTop: 6 },
  arrowCol: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  payBtn: { height: 48, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bigRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 4 },
  bigNumber: { fontSize: 76, lineHeight: 80, letterSpacing: -3 },
  bigText: { fontSize: 18, lineHeight: 22, flex: 1, paddingBottom: 8 },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12 },
  methodMark: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});