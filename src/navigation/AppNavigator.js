import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useExpenseContext } from '../context/ExpenseContext';
import { DashboardScreen } from '../screens/DashboardScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { SettleUpScreen } from '../screens/SettleUpScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Stack de inicio: Dashboard → GroupDetail → AddExpense → SettleUp
 */
function HomeStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="SettleUp" component={SettleUpScreen} />
    </Stack.Navigator>
  );
}

/**
 * Navegador principal con Bottom Tabs:
 * - Inicio (stack completo)
 * - Notificaciones (con badge de no leídas)
 */
export const AppNavigator = () => {
  const { theme, isDark } = useTheme();
  const { unreadCount } = useExpenseContext();
  const c = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: theme.fonts.bodyBold,
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Inicio') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
          }
          if (route.name === 'Notificaciones') {
            return (
              <View>
                <Ionicons
                  name={focused ? 'notifications' : 'notifications-outline'}
                  size={size}
                  color={color}
                />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -6,
                      backgroundColor: c.danger,
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 3,
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          }
        },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStack} />
      <Tab.Screen name="Notificaciones" component={NotificationsScreen} />
    </Tab.Navigator>
  );
};
