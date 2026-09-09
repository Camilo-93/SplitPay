import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { DashboardScreen } from '../screens/DashboardScreen';
import { GroupDetailScreen } from '../screens/GroupDetailScreen';
import { AddExpenseScreen } from '../screens/AddExpenseScreen';
import { SettleUpScreen } from '../screens/SettleUpScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="SettleUp" component={SettleUpScreen} />
    </Stack.Navigator>
  );
};
