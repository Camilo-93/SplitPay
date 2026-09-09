import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { useExpenseContext } from '../context/ExpenseContext';
import { CATEGORY_LIST } from '../utils/categories';
import { formatCurrency, parseCurrencyInput } from '../utils/currencyFormatter';

export const AddExpenseScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { theme } = useTheme();
  const { getGroupById, addExpense, currentUser } = useExpenseContext();

  const group = getGroupById(groupId);

  const [description, setDescription] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('comida');
  const [paidById, setPaidById] = useState(currentUser ? currentUser.id : '');
  const [splitWithIds, setSplitWithIds] = useState(
    group && group.members ? group.members.map((m) => m.id) : []
  );
  const [receiptImage, setReceiptImage] = useState(null);
  const [locationData, setLocationData] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Grupo no encontrado</Text>
      </SafeAreaView>
    );
  }

  const numericAmount = parseCurrencyInput(amountInput);
  const splitCount = splitWithIds.length;
  const perPersonShare = splitCount > 0 ? numericAmount / splitCount : 0;

  const toggleParticipant = (memberId) => {
    if (splitWithIds.includes(memberId)) {
      if (splitWithIds.length === 1) {
        Alert.alert('Atención', 'Debe haber al menos un participante para dividir el gasto.');
        return;
      }
      setSplitWithIds((prev) => prev.filter((id) => id !== memberId));
    } else {
      setSplitWithIds((prev) => [...prev, memberId]);
    }
  };

  const handleSelectAllParticipants = () => {
    if (splitWithIds.length === group.members.length) {
      setSplitWithIds([paidById]);
    } else {
      setSplitWithIds(group.members.map((m) => m.id));
    }
  };

  // Abrir selector de comprobante (En Web abre el explorador de archivos directamente)
  const handlePickReceipt = async () => {
    if (Platform.OS === 'web') {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          setReceiptImage(result.assets[0].uri);
        }
      } catch (err) {
        console.warn('Error abriendo selector en web:', err);
      }
      return;
    }

    // En Móvil (iOS / Android)
    Alert.alert(
      'Comprobante de Pago',
      'Selecciona el origen de la foto del recibo o boleta:',
      [
        {
          text: '📸 Tomar Foto con Cámara',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permiso Denegado', 'Se requiere acceso a la cámara.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.7,
              allowsEditing: true,
              aspect: [4, 3],
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              setReceiptImage(result.assets[0].uri);
            }
          },
        },
        {
          text: '🖼️ Elegir de la Galería',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permiso Denegado', 'Se requiere acceso a la galería.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.7,
              allowsEditing: true,
              aspect: [4, 3],
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              setReceiptImage(result.assets[0].uri);
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  // Captura de geolocalización
  const handleGetLocation = async () => {
    setIsFetchingLocation(true);
    try {
      if (Platform.OS === 'web') {
        // En navegador web
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocationData({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              address: `GPS Web (Lat: ${pos.coords.latitude.toFixed(3)}, Lon: ${pos.coords.longitude.toFixed(3)})`,
            });
            setIsFetchingLocation(false);
          },
          () => {
            setLocationData({ address: 'Av. Universitaria 1801, San Miguel, Lima' });
            setIsFetchingLocation(false);
          }
        );
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso Denegado', 'Se requiere permiso de ubicación.');
        setIsFetchingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [addressObj] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const formattedAddress = addressObj
        ? `${addressObj.street || addressObj.name || 'Lugar'}, ${addressObj.district || addressObj.city || 'Lima'}`
        : `Lat: ${loc.coords.latitude.toFixed(4)}, Lon: ${loc.coords.longitude.toFixed(4)}`;

      setLocationData({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: formattedAddress,
      });
    } catch (e) {
      setLocationData({ address: 'Av. Universitaria 1801, San Miguel' });
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Concepto requerido', 'Por favor escribe el concepto del gasto.');
      return;
    }

    if (numericAmount <= 0) {
      Alert.alert('Monto inválido', 'Por favor ingresa un monto mayor a S/. 0.00.');
      return;
    }

    if (splitWithIds.length === 0) {
      Alert.alert('Participantes requeridos', 'Selecciona al menos un participante para dividir el gasto.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addExpense({
        groupId: group.id,
        description: description.trim(),
        amount: numericAmount,
        category: selectedCategory,
        paidById,
        splitWithIds,
        receiptImage,
        location: locationData,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el gasto. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={[styles.closeBtnText, { color: theme.colors.text }]}>✕</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Registrar Nuevo Gasto</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Grupo destino */}
        <View style={[styles.groupBanner, { backgroundColor: theme.colors.surfaceSecondary }]}>
          <Text style={styles.groupBannerIcon}>{group.icon || '👥'}</Text>
          <Text style={[styles.groupBannerName, { color: theme.colors.text }]}>
            En: {group.name}
          </Text>
        </View>

        {/* Input Monto Principal */}
        <View style={[styles.amountCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.currencyPrefix, { color: theme.colors.primary }]}>S/.</Text>
          <TextInput
            placeholder="0.00"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="decimal-pad"
            value={amountInput}
            onChangeText={setAmountInput}
            style={[styles.amountInput, { color: theme.colors.text }]}
          />
        </View>

        {/* Concepto del gasto */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          Concepto / Descripción *
        </Text>
        <TextInput
          placeholder="Ej. Pizza de Estudio, Taxi al aeropuerto, Compras..."
          placeholderTextColor={theme.colors.textMuted}
          value={description}
          onChangeText={setDescription}
          style={[
            styles.textInput,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
        />

        {/* Selector de Categoría */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Categoría</Text>
        <View style={styles.categoriesGrid}>
          {CATEGORY_LIST.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor: isSelected ? cat.bgColor : theme.colors.surface,
                    borderColor: isSelected ? cat.color : theme.colors.border,
                  },
                ]}
              >
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    { color: isSelected ? cat.color : theme.colors.text },
                    isSelected && { fontWeight: '800' },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quién pagó */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>¿Quién pagó el gasto?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalMembers}>
          {group.members.map((member) => {
            const isPayer = paidById === member.id;
            return (
              <TouchableOpacity
                key={member.id}
                onPress={() => setPaidById(member.id)}
                style={[
                  styles.payerChip,
                  {
                    backgroundColor: isPayer ? theme.colors.primary : theme.colors.surface,
                    borderColor: isPayer ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.payerChipText, { color: isPayer ? '#fff' : theme.colors.text }]}>
                  {member.name} {member.id === currentUser.id ? '(Tú)' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Dividir entre quiénes (Multi-select) */}
        <View style={styles.splitHeaderRow}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary, marginBottom: 0 }]}>
            Dividir entre ({splitCount} pers.)
          </Text>
          <TouchableOpacity onPress={handleSelectAllParticipants}>
            <Text style={[styles.selectAllLink, { color: theme.colors.primary }]}>
              {splitWithIds.length === group.members.length ? 'Solo pagador' : 'Todos'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.participantsList}>
          {group.members.map((member) => {
            const isIncluded = splitWithIds.includes(member.id);
            return (
              <TouchableOpacity
                key={member.id}
                onPress={() => toggleParticipant(member.id)}
                style={[
                  styles.participantRow,
                  {
                    backgroundColor: isIncluded ? theme.colors.primaryBg : theme.colors.surface,
                    borderColor: isIncluded ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Image
                  source={{
                    uri:
                      member.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=10b981&color=fff`,
                  }}
                  style={styles.participantAvatar}
                />
                <Text style={[styles.participantName, { color: theme.colors.text }]}>
                  {member.name} {member.id === currentUser.id ? '(Tú)' : ''}
                </Text>
                <Text style={[styles.checkIndicator, { color: isIncluded ? theme.colors.primary : theme.colors.textMuted }]}>
                  {isIncluded ? '✓' : '○'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tarjeta resumen de cuota por persona */}
        {numericAmount > 0 && splitCount > 0 ? (
          <View style={[styles.splitPreviewCard, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Text style={[styles.splitPreviewText, { color: theme.colors.textSecondary }]}>
              💡 Cada participante asume:{' '}
              <Text style={{ fontWeight: '800', color: theme.colors.primary }}>
                {formatCurrency(perPersonShare)}
              </Text>
            </Text>
          </View>
        ) : null}

        {/* Adjuntos: Recibo y Ubicación */}
        <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
          Detalles opcionales (Comprobante y GPS)
        </Text>

        <View style={styles.hardwareButtonsRow}>
          <TouchableOpacity
            onPress={handlePickReceipt}
            style={[styles.hardwareBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            <Text style={styles.hardwareBtnIcon}>📸</Text>
            <Text style={[styles.hardwareBtnText, { color: theme.colors.text }]}>
              {receiptImage ? 'Cambiar Recibo' : 'Adjuntar Recibo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGetLocation}
            disabled={isFetchingLocation}
            style={[styles.hardwareBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          >
            {isFetchingLocation ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : (
              <>
                <Text style={styles.hardwareBtnIcon}>📍</Text>
                <Text style={[styles.hardwareBtnText, { color: theme.colors.text }]}>
                  {locationData ? 'Ubicación OK' : 'Capturar GPS'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Vista previa de foto adjunta */}
        {receiptImage ? (
          <View style={styles.receiptPreviewContainer}>
            <Image source={{ uri: receiptImage }} style={styles.receiptPreviewImage} />
            <TouchableOpacity onPress={() => setReceiptImage(null)} style={styles.removeReceiptBtn}>
              <Text style={styles.removeReceiptText}>✕ Quitar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Vista previa de ubicación */}
        {locationData && locationData.address ? (
          <View style={[styles.locationChip, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Text style={[styles.locationChipText, { color: theme.colors.text }]}>
              📍 {locationData.address}
            </Text>
            <TouchableOpacity onPress={() => setLocationData(null)}>
              <Text style={[styles.locationRemove, { color: theme.colors.danger }]}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* Botón Guardar */}
      <View style={[styles.footerBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: !description.trim() || numericAmount <= 0 || isSubmitting ? 0.6 : 1,
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Gasto</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  groupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    gap: 8,
  },
  groupBannerIcon: {
    fontSize: 20,
  },
  groupBannerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  currencyPrefix: {
    fontSize: 28,
    fontWeight: '800',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 38,
    fontWeight: '900',
    minWidth: 120,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 10,
  },
  textInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalMembers: {
    flexDirection: 'row',
  },
  payerChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  payerChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  splitHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  selectAllLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  participantsList: {
    gap: 8,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  checkIndicator: {
    fontSize: 18,
    fontWeight: '900',
  },
  splitPreviewCard: {
    padding: 12,
    borderRadius: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  splitPreviewText: {
    fontSize: 13,
  },
  hardwareButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  hardwareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  hardwareBtnIcon: {
    fontSize: 18,
  },
  hardwareBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  receiptPreviewContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  receiptPreviewImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  removeReceiptBtn: {
    marginTop: 6,
    padding: 6,
  },
  removeReceiptText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  locationChipText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  locationRemove: {
    fontSize: 14,
    fontWeight: '800',
    paddingLeft: 8,
  },
  footerBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  saveButton: {
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
