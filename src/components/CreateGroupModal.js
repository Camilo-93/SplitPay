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
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { apiService } from '../services/apiService';

const AVAILABLE_ICONS = ['👥', '🏢', '🏖️', '⚽', '🍕', '🚗', '🎉', '🛒', '✈️', '🎮', '🍻', '🎓'];

export const CreateGroupModal = ({ visible, onClose, onSubmit }) => {
  const { theme } = useTheme();
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
      // Consumir API pública externa para avatar según sílabo
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
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(memberName)}&background=10b981&color=fff`,
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

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Nuevo Grupo de Gastos</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeText, { color: theme.colors.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Selector de ícono */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Ícono del grupo</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconsRow}>
              {AVAILABLE_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon && {
                      backgroundColor: theme.colors.primaryBg,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Nombre del grupo */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Nombre del grupo *
            </Text>
            <TextInput
              placeholder="Ej. Depa Universitario, Viaje a Cusco..."
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
            />

            {/* Descripción */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Descripción (opcional)
            </Text>
            <TextInput
              placeholder="Ej. Gastos compartidos de fin de semana..."
              placeholderTextColor={theme.colors.textMuted}
              value={description}
              onChangeText={setDescription}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceSecondary,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
            />

            {/* Integrantes */}
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Añadir Integrantes
            </Text>
            <View style={styles.addMemberRow}>
              <TextInput
                placeholder="Nombre del amigo (ej. Alejandro)"
                placeholderTextColor={theme.colors.textMuted}
                value={memberInput}
                onChangeText={setMemberInput}
                onSubmitEditing={handleAddMember}
                style={[
                  styles.input,
                  styles.memberInput,
                  {
                    backgroundColor: theme.colors.surfaceSecondary,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
              />
              <TouchableOpacity
                onPress={handleAddMember}
                disabled={isFetchingAvatar || !memberInput.trim()}
                style={[
                  styles.addMemberBtn,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: memberInput.trim() ? 1 : 0.5,
                  },
                ]}
              >
                {isFetchingAvatar ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.addMemberBtnText}>+ Añadir</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Lista de integrantes agregados */}
            {members.length > 0 ? (
              <View style={styles.membersList}>
                {members.map((m) => (
                  <View
                    key={m.id}
                    style={[styles.memberChip, { backgroundColor: theme.colors.surfaceSecondary }]}
                  >
                    <Text style={[styles.memberName, { color: theme.colors.text }]}>👤 {m.name}</Text>
                    <TouchableOpacity onPress={() => handleRemoveMember(m.id)}>
                      <Text style={[styles.removeChip, { color: theme.colors.danger }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.btnSecondary, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.btnSecondaryText, { color: theme.colors.textSecondary }]}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCreate}
              style={[styles.btnPrimary, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.btnPrimaryText}>Crear Grupo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  iconsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  iconEmoji: {
    fontSize: 22,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberInput: {
    flex: 1,
  },
  addMemberBtn: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
  },
  removeChip: {
    fontSize: 13,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 10,
  },
  btnSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  btnSecondaryText: {
    fontWeight: '700',
    fontSize: 14,
  },
  btnPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
});
