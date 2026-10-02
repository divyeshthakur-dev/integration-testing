import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  TotpSetup: {
    name: string;
    email: string;
    password: string;
    secret: string;
    qrCodeDataUrl: string;
  };
  RecoveryCodes: {
    recoveryCodes: string[];
  };
};

export type MainTabParamList = {
  Home: undefined;
  Shop: undefined;
  Cart: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ProductDetail: {
    productId: string;
  };
  Checkout: undefined;
  OrderSuccess: {
    orderId: string;
  };
  Orders: undefined;
  OrderDetail: {
    orderId: string;
  };
};
