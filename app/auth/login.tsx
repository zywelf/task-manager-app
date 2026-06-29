import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import { router } from "expo-router";
import { login } from "../../services/auth";
import i18n from "@/i18n";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(
                i18n.t("auth.errorTitle"),
                i18n.t("auth.errorEmailPassword"),
            );
            return;
        }

        setIsLoading(true);
        try {
            const data = await login({ email, password });

            if (data.token) {
                router.push("/tasks");
            } else if (data.errors) {
                const messages = data.errors
                    .map((e: { message: string }) => e.message)
                    .join("\n");
                Alert.alert(i18n.t("auth.errorValidation"), messages);
            } else {
                Alert.alert(
                    i18n.t("auth.errorTitle"),
                    data.message || i18n.t("auth.errorLogin"),
                );
            }
        } catch {
            Alert.alert(
                i18n.t("auth.errorTitle"),
                i18n.t("auth.errorConnection"),
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{i18n.t("auth.loginTitle")}</Text>
            <Text style={styles.subtitle}>{i18n.t("auth.loginSubtitle")}</Text>
            <TextInput
                style={styles.input}
                placeholder={i18n.t("auth.email")}
                placeholderTextColor="#a0a0a0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder={i18n.t("auth.password")}
                placeholderTextColor="#a0a0a0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading
                        ? i18n.t("auth.loggingIn")
                        : i18n.t("auth.login")}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/auth/register")}>
                <Text style={styles.link}>{i18n.t("auth.noAccount")}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#2DD4BF",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#a0a0a0",
        marginBottom: 32,
        textAlign: "center",
    },
    input: {
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#2e2e2e",
        borderRadius: 8,
        padding: 16,
        color: "#ededed",
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#2DD4BF",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: "#0a0a0a",
        fontWeight: "bold",
        fontSize: 16,
    },
    link: {
        color: "#2DD4BF",
        textAlign: "center",
        fontSize: 14,
    },
});
