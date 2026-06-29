import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

type CustomAlertProps = {
    title: string;
    message: string[];
    buttonText: string;
    visible: boolean;
    onClose: () => void;
};

export default function CustomAlert({
    title,
    message,
    buttonText,
    visible,
    onClose,
}: CustomAlertProps) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.content}>
                    <Text style={styles.title}>{title}</Text>
                    {message.map((msg, index) => (
                        <Text key={index} style={styles.message}>
                            {msg}
                        </Text>
                    ))}
                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

const getStyles = (colors: { background: string; card: string; border: string; text: string; textMuted: string; teal: string; red: string }) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
        },
        content: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            width: "100%",
            gap: 12,
        },
        title: {
            color: colors.teal,
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 8,
        },
        message: {
            color: colors.text,
            fontSize: 15,
            lineHeight: 22,
        },
        button: {
            backgroundColor: colors.teal,
            padding: 14,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 8,
        },
        buttonText: {
            color: colors.background,
            fontWeight: "bold",
            fontSize: 16,
        },
    });