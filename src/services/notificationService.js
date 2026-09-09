import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el handler de notificaciones en primer plano si está en plataforma soportada
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  // Safe guard en web/testing
}

export const notificationService = {
  /**
   * Solicita permisos de notificación al usuario
   */
  async requestPermissions() {
    if (Platform.OS === 'web') return true;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (error) {
      console.warn('[notificationService] Error solicitando permisos:', error);
      return false;
    }
  },

  /**
   * Dispara o programa una notificación local inmediata
   * @param {string} title
   * @param {string} body
   * @param {Object} [data]
   */
  async scheduleLocalNotification(title, body, data = {}) {
    try {
      if (Platform.OS === 'web') {
        console.log(`[Notificación Web] ${title} - ${body}`);
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Inmediata
      });
    } catch (error) {
      console.warn('[notificationService] Error al disparar notificación:', error);
    }
  },

  /**
   * Notificación recordatorio de deuda pendiente
   */
  async notifyPendingDebt(groupName, amount) {
    return this.scheduleLocalNotification(
      '💸 Recordatorio de SplitPay',
      `Tienes un saldo pendiente de ${amount} en el grupo "${groupName}". ¡Recuerda saldarlo a tiempo!`
    );
  },

  /**
   * Notificación de nuevo gasto registrado
   */
  async notifyExpenseAdded(groupName, expenseConcept, amount) {
    return this.scheduleLocalNotification(
      '🧾 Nuevo gasto registrado',
      `Se agregó "${expenseConcept}" (${amount}) en el grupo "${groupName}".`
    );
  },
};
