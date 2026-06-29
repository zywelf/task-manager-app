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
import { register } from "../../services/auth";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        console.log("HandleRegister chiamato", { name, email, password });
        if (!name || !email || !password) {
            Alert.alert("Errore", "Tutti i campi sono obbligatori");
            return;
        }

        setIsLoading(true);
        try {
            const data = await register({ name, email, password });
            console.log("Risposta API", data);
            if (data.user) {
                Alert.alert("Successo", "Account creato! Accedi ora.", [
                    {
                        text: "OK",
                        onPress: () => router.push("/auth/login"),
                    },
                ]);
            } else if (data.errors) {
                const messages = data.errors
                    .map((e: { message: string }) => e.message)
                    .join("\n");
                Alert.alert("Errore di validazione", messages);
            } else {
                Alert.alert("Errore", data.message || "Registrazione fallita");
            }
        } catch {
            Alert.alert("Errore", "Impossibile connettersi al server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Task Manager</Text>
            <Text style={styles.subtitle}>Crea il tuo account</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                placeholderTextColor="#a0a0a0"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#a0a0a0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#a0a0a0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? "Registrazione..." : "Registrati"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text style={styles.link}>Hai già un account? Accedi</Text>
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
