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

- [Task Manager API](https://github.com/zywelf/task-manager-api) running locally (see its README for the `.env` and Docker setup)
- **Expo Go for SDK 54** on your phone (see below)
- Phone and computer on the same Wi-Fi network

### Expo Go version

This project uses **Expo SDK 54**. The latest Expo Go from the stores only supports the newest SDK, and opening the project shows:

```
Project is incompatible with this version of Expo Go
```

Install the SDK 54 build instead:

- **Android:** download and install the APK from https://expo.dev/go?sdkVersion=54&platform=android&device=true (uninstall the store version first if it conflicts). Turn off auto-update for Expo Go in the Play Store, or it will be replaced by the newest version.
- **iOS:** older Expo Go versions cannot be installed from the App Store; use a [development build](https://docs.expo.dev/develop/development-builds/introduction/) or an iOS simulator.

## Getting Started

```bash
git clone https://github.com/zywelf/task-manager-app
cd task-manager-app
npm install
```

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_URL=http://your-local-ip:3000
```

`your-local-ip` is the local network IP of the computer running the API, not `localhost` (the phone cannot reach the computer through `localhost`). Find it with:

- Linux: `ip addr` (look at `wlan0`/`eth0`)
- macOS: `ipconfig getifaddr en0`
- Windows: `ipconfig` (IPv4 Address)

`.env` is git-ignored: every computer needs its own, because each machine has a different IP. The IP can also change after reconnecting to Wi-Fi; if the app shows "Unable to connect to server", check it again.

Start the app (`-c` clears the cache, needed after changing `.env`):

```bash
npx expo start -c
```

Scan the QR code with Expo Go on your device.

## Related

- [Task Manager API](https://github.com/zywelf/task-manager-api) — Backend REST API
