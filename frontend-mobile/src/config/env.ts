import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Dynamic API Base URL resolver:
 * - Production: Render backend URL
 * - iOS Simulator / Web: http://localhost:5000
 * - Android Emulator: http://10.0.2.2:5000
 * - Physical device: Uses Expo host IP if available
 */
const getDevApiUrl = (): string => {
  // If running in Expo Go on a physical device, expo-constants gives the host machine IP
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost') {
      return `http://${ip}:5000`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? getDevApiUrl() : 'https://integration-testing-yjx4.onrender.com');

export default API_BASE_URL;
