import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    content: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        gap: 12,
    },
    title: {
        color: "#2DD4BF",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    message: {
        color: "#ededed",
        fontSize: 15,
        lineHeight: 22,
    },
    button: {
        backgroundColor: "#2DD4BF",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: "#0a0a0a",
        fontWeight: "bold",
        fontSize: 16,
    },
});
