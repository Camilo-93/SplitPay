import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/apiService';
import { Avatar } from './ui/Avatar';

const AVAILABLE_ICONS = ['👥', '🏢', '🏖️', '⚽', '🍕', '🚗', '🎉', '🛒', '✈️', '🎮', '🍻', '🎓'];

export const CreateGroupModal = ({ visible, onClose, onSubmit }) => {
  const { theme } = useTheme();
  const { colors: c, fonts: f } = theme;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('👥');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);
  const [isFetchingAvatar, setIsFetchingAvatar] = useState(false);

  const handleAddMember = async () => {
    if (!memberInput.trim()) return;

    const memberName = memberInput.trim();
    setIsFetchingAvatar(true);

    try {
      // Consumir API pública externa (RandomUser) para el avatar según sílabo
      const avatarUrl = await apiService.getRandomAvatar(memberName);
      setMembers((prev) => [
        ...prev,
        {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          name: memberName,
          avatarUrl,
        },
      ]);
      setMemberInput('');
    } catch (e) {
      setMembers((prev) => [
        ...prev,
        {
          id: `usr_${Date.now()}`,
          name: memberName,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=F5B82E&color=16140F`,
        },
      ]);
      setMemberInput('');
    } finally {
      setIsFetchingAvatar(false);
    }
  };

  const handleRemoveMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa un nombre para el grupo.');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      icon: selectedIcon,
      members,
    });

    // Resetear formulario
    setName('');
    setDescription('');
    setSelectedIcon('👥');
    setMembers([]);
    setMemberInput('');
    onClose();
  };

  const inputStyle = [
    styles.input,
    { backgroundColor: c.surface, color: c.text, borderColor: c.border, fontFamily: f.bodyMedium },
  ];
  const labelStyle = [styles.label, { color: c.textMuted, fontFamily: f.monoMedium }];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, { backgroundColor: c.overlay }]}
      >
        <View style={[styles.sheet, { backgroundColor: c.background }]}>
          {/* Encabezado */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Cerrar"
              style={[styles.ghost, { borderColor: c.border, backgroundColor: c.surface }]}
            >
              <Ionicons name="close" size={22} color={c.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: c.text, fontFamily: f.display }]}>Nuevo grupo</Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Nombre */}
            <Text style={labelStyle}>NOMBRE</Text>
            <TextInput
              placeholder="Ej. Depa universitario, viaje a Cusco"
              placeholderTextColor={c.textMuted}
              value={name}
              onChangeText={setName}
              style={inputStyle}
            />

            {/* Descripción */}
            <Text style={labelStyle}>DESCRIPCIÓN (OPCIONAL)</Text>
            <TextInput
              placeholder="Ej. Gastos compartidos de fin de semana"
              placeholderTextColor={c.textMuted}
              value={description}
              onChangeText={setDescription}
              style={inputStyle}
            />

            {/* Selector de ícono */}
            <Text style={labelStyle}>ÍCONO DEL GRUPO</Text>
            <View style={styles.iconsGrid}>
              {AVAILABLE_ICONS.map((icon) => {
                const sel = selectedIcon === icon;
                return (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setSelectedIcon(icon)}
                    accessibilityLabel={`Ícono ${icon}`}
                    style={[
                      styles.iconOption,
                      { borderColor: sel ? c.text : c.border, backgroundColor: sel ? c.primaryBg : c.surface },
                      sel && { borderWidth: 2 },
                    ]}
                  >
                    <Text style={styles.iconEmoji}>{icon}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Integrantes */}
            <Text style={labelStyle}>INTEGRANTES · {members.length}</Text>
            <View style={styles.addMemberRow}>
              <TextInput
                placeholder="Nombre del pata"
                placeholderTextColor={c.textMuted}
                value={memberInput}
                onChangeText={setMemberInput}
                onSubmitEditing={handleAddMember}
                style={[...inputStyle, styles.memberInput]}
              />
              <TouchableOpacity
                onPress={handleAddMember}
                disabled={isFetchingAvatar || !memberInput.trim()}
                style={[
                  styles.addMemberBtn,
                  { borderColor: c.text, opacity: memberInput.trim() ? 1 : 0.45 },
                ]}
              >
                {isFetchingAvatar ? (
                  <ActivityIndicator color={c.text} size="small" />
                ) : (
                  <>
                    <Ionicons name="add" size={18} color={c.text} />
                    <Text style={{ color: c.text, fontFamily: f.bodyBold, fontSize: 14 }}>Añadir</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Integrantes agregados */}
            {members.length > 0 ? (
              <View style={styles.membersList}>
                {members.map((m) => (
                  <View key={m.id} style={[styles.memberChip, { borderColor: c.border, backgroundColor: c.surface }]}>
                    <Avatar name={m.name} uri={m.avatarUrl} size={28} />
                    <Text style={{ color: c.text, fontFamily: f.bodyMedium, fontSize: 13 }}>{m.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(m.id)}
                      accessibilityLabel={`Quitar a ${m.name}`}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={16} color={c.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}
            <Text style={[styles.hint, { color: c.textMuted, fontFamily: f.mono }]}>
              El avatar de cada integrante se genera con RandomUser.
            </Text>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: c.border, backgroundColor: c.background }]}>
            <TouchableOpacity
              onPress={handleCreate}
              activeOpacity={0.85}
              style={[styles.btnPrimary, { backgroundColor: c.primary }]}
            >
              <Text style={{ color: c.onPrimary, fontFamily: f.bodyBold, fontSize: 16 }}>Crear grupo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { height: '92%', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  ghost: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, letterSpacing: -0.4 },
  body: { paddingHorizontal: 16 },
  label: { fontSize: 10.5, letterSpacing: 1.4, marginTop: 18, marginBottom: 8 },
  input: { height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 15 },
  iconsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconOption: {
    width: '23%',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 26 },
  addMemberRow: { flexDirection: 'row', gap: 8 },
  memberInput: { flex: 1 },
  addMemberBtn: {
    minWidth: 96,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  membersList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  hint: { fontSize: 11, marginTop: 12 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, borderTopWidth: 1 },
  btnPrimary: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});