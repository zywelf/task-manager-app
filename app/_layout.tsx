import { Stack } from "expo-router";
import { enableScreens } from "react-native-screens";
import Toast from "react-native-toast-message";
import { ThemeProvider } from "@/contexts/ThemeContext";

enableScreens();

export default function RootLayout() {
    return (
        <ThemeProvider>
            <Stack
                screenOptions={{
                    contentStyle: { backgroundColor: "#0a0a0a" },
                    animation: "slide_from_right",
                }}
            >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen
                    name="auth/login"
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="auth/register"
                    options={{ headerShown: false }}
                />
                <Stack.Screen name="tasks" options={{ headerShown: false }} />
            </Stack>
            <Toast />
        </ThemeProvider>
    );
}
