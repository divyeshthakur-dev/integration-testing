# 📱 Next.js to React Native (Expo) Migration Guide

A comprehensive, beginner-friendly technical guide documenting the end-to-end process of converting the **ShopX** Next.js web application into a cross-platform mobile application for iOS and Android using **Expo (SDK 57)** and **React Native (0.86)**.

---

## 📑 Table of Contents

1. [Overview](#1-overview)
   - [What Was Converted](#what-was-converted)
   - [Overall Architecture & Migration Strategy](#overall-architecture--migration-strategy)
2. [Packages Deep-Dive](#2-packages-deep-dive)
   - [Core Framework & Runtime](#core-framework--runtime)
   - [Navigation Architecture](#navigation-architecture)
   - [Storage & Security](#storage--security)
   - [Networking & Configuration](#networking--configuration)
   - [UI Components, Styling & Icons](#ui-components-styling--icons)
   - [Device APIs & Media](#device-apis--media)
3. [Step-by-Step Migration Process](#3-step-by-step-migration-process)
   - [Step 1: Project Initialization & Scaffold](#step-1-project-initialization--scaffold)
   - [Step 2: Installing Native Dependencies with Expo CLI](#step-2-installing-native-dependencies-with-expo-cli)
   - [Step 3: Network Architecture & The "Localhost" IP Solution](#step-3-network-architecture--the-localhost-ip-solution)
   - [Step 4: Secure Storage & Auth Persistence Layer](#step-4-secure-storage--auth-persistence-layer)
   - [Step 5: Design Tokens & Reusable Base Primitives](#step-5-design-tokens--reusable-base-primitives)
   - [Step 6: Navigation Architecture & Typed Route Params](#step-6-navigation-architecture--typed-route-params)
   - [Step 7: Screen-by-Screen Conversion](#step-7-screen-by-screen-conversion)
   - [Step 8: Handling Mobile Device Ergonomics (Safe Areas & Keyboards)](#step-8-handling-mobile-device-ergonomics-safe-areas--keyboards)
   - [Step 9: Testing & Verification Across Simulators & Devices](#step-9-testing--verification-across-simulators--devices)
4. [Page Creation: Recreating a Next.js Page in React Native](#4-page-creation-recreating-a-nextjs-page-in-react-native)
   - [The 7-Step Mental Translation Pipeline](#the-7-step-mental-translation-pipeline)
5. [Code Examples](#5-code-examples)
   - [Example 1: Authentication Page (Next.js vs React Native)](#example-1-authentication-page-nextjs-vs-react-native)
   - [Example 2: Product Catalog & Virtualized Lists](#example-2-product-catalog--virtualized-lists)
6. [Important Differences: Next.js/React vs React Native](#6-important-differences-nextjsreact-vs-react-native)
   - [1. DOM Elements vs Native Primitives](#1-dom-elements-vs-native-primitives)
   - [2. CSS / Tailwind vs StyleSheet (Flexbox Defaults)](#2-css--tailwind-vs-stylesheet-flexbox-defaults)
   - [3. Browser Scrolling vs ScrollView & FlatList](#3-browser-scrolling-vs-scrollview--flatlist)
   - [4. Web Forms vs Mobile Inputs & Keyboards](#4-web-forms-vs-mobile-inputs--keyboards)
   - [5. URL Routing vs Screen Stack Memory](#5-url-routing-vs-screen-stack-memory)
   - [6. localStorage vs SecureStore & AsyncStorage](#6-localstorage-vs-securestore--asyncstorage)
   - [7. The "localhost" Loopback Trap on Emulators & Real Phones](#7-the-localhost-loopback-trap-on-emulators--real-phones)
7. [Final Workflow & Future Page Migration Checklist](#7-final-workflow--future-page-migration-checklist)
   - [Cheat Sheet: HTML/Web to React Native](#quick-reference-cheatsheet)
   - [Developer Execution Checklist](#developer-execution-checklist)

---

## 1. Overview

### What Was Converted

The original web application is an e-commerce platform built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and **Axios**, communicating with an Express/Node.js backend. 

The web platform features:
- **Authentication & Security:** User registration, password login, TOTP Two-Factor Authentication (2FA) setup with QR codes, and recovery codes backup.
- **Product Catalog:** Product browsing, category filtering, search, and dynamic product detail views.
- **Cart & Checkout:** Add to cart, quantity adjustments, order checkout with multi-step address and payment processing.
- **Order Management:** Order history listing and individual order tracking details.
- **User Profile:** Account overview, security status, and logout actions.

All of these web pages have been converted into a native mobile application located in `frontend-mobile/` running on iOS and Android.

### Overall Architecture & Migration Strategy

Converting a web app to mobile is **not** a direct copy-paste operation because web browsers and mobile operating systems operate on entirely different mental models:

```
┌─────────────────────────────────────────────────────────────┐
│                    Web App (Next.js)                        │
│  - DOM Tree (div, span, button, input)                      │
│  - CSS Engine / Tailwind v4 / calc(100vh)                   │
│  - URL Bar / File-System Routing (app/login/page.tsx)       │
│  - Browser window.localStorage & Cookies                   │
│  - http://localhost:5000 API calls                         │
└──────────────────────────────┬──────────────────────────────┘
                               │ MIGRATION PIPELINE
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Mobile App (React Native)                   │
│  - Native Primitives (View, Text, TouchableOpacity, Image)  │
│  - Flexbox Engine (Yoga) + StyleSheet.create()              │
│  - Navigation Containers (Stack & Bottom Tab Navigators)    │
│  - expo-secure-store (Keychain / Keystore) + AsyncStorage   │
│  - Dynamic IP Resolver (10.0.2.2 / LAN IP / Expo hostUri)   │
└─────────────────────────────────────────────────────────────┘
```

The migration followed a **layered conversion strategy**:
1. **Reuse Pure Logic:** TypeScript interfaces, data models, validation regexes, and business calculations (e.g. cart totals, discount algorithms) were carried over with zero changes.
2. **Abstract the Infrastructure Layer:** Replaced browser-specific dependencies (`localStorage`, `window.location`, `navigator.clipboard`) with mobile-native equivalents (`expo-secure-store`, React Navigation, `expo-clipboard`).
3. **Rebuild UI with Native Primitives:** Translated HTML tags and Tailwind classes into reusable React Native components (`Button`, `Input`, `Card`) backed by a centralized design token system (`colors.ts`, `layout.ts`).
4. **Architect Mobile-Native Navigation:** Replaced file-based web routes with an ergonomic combination of a **Native Stack Navigator** (for modal/push screens) and a **Bottom Tab Navigator** (for primary app sections).

---

## 2. Packages Deep-Dive

Every package installed in `frontend-mobile/package.json` fulfills a distinct, critical role in mobile development. Here is the comprehensive breakdown of each dependency.

---

### Core Framework & Runtime

#### `expo` (`~57.0.26`)
- **Why it is needed:** Expo provides the modern toolchain, native runtime wrappers, and Continuous Native Generation (CNG) system for React Native apps.
- **What problem it solves:** Raw React Native requires installing and configuring Xcode, CocoaPods, Android Studio, and NDK before writing a single line of code. Native upgrades frequently break builds due to incompatible native gradle/pod configurations.
- **How it solves the problem:** Expo abstracts the native build system (`ios/` and `android/` directories are generated deterministically via `app.json`). It provides `expo start` for instant hot reloading and guarantees version compatibility across all core mobile plugins.

#### `react` (`19.2.3`) & `react-native` (`0.86.3`)
- **Why it is needed:** `react` provides the declarative component model, hooks (`useState`, `useEffect`, `useCallback`), and Virtual DOM reconciliation. `react-native` binds React component trees to native iOS (UIKit) and Android (Android Views) widgets.
- **What problem it solves:** Standard React (`react-dom`) targets web browsers by generating HTML DOM nodes (`<div />`). Mobile operating systems do not have an HTML engine.
- **How it solves the problem:** React Native replaces `react-dom` with native bridge drivers. When you write `<View />`, React Native renders an `UIView` on iOS and an `android.view.ViewGroup` on Android, ensuring 60fps native performance.

---

### Navigation Architecture

#### `@react-navigation/native` (`^7.5.0`)
- **Why it is needed:** The fundamental container and state manager for mobile navigation.
- **What problem it solves:** On the web, the browser's URL address bar and History API manage navigation. Native mobile apps have no URL address bar; navigation state must be held entirely in JavaScript memory.
- **How it solves the problem:** It provides `<NavigationContainer>`, handles back button presses on Android, manages deep linking, and tracks the current active screen state across the application.

#### `@react-navigation/native-stack` (`^7.20.0`)
- **Why it is needed:** Provides native screen transition animations (e.g. horizontal sliding on iOS, fade/slide on Android) using genuine platform native navigation controllers.
- **What problem it solves:** JavaScript-animated screen transitions can drop frames, jitter during heavy state changes, or feel unnatural compared to system apps.
- **How it solves the problem:** It interfaces directly with `UINavigationController` on iOS and `Fragment` on Android via `react-native-screens`. Screens are animated on the native UI thread, not the JavaScript thread.

#### `@react-navigation/bottom-tabs` (`^7.20.0`)
- **Why it is needed:** Implements the persistent bottom navigation bar ubiquitous in modern mobile applications (Home, Shop, Cart, Profile).
- **What problem it solves:** Web apps typically use top navbar links or hamburger drawer menus. On mobile phones, users interact with their thumbs at the bottom of the screen. Top navbars are ergonomically unreachable on large screens.
- **How it solves the problem:** Renders a persistent, customizable bottom tab bar that keeps tab history independent and provides instant tab switching with badge counts (e.g., cart item count).

#### `react-native-screens` (`~4.26.0`)
- **Why it is needed:** Native memory management primitive required by `@react-navigation`.
- **What problem it solves:** Without native screen management, inactive screens in a navigation stack continue consuming GPU and CPU memory, eventually crashing the app with Out-of-Memory (OOM) errors.
- **How it solves the problem:** When a screen is not visible, `react-native-screens` drops the native view hierarchy from memory while retaining its state in React, keeping memory usage minimal.

---

### Storage & Security

#### `expo-secure-store` (`~57.0.4`)
- **Why it is needed:** Provides hardware-encrypted, secure key-value storage for sensitive data like JWT authentication tokens.
- **What problem it solves:** Web apps often store JWT tokens in `localStorage`. In React Native, standard storage is unencrypted plain text on the device filesystem. If a device is rooted, jailbroken, or inspected via USB debugging, tokens could be stolen.
- **How it solves the problem:** It uses **Apple Keychain** on iOS and **Android Keystore / EncryptedSharedPreferences** on Android. Values are encrypted with device hardware-backed keys before being written to disk.

#### `@react-native-async-storage/async-storage` (`2.2.0`)
- **Why it is needed:** Asynchronous, persistent, unencrypted key-value storage for non-sensitive data (e.g., offline cart items, theme preferences, cached products).
- **What problem it solves:** Replacing `window.localStorage` from the web for general app state.
- **How it solves the problem:** Provides an asynchronous API (`AsyncStorage.getItem`, `setItem`, `removeItem`) that serializes data into platform storage (SQLite/RocksDB on Android, filesystem files on iOS) without blocking the main UI thread.

---

### Networking & Configuration

#### `axios` (`^1.20.0`)
- **Why it is needed:** Feature-rich Promise-based HTTP client for calling backend REST APIs.
- **What problem it solves:** Native `fetch` requires manual JSON serialization, boilerplate error status checking, and manual header injection for every single request.
- **How it solves the problem:** Axios provides request/response interceptors (used in `src/api/client.ts` to automatically attach the Bearer token from `expo-secure-store`), automatic JSON parsing, request timeouts, and unified error handling.

#### `expo-constants` (`~57.0.20`)
- **Why it is needed:** Provides access to build properties, system information, and Expo environment manifests.
- **What problem it solves:** During development, the backend runs on your computer. An Android emulator cannot reach `localhost:5000` (it thinks localhost is itself), and a physical phone over Wi-Fi cannot reach `localhost`.
- **How it solves the problem:** `expo-constants` provides `Constants.expoConfig?.hostUri`, which dynamically exposes the exact IP address of your host development computer. This allows `src/config/env.ts` to dynamically configure the API base URL for any target device without hardcoding IPs.

---

### UI Components, Styling & Icons

#### `react-native-safe-area-context` (`~5.7.0`)
- **Why it is needed:** Provides accurate measurement and insets for screen safe areas (iPhone Dynamic Island, notches, curved corners, and Android software navigation bars).
- **What problem it solves:** Without safe area handling, buttons and text get obscured behind phone notches, status bar clocks, or home indicator swipe bars.
- **How it solves the problem:** It reads the native window insets directly from the OS and exposes `<SafeAreaView>` and the `useSafeAreaInsets()` hook, ensuring content is padded precisely away from hardware obstructions.

#### `expo-status-bar` (`~57.0.1`)
- **Why it is needed:** Controls the appearance of the operating system's top status bar (battery indicator, Wi-Fi icon, clock).
- **What problem it solves:** In dark-themed apps, the default dark icons on Android/iOS become invisible against dark backgrounds.
- **How it solves the problem:** Allows setting `<StatusBar style="light" />` or `<StatusBar style="dark" />` declaratively across screens with zero native code.

#### `expo-linear-gradient` (`~57.0.2`)
- **Why it is needed:** Renders smooth color gradients on native platforms.
- **What problem it solves:** React Native's `StyleSheet` does not support CSS `background: linear-gradient(...)`.
- **How it solves the problem:** It renders native GPU-accelerated gradient layers (`CAGradientLayer` on iOS and Android Gradient Drawables) through a simple JSX component: `<LinearGradient colors={['#6366f1', '#ec4899']} />`.

#### `lucide-react-native` (`^1.50.0`) & `react-native-svg` (`15.15.4`)
- **Why it is needed:** Vector icon library providing modern, clean icons matching the web design.
- **What problem it solves:** The web app used SVG/Lucide icons. React Native does not natively render `<svg>` elements out of the box.
- **How it solves the problem:** `react-native-svg` provides the native C++ and OpenGL rendering pipeline for SVG vector primitives (`Path`, `Circle`, `Rect`). `lucide-react-native` compiles Lucide icons into `react-native-svg` components.

---

### Device APIs & Media

#### `expo-clipboard` (`~57.0.2`)
- **Why it is needed:** Allows the app to read and write text to the device clipboard.
- **What problem it solves:** Web apps use `navigator.clipboard.writeText(...)`. This browser API does not exist on mobile.
- **How it solves the problem:** Calls native clipboard services (`UIPasteboard` on iOS, `ClipboardManager` on Android) via `Clipboard.setStringAsync(text)` (used for copying 2FA recovery codes).

#### `expo-web-browser` (`~57.0.3`)
- **Why it is needed:** Opens web links in a secure, embedded in-app browser modal (`SFSafariViewController` on iOS, `Chrome Custom Tabs` on Android).
- **What problem it solves:** Opening external links with standard linking kicks the user completely out of the app into their external browser.
- **How it solves the problem:** Opens an in-app overlay browser that keeps the user inside your application lifecycle while supporting external URLs (e.g. Terms of Service or external payments).

---

## 3. Step-by-Step Migration Process

Here is the exact step-by-step roadmap followed from initial conception to a fully working native application.

```
Step 1: Init Expo Project (TypeScript template)
   │
Step 2: Install Mobile Dependencies (npx expo install)
   │
Step 3: Setup Network & Dynamic IP Resolver (client.ts & env.ts)
   │
Step 4: Abstract Storage (expo-secure-store + AsyncStorage)
   │
Step 5: Port Design Tokens & Common Primitives (Button, Input, Card)
   │
Step 6: Build Typed Navigation Architecture (Stack & Tab Navigators)
   │
Step 7: Port Business Contexts (AuthContext, CartContext)
   │
Step 8: Port Screens One by One (Web Page.tsx -> Mobile Screen.tsx)
   │
Step 9: Handle Device Ergonomics (Safe Areas, Keyboard Avoiding)
   │
Step 10: Verify & Test on Simulators and Real Devices
```

---

### Step 1: Project Initialization & Scaffold

The mobile project was initialized inside `frontend-mobile/` using Expo's official blank TypeScript template:

```bash
# In the repository root:
npx create-expo-app@latest frontend-mobile --template blank-typescript
```

This generated:
- `package.json` with Expo SDK 57 and React Native 0.86
- `app.json` (mobile manifest configuring app name, slug, bundle identifier, orientation, and splash screen)
- `tsconfig.json` preconfigured for React Native JSX transforms

---

### Step 2: Installing Native Dependencies with Expo CLI

> [!IMPORTANT]
> **Always use `npx expo install` instead of `npm install` for Expo libraries.**
> `npx expo install` automatically checks the Expo SDK compatibility matrix and installs the exact native library version compiled and tested for your Expo SDK, preventing native symbol crashes.

```bash
cd frontend-mobile

# 1. Navigation dependencies
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context

# 2. Storage, Icons & Device utilities
npx expo install @react-native-async-storage/async-storage expo-secure-store expo-status-bar expo-constants expo-linear-gradient expo-clipboard expo-web-browser react-native-svg lucide-react-native axios
```

---

### Step 3: Network Architecture & The "Localhost" IP Solution

On the web, requests to `http://localhost:5000` work because both the browser and backend live on the same operating system loopback.

On mobile, `localhost` refers to the **phone itself**:
- In an **Android Emulator**, your computer is mapped to `10.0.2.2`.
- In an **iOS Simulator**, `localhost` works because it runs as a Mac process.
- On a **Physical Phone** (connected via Wi-Fi), it needs your computer's local network IP (e.g. `192.168.1.45:5000`).

We created `src/config/env.ts` to solve this dynamically:

```typescript
// src/config/env.ts
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevApiUrl = (): string => {
  // If running in Expo Go on a physical device, expo-constants gives the host computer IP
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost') {
      return `http://${ip}:5000`;
    }
  }

  // Android emulator loopback alias
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // iOS simulator or web
  return 'http://localhost:5000';
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? getDevApiUrl() : 'https://integration-testing-yjx4.onrender.com');

export default API_BASE_URL;
```

Next, in `src/api/client.ts`, an Axios instance was configured with an interceptor to read the JWT token from `secureStorage` and automatically inject it into the `Authorization: Bearer <token>` header of every request.

---

### Step 4: Secure Storage & Auth Persistence Layer

We created a unified storage utility in `src/utils/storage.ts`:
- **`secureStorage`:** Backed by `expo-secure-store` on native iOS/Android to keep authentication tokens safe in the hardware keychain.
- **`appStorage`:** Backed by `@react-native-async-storage/async-storage` for non-sensitive data like cart caching.

We then ported `AuthContext.tsx` and `CartContext.tsx` from the Next.js app to React Native:
- When the user logs in, the token is written via `secureStorage.setItem('auth_token', token)`.
- When the app starts, `AuthContext` reads the token during `useEffect`, validates it with `authApi.getMe()`, and immediately authenticates the session without prompting for login again.

---

### Step 5: Design Tokens & Reusable Base Primitives

Web styles in `frontend/app/globals.css` used custom CSS variables (e.g. `--background: #0d0f17`, `--primary: #6366f1`).

In React Native, CSS variables cannot be referenced. We translated these into immutable TypeScript objects:
- `src/constants/colors.ts`: Theme palette (`primary`, `background`, `surface`, `border`, `textMuted`, etc.)
- `src/constants/layout.ts`: Consistent spacing scale (`Spacing.xs` through `Spacing.xxl`) and border radius tokens (`Radius.sm` through `Radius.full`).

We then created reusable primitives matching the web UI:
- `src/components/common/Button.tsx`: Handles loading spinners (`ActivityIndicator`), disabled states, and primary/secondary/danger variants with `TouchableOpacity`.
- `src/components/common/Input.tsx`: Custom text field with label, left icon, password toggle, and validation error messages.
- `src/components/common/Card.tsx`: Elevated container with border and subtle elevation/shadows.

---

### Step 6: Navigation Architecture & Typed Route Params

Next.js uses folder paths (`app/products/[id]/page.tsx`). React Native uses navigation trees. We structured navigation into 3 modules:

1. **`AuthNavigator` (`src/navigation/AuthNavigator.tsx`):**
   Stack containing `Login`, `Signup`, `TotpSetup`, and `RecoveryCodes`.
2. **`MainTabNavigator` (`src/navigation/MainTabNavigator.tsx`):**
   Bottom tab bar containing `Home`, `Shop`, `Cart`, and `Profile`.
3. **`RootNavigator` (`src/navigation/RootNavigator.tsx`):**
   The top-level controller wrapped in `<NavigationContainer>`. It conditionally renders:
   - `Auth` stack when `isAuthenticated === false`
   - `MainTabs` + modal screens (`ProductDetail`, `Checkout`, `OrderSuccess`, `Orders`, `OrderDetail`) when `isAuthenticated === true`.

We defined full TypeScript route safety in `src/navigation/types.ts`:

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  Orders: undefined;
  OrderDetail: { orderId: string };
};
```

---

### Step 7: Screen-by-Screen Conversion

Every page in `frontend/app/` was recreated inside `src/screens/`:
- `frontend/app/login/page.tsx` ➡️ `src/screens/auth/LoginScreen.tsx`
- `frontend/app/signup/page.tsx` ➡️ `src/screens/auth/SignupScreen.tsx`
- `frontend/app/products/page.tsx` ➡️ `src/screens/shop/ProductsScreen.tsx`
- `frontend/app/products/[id]/page.tsx` ➡️ `src/screens/shop/ProductDetailScreen.tsx`
- `frontend/app/cart/page.tsx` ➡️ `src/screens/cart/CartScreen.tsx`
- `frontend/app/checkout/page.tsx` ➡️ `src/screens/cart/CheckoutScreen.tsx`
- `frontend/app/orders/page.tsx` ➡️ `src/screens/profile/OrdersScreen.tsx`

---

### Step 8: Handling Mobile Device Ergonomics (Safe Areas & Keyboards)

Mobile screens must account for physical device constraints:
1. **Screen Notches & Navigation Bars:**
   Every screen is wrapped in `<SafeAreaView style={styles.safeArea}>` from `react-native-safe-area-context` so content does not collide with the iPhone notch or Android status bar.
2. **Soft Keyboard Overlap:**
   When typing in a `<TextInput>`, the on-screen keyboard slides up and covers the inputs. We solved this by nesting form screens inside:
   ```tsx
   <KeyboardAvoidingView
     behavior={Platform.OS === 'ios' ? 'padding' : undefined}
     style={{ flex: 1 }}
   >
     <ScrollView keyboardShouldPersistTaps="handled">
       {/* Inputs */}
     </ScrollView>
   </KeyboardAvoidingView>
   ```

---

### Step 9: Testing & Verification Across Simulators & Devices

Run these diagnostic commands to start and verify the app:

```bash
# Start the Expo development server
npm start

# Typecheck the TypeScript codebase for any compilation errors
npm run typecheck

# Run specifically on an iOS Simulator (macOS only)
npm run ios

# Run specifically on an Android Emulator
npm run android
```

---

## 4. Page Creation: Recreating a Next.js Page in React Native

To convert any page from Next.js into React Native, follow this standardized **7-Step Mental Translation Pipeline**:

```
Web Page (Next.js)                              Mobile Screen (React Native)
┌─────────────────────────┐                     ┌───────────────────────────────┐
│ 'use client'            │  1. Logic & State   │ import React, { useState }    │
│ useState, useEffect     │ ──────────────────> │ useState, useEffect           │
│ useRouter()             │                     │ useNavigation() / ScreenProps │
└─────────────────────────┘                     └───────────────────────────────┘
┌─────────────────────────┐  2. Component Tree  ┌───────────────────────────────┐
│ <div>, <section>        │ ──────────────────> │ <View>, <SafeAreaView>        │
│ <p>, <span>, <h1>       │                     │ <Text>                        │
│ <button onClick={...}>  │                     │ <TouchableOpacity onPress={}> │
└─────────────────────────┘                     └───────────────────────────────┘
┌─────────────────────────┐  3. Form Inputs     ┌───────────────────────────────┐
│ <input                  │ ──────────────────> │ <TextInput                    │
│   value={x}             │                     │   value={x}                   │
│   onChange={e => ...}   │                     │   onChangeText={text => ...}  │
│ />                      │                     │ />                            │
└─────────────────────────┘                     └───────────────────────────────┘
┌─────────────────────────┐  4. Scrolling/Lists ┌───────────────────────────────┐
│ overflow-y: scroll      │ ──────────────────> │ <ScrollView>                  │
│ items.map(...)          │                     │ <FlatList data={items} ... /> │
└─────────────────────────┘                     └───────────────────────────────┘
┌─────────────────────────┐  5. Styling         ┌───────────────────────────────┐
│ className="flex p-4..." │ ──────────────────> │ StyleSheet.create({           │
│ style={{ minHeight }}   │                     │   container: { flex: 1 }      │
└─────────────────────────┘                     │ })                            │
                                                └───────────────────────────────┘
```

### The 7-Step Mental Translation Pipeline

1. **Strip Browser & Next.js Directives:**
   - Remove `'use client';` (React Native is entirely client-side).
   - Replace `import { useRouter } from 'next/navigation'` with `NativeStackScreenProps` or `useNavigation()`.
   - Replace `import Link from 'next/link'` with `<TouchableOpacity onPress={() => navigation.navigate(...)}>` or custom buttons.
2. **Translate Data & API Calls:**
   - Keep your data fetching logic (`useEffect`, `useState`, Axios calls).
   - Ensure the API endpoint uses `apiClient` from `src/api/client.ts`.
3. **Map HTML Primitives to React Native Equivalents:**
   - `<div>`, `<main>`, `<section>` ➡️ `<View>`
   - `<h1>` through `<h6>`, `<p>`, `<span>`, `label` ➡️ `<Text>`
   - `<button>` ➡️ `<TouchableOpacity>` or `src/components/common/Button.tsx`
   - `<img src="..." />` ➡️ `<Image source={{ uri: ... }} />`
4. **Translate Form Inputs:**
   - Replace `<form onSubmit={handleSubmit}>` with a standard `<View>`. Mobile does not have form submission events.
   - Replace `<input onChange={(e) => setVal(e.target.value)} />` with `<TextInput onChangeText={(text) => setVal(text)} />`. Notice `onChangeText` delivers the raw string directly!
5. **Handle Scrolling & Ergonomics:**
   - Wrap the screen content in `<SafeAreaView>` and `<ScrollView contentContainerStyle={...} keyboardShouldPersistTaps="handled">`.
   - For lists of 10+ items, do not use `.map()`. Replace with `<FlatList>`.
6. **Convert Styles to `StyleSheet.create`:**
   - Change CSS kebab-case (`background-color`, `padding-bottom`) to camelCase (`backgroundColor`, `paddingBottom`).
   - Remove `px` or `rem` units (e.g. `padding: '16px'` becomes `padding: 16`).
   - Use design tokens from `src/constants/colors.ts` and `src/constants/layout.ts`.
7. **Register Route in Navigation:**
   - Add the screen route name and parameter types into `src/navigation/types.ts`.
   - Add `<Stack.Screen name="..." component={...} />` into the appropriate navigator.

---

## 5. Code Examples

### Example 1: Authentication Page (Next.js vs React Native)

Let's look at how the web Login Page was translated into the mobile Login Screen.

#### Web Version (Next.js 16)
*Explanation above the code:*
In the Next.js version, we use HTML `<form>`, browser synthetic events (`FormEvent`, `React.ChangeEvent`), CSS string styling, and the Next.js router.

```tsx
// frontend/app/login/page.tsx (Web)
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Web event handler extracting value from HTML Input element
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Browser form submit event with preventDefault
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Stop browser from reloading the page
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/api/auth/login', form);
      login(data.data);
      router.push('/products'); // Browser URL change
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
        <h1>Welcome Back</h1>
        {error && <div className="error-banner">{error}</div>}

        <label>Email Address</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>

        <p>
          Don't have an account? <Link href="/signup">Create Account</Link>
        </p>
      </form>
    </div>
  );
}
```
*Explanation of what the code does below it:*
In Next.js, `<form onSubmit={...}>` captures keyboard "Enter" presses and button clicks, but requires `e.preventDefault()` to stop the browser from issuing an HTTP GET/POST reload. Navigation requires `router.push('/products')`, and layout relies on CSS strings (`minHeight: 100vh`, `display: flex`).

---

#### Mobile Version (React Native + Expo)
*Explanation above the code:*
In the mobile version, we replace HTML elements with native primitives (`SafeAreaView`, `KeyboardAvoidingView`, `ScrollView`, `Text`, `TouchableOpacity`). There is no form submit event; input updates pass string values directly, and navigation is handled through React Navigation's typed `navigation` prop.

```tsx
// frontend-mobile/src/screens/auth/LoginScreen.tsx (Mobile)
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/layout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../hooks/useAuth';
import authApi from '../../api/auth';

// 1. Strongly typed navigation props from React Navigation
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Direct button action (no e.preventDefault needed on mobile)
  const handleLogin = async () => {
    setServerError('');
    if (!email.trim() || !password) {
      setServerError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.login({
        email: email.trim(),
        password,
      });

      if (response.success && response.data) {
        // Writes JWT token to hardware-encrypted secureStorage
        await login(response.data);
      } else {
        setServerError(response.message || 'Login failed.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Network error.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 3. SafeAreaView prevents content from rendering behind the device notch
    <SafeAreaView style={styles.safeArea}>
      {/* 4. KeyboardAvoidingView lifts the form above the on-screen keyboard */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled" // Dismisses keyboard or allows tapping buttons directly
        >
          {/* Header Icon with Native Gradient */}
          <View style={styles.header}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconCircle}
            >
              <LogIn size={26} color={Colors.white} />
            </LinearGradient>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your ShopX account</Text>
          </View>

          {/* Error Banner */}
          {!!serverError && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={Colors.errorLight} />
              <Text style={styles.errorBannerText}>{serverError}</Text>
            </View>
          )}

          {/* Form Card */}
          <Card style={styles.formCard}>
            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              // 5. In React Native, onChangeText provides the string value directly
              onChangeText={(text) => {
                setEmail(text);
                setServerError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              icon={<Mail size={18} color={Colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setServerError('');
              }}
              isPassword
              autoCapitalize="none"
              icon={<Lock size={18} color={Colors.textMuted} />}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: Spacing.sm }}
            />
          </Card>

          {/* Navigation link to Signup */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 6. Native StyleSheet object with density-independent pixel values
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBg,
    borderColor: Colors.errorBorder,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorBannerText: {
    color: Colors.errorLight,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
```
*Explanation of what the code does below it:*
1. **Ergonomic Safety:** Uses `<SafeAreaView>` and `<KeyboardAvoidingView>` so neither the phone notch nor the software keyboard obscures the input fields.
2. **Text Wrapping:** All strings are strictly wrapped inside `<Text>` components to prevent native runtime exceptions.
3. **Direct String Handling:** `onChangeText={(text) => setEmail(text)}` receives the updated string directly instead of unwrapping `e.target.value`.
4. **Hardware Storage:** When `login(data)` is triggered, the authentication token is encrypted into Apple Keychain or Android Keystore via `expo-secure-store`.
5. **Native Styling:** `StyleSheet.create` compiles into native styling structs with zero CSS runtime overhead.

---

### Example 2: Product Catalog & Virtualized Lists

#### Web Version (Next.js: Array.prototype.map)
*Explanation above the code:*
In Next.js, long lists are typically rendered by mapping directly over an array of items inside a scrollable `<div>` or grid.

```tsx
// frontend/app/products/page.tsx (Web)
export default function ProductsPage({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <div key={product._id} className="product-card">
          <img src={product.image} alt={product.name} />
          <h3>{product.name}</h3>
          <p>${product.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
```
*Explanation of what the code does below it:*
On the web, the browser creates a DOM node for every single item in the array simultaneously. If you have 500 products, 500 sets of DOM nodes are instantiated in memory. Browsers handle this with decent tolerance, but doing this on a mobile device leads to severe frame drops and out-of-memory crashes.

---

#### Mobile Version (React Native: FlatList Virtualization)
*Explanation above the code:*
In React Native, product lists must use `<FlatList>`. `FlatList` virtualizes rendering by only mounting items currently visible on the screen, recycling off-screen views to maintain 60fps performance and minimal memory usage.

```tsx
// frontend-mobile/src/screens/shop/ProductsScreen.tsx (Mobile)
import React from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Product } from '../../types';
import { Colors } from '../../constants/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

export function ProductsScreen({ navigation }: Props) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const renderProductItem = ({ item }: { item: Product }) => (
    // 1. TouchableOpacity gives natural touch feedback on mobile
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        {/* 2. numberOfLines={1} truncates text with ellipsis natively */}
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 3. FlatList renders only visible items (virtualization) */}
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderProductItem}
        numColumns={2} // Renders a 2-column mobile grid
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        // 4. Native pull-to-refresh
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {/* fetch products */}}
            tintColor={Colors.primaryLight}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.surfaceLight,
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryLight,
    marginTop: 4,
  },
});
```
*Explanation of what the code does below it:*
1. **Memory Virtualization:** `<FlatList>` recycles views as the user scrolls, allowing thousands of products to be browsed without lag.
2. **Native Pull-to-Refresh:** Integrated `<RefreshControl>` hooks into native iOS and Android pull gestures automatically.
3. **Text Truncation:** `numberOfLines={1}` provides native text ellipsis without requiring CSS `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;`.
4. **Grid Layout:** `numColumns={2}` and `columnWrapperStyle` format the products into a mobile grid with responsive spacing.

---

## 6. Important Differences: Next.js/React vs React Native

Understanding these differences is critical to avoiding bugs and runtime crashes.

| Concept | Next.js / Web React | React Native (Expo) | How to Handle During Migration |
| :--- | :--- | :--- | :--- |
| **Core Primitives** | `<div>`, `<p>`, `<span>`, `<h1>`, `<button>` | `<View>`, `<Text>`, `<TouchableOpacity>`, `<Pressable>` | Replace containers with `<View>` and strings with `<Text>`. Never put raw text in `<View>`. |
| **Styling Engine** | CSS, SCSS, Tailwind CSS (`className="..."`) | `StyleSheet.create({ ... })` (Flexbox Yoga) | Convert class names to JavaScript style objects. Use numbers without units (`16` instead of `16px`). |
| **Flex Direction** | Default is `flex-direction: row` | Default is `flexDirection: 'column'` | If elements need to be side-by-side, explicitly set `flexDirection: 'row'`. |
| **Scrolling** | `overflow: auto` / `overflow: scroll` | `<View>` does **not** scroll! | Wrap content in `<ScrollView>` or `<FlatList>`. Add `keyboardShouldPersistTaps="handled"`. |
| **Lists** | `items.map(item => <Card key={item.id} />)` | `<FlatList data={items} renderItem={...} />` | Always use `<FlatList>` for dynamic lists to get automatic memory virtualization. |
| **Inputs** | `<input value={x} onChange={e => ...} />` | `<TextInput value={x} onChangeText={t => ...} />` | Read raw text argument `t` directly from `onChangeText`. There is no `e.target.value`. |
| **Forms** | `<form onSubmit={e => { e.preventDefault(); ... }}>` | No `<form>` element | Bind submit logic to a button's `onPress`. No form submission or page reload prevention needed. |
| **Routing** | File-system routing (`app/login/page.tsx`), `useRouter` | Stack/Tab navigators, `navigation.navigate('Login')` | Register routes in `navigation/types.ts` and call `navigation.navigate()`. |
| **Storage** | `localStorage.setItem()`, Cookies (Sync) | `expo-secure-store`, `AsyncStorage` (Async) | Always use `await secureStorage.setItem()` for tokens and `AsyncStorage` for general cache. |
| **Images** | `<img src="/logo.png" />` or `next/image` | `<Image source={{ uri: '...' }} />` or `require('./img.png')` | Network images must include explicit width and height, or flex sizing, or they render with 0px dimensions! |
| **Dev API Host** | `http://localhost:5000` | Computer LAN IP / `10.0.2.2` / hostUri | Use dynamic resolver in `src/config/env.ts` to prevent network failures on Android or real phones. |
| **Notches & Bezels** | Browser window handles viewports | App content collides with notches and home bar | Wrap root screens in `<SafeAreaView>` or use `useSafeAreaInsets()`. |

---

### Detailed Analysis of Critical Gotchas

#### 1. DOM Elements vs Native Primitives
In HTML, you can place text anywhere inside a `<div>`:
```html
<!-- Valid on Web -->
<div class="card">Click here</div>
```
In React Native, doing this causes a **red screen crash**:
```tsx
// ❌ CRASHES IN REACT NATIVE:
<View style={styles.card}>Click here</View>

// ✅ CORRECT:
<View style={styles.card}>
  <Text style={styles.text}>Click here</Text>
</View>
```
*Rule:* Every single character of text on screen **must** be inside a `<Text>` component.

#### 2. CSS / Tailwind vs StyleSheet (Flexbox Defaults)
On the web:
- Default `flex-direction` is `row`.
- Elements do not automatically expand unless specified.

In React Native:
- Default `flexDirection` is **`column`**.
- Setting `flex: 1` causes the component to expand and fill all available parent space.
- CSS shorthand properties like `padding: 10px 20px` do **not** exist. You must use `paddingVertical: 10, paddingHorizontal: 20` or specify all four sides individually.

#### 3. Browser Scrolling vs ScrollView & FlatList
On the web, if a page exceeds screen height, the browser automatically provides a scrollbar.
In React Native, `<View>` has **no scroll capability**. If you render 20 items inside a `<View>`, anything below the physical phone screen height is permanently clipped and inaccessible. You must explicitly choose between:
- `<ScrollView>`: For forms, settings screens, or static content of known length.
- `<FlatList>`: For dynamic collections, feeds, and product catalogs.

#### 4. Web Forms vs Mobile Inputs & Keyboards
On mobile, tapping an input summons the device software keyboard, which slides up and covers the lower half of the screen.
- Web forms naturally shift or the browser scrolls up to reveal the active input.
- Mobile apps will render the keyboard directly on top of your input unless wrapped in `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>`.

#### 5. URL Routing vs Screen Stack Memory
Next.js URLs like `/products?category=electronics` allow deep linking, browser back button history, and page reloads.
In React Native:
- Screens are stacked like cards in memory.
- Screen parameters are passed directly as JavaScript objects: `navigation.navigate('ProductDetail', { productId: '123' })`.
- Reading parameters is done via `route.params.productId`.

#### 6. localStorage vs SecureStore & AsyncStorage
- `window.localStorage` is synchronous: `localStorage.getItem('token')` returns the string immediately.
- Mobile storage is **strictly asynchronous**: `const token = await secureStorage.getItem('token')`.
- Any component or context reading storage must handle an `isLoading: boolean` phase while the disk is read on initial app boot.

#### 7. The "localhost" Loopback Trap on Emulators & Real Phones
One of the most common beginner mobile bugs is setting `const API_URL = 'http://localhost:5000'`.
- On your phone or emulator, `localhost` means the phone itself. Since your Node/Express backend is running on your Mac/PC, the phone requests `phone:5000`, which immediately fails with `Network Error` or `Connection Refused`.
- Use the dynamic `src/config/env.ts` resolver which assigns `10.0.2.2:5000` for Android emulators and host machine IP via `Constants.expoConfig?.hostUri` for physical phones running Expo Go.

---

## 7. Final Workflow & Future Page Migration Checklist

Follow this repeatable end-to-end checklist whenever you need to convert an additional page from Next.js to React Native.

### Quick Reference Cheatsheet

#### HTML/Web to React Native
| Web (HTML/Next.js) | React Native (Expo) |
| :--- | :--- |
| `<div />`, `<section />`, `<main />` | `<View />` |
| `<span />`, `<p />`, `<h1>`-`<h6>` | `<Text />` |
| `<button onClick={...} />` | `<TouchableOpacity onPress={...} />` or `<Pressable />` |
| `<input type="text" />` | `<TextInput />` or `<Input />` |
| `<img src="..." />` | `<Image source={{ uri: ... }} />` |
| `<a href="..." />` / `<Link href="..." />` | `<TouchableOpacity onPress={() => navigation.navigate(...)} />` |
| `<form onSubmit={...} />` | `<View />` (bind directly to button `onPress`) |
| `overflow-y: auto` | `<ScrollView />` |
| `items.map(...)` | `<FlatList data={items} renderItem={...} />` |

#### CSS to StyleSheet
| CSS / Tailwind | React Native StyleSheet |
| :--- | :--- |
| `background-color: #0d0f17` / `bg-[#0d0f17]` | `backgroundColor: Colors.background` |
| `padding: 16px` / `p-4` | `padding: 16` |
| `padding: 8px 16px` / `py-2 px-4` | `paddingVertical: 8, paddingHorizontal: 16` |
| `display: flex; flex-direction: row` / `flex flex-row` | `flexDirection: 'row'` |
| `gap: 12px` / `gap-3` | `gap: 12` |
| `border-radius: 8px` / `rounded-lg` | `borderRadius: 8` |
| `color: #fff` / `text-white` | `color: '#ffffff'` (applied to `<Text>` only!) |
| `font-weight: 700` / `font-bold` | `fontWeight: '700'` |
| `cursor: pointer` | *(Not needed; touch feedback handled by TouchableOpacity)* |

---

### Developer Execution Checklist

Use this checklist for every new page:

- [ ] **1. Inspect the Web Page:**
  - Note what URL params the page accepts (`useSearchParams`, `params.id`).
  - Note what backend API endpoints it calls.
  - Note what user interactions exist (buttons, modal toggles, inputs).

- [ ] **2. Define Navigation Types (`src/navigation/types.ts`):**
  - Add the new screen to `RootStackParamList`, `MainTabParamList`, or `AuthStackParamList`.
  - Type all expected params (e.g. `MyNewScreen: { id: string }` or `undefined`).

- [ ] **3. Create the Screen Component (`src/screens/...`):**
  - Create `src/screens/<domain>/<ScreenName>Screen.tsx`.
  - Define strong typing for props:
    ```tsx
    type Props = NativeStackScreenProps<RootStackParamList, 'MyNewScreen'>;
    export function MyNewScreen({ navigation, route }: Props) { ... }
    ```

- [ ] **4. Build the UI Layout:**
  - Wrap top-level in `<SafeAreaView style={styles.safeArea}>`.
  - If the screen contains inputs: wrap in `<KeyboardAvoidingView>` and `<ScrollView keyboardShouldPersistTaps="handled">`.
  - If the screen contains a list: use `<FlatList>`.
  - Convert all HTML tags to React Native primitives.
  - Verify every string is inside `<Text>`.

- [ ] **5. Port Styles to `StyleSheet.create`:**
  - Import `Colors` from `../../constants/colors` and `Spacing, Radius` from `../../constants/layout`.
  - Write styles using camelCase and unitless numbers.
  - Ensure parent containers have `flex: 1` if they need to occupy the full screen height.

- [ ] **6. Wire API Calls:**
  - Import the centralized API client `import apiClient from '../../api/client'`.
  - Verify error handling and show mobile error banners or native `Alert.alert('Error', message)`.

- [ ] **7. Register in the Navigator:**
  - Add `<Stack.Screen name="MyNewScreen" component={MyNewScreen} />` into `RootNavigator.tsx` or `MainTabNavigator.tsx`.

- [ ] **8. Run Typecheck & Test:**
  - Execute `npm run typecheck` in `frontend-mobile/` to confirm zero TypeScript compilation errors.
  - Test on simulator or phone to verify safe areas, keyboard interaction, and network calls.

---

## 8. Summary of Created Project Structure

```
frontend-mobile/
├── App.tsx                    # Root application entry (providers & RootNavigator)
├── app.json                   # Expo mobile configuration & manifest
├── package.json               # Dependencies and execution scripts
├── README.md                  # This technical migration guide
├── tsconfig.json              # TypeScript compilation configuration
└── src/
    ├── api/                   # Network layer
    │   ├── auth.ts            # Auth & 2FA API endpoints
    │   ├── cart.ts            # Cart management API endpoints
    │   ├── client.ts          # Axios instance with secure token interceptor
    │   ├── orders.ts          # Order history & details API endpoints
    │   └── products.ts        # Product catalog & search API endpoints
    ├── components/            # Reusable UI primitives
    │   ├── cart/              # Cart-specific components
    │   ├── common/            # Button, Input, Card base components
    │   └── product/           # ProductCard & badge components
    ├── config/                # Environment variables
    │   └── env.ts             # Dynamic API base URL resolver (localhost/emulator/LAN)
    ├── constants/             # Design tokens
    │   ├── colors.ts          # Color palette matching web theme
    │   ├── layout.ts          # Spacing and border radius scales
    │   └── states.ts          # Common state constants
    ├── context/               # Global state providers
    │   ├── AuthContext.tsx    # User authentication & token state
    │   └── CartContext.tsx    # Shopping cart items & calculations
    ├── hooks/                 # Custom React hooks
    │   ├── useAuth.ts         # Hook to access AuthContext
    │   └── useCart.ts         # Hook to access CartContext
    ├── navigation/            # Navigation structure
    │   ├── AuthNavigator.tsx  # Stack for unauthenticated users (Login, Signup, 2FA)
    │   ├── MainTabNavigator.tsx # Bottom tab bar (Home, Shop, Cart, Profile)
    │   ├── RootNavigator.tsx  # Root navigation container & auth state switch
    │   └── types.ts           # TypeScript route param types for all screens
    ├── screens/               # Screen components ported from Next.js pages
    │   ├── auth/              # Login, Signup, TotpSetup, RecoveryCodes
    │   ├── cart/              # Cart, Checkout, OrderSuccess
    │   ├── home/              # HomeScreen
    │   ├── profile/           # Profile, Orders, OrderDetail
    │   └── shop/              # Products, ProductDetail
    ├── types/                 # Shared TypeScript models (User, Product, Order)
    └── utils/                 # Utilities
        └── storage.ts         # SecureStore & AsyncStorage wrapper
```
