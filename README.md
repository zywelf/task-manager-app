# Task Manager App

A React Native mobile app for task management built with Expo, TypeScript and expo-router. Features JWT authentication, swipe gestures for task actions, dark/light theme and bilingual support (IT/EN). Connects to the Task Manager API backend.

## Tech Stack

- **Framework:** React Native (Expo SDK 54)
- **Language:** TypeScript
- **Navigation:** expo-router
- **Gestures:** react-native-gesture-handler + ReanimatedSwipeable
- **Animations:** react-native-reanimated
- **Storage:** AsyncStorage (JWT persistence)
- **i18n:** i18n-js + expo-localization
- **Icons:** lucide-react-native
- **Notifications:** react-native-toast-message

## Features

- User registration and login with JWT authentication
- Create tasks with title and optional description
- Swipe right to complete/reopen a task
- Swipe left to delete a task
- Dark/light theme toggle
- Bilingual support (Italian/English) based on device language
- Custom alert component
- Info button with swipe instructions
- FadeIn animations on task list

## Prerequisites

- [Task Manager API](https://github.com/zywelf/task-manager-api) running locally
- [Expo Go](https://expo.dev/go) installed on your device

## Getting Started

```bash
git clone https://github.com/zywelf/task-manager-app
cd task-manager-app
npm install
```

Create a `.env` file:
EXPO_PUBLIC_API_URL=http://your-local-ip:3000

Start the app:

```bash
npx expo start
```

Scan the QR code with Expo Go on your device.

## Related

- [Task Manager API](https://github.com/zywelf/task-manager-api) — Backend REST API