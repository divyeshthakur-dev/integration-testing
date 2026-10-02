import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { TotpSetupScreen } from '../screens/auth/TotpSetupScreen';
import { RecoveryCodesScreen } from '../screens/auth/RecoveryCodesScreen';
import { Colors } from '../constants/colors';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: Colors.background,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          title: 'Register',
          headerBackTitle: 'Login',
        }}
      />
      <Stack.Screen
        name="TotpSetup"
        component={TotpSetupScreen}
        options={{
          title: '2-Factor Setup',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="RecoveryCodes"
        component={RecoveryCodesScreen}
        options={{
          title: 'Recovery Codes',
          headerBackVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
