import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    TextInput,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";
import { router } from "expo-router";
import { logout } from "../services/auth";
import { api } from "../services/api";
import TaskItem from "@/components/TaskItem";

type Task = {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
};

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const swipeableRefs = useRef<{ [key: number]: any }>({});

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const data = await api.get({ endpoint: "/api/tasks" });
        if (Array.isArray(data)) setTasks(data);
    };

    const createTask = async () => {
        if (!newTitle.trim()) return;

        const task = await api.post({
            endpoint: "/api/tasks",
            body: {
                title: newTitle,
                description: newDescription.trim() || undefined,
            },
            auth: true,
        });
        if (task.id) {
            setTasks([...tasks, task]);
            setNewTitle("");
            setNewDescription("");
        }
    };

    const toggleTask = async (task: Task) => {
        const updated = await api.put({
            endpoint: `/api/tasks/${task.id}`,
            body: {
                completed: !task.completed,
            },
        });
        if (updated.id) {
            setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
        }
    };

    const deleteTask = async (id: number) => {
        Alert.alert("Elimina task", "Sei sicuro?", [
            { text: "Annulla", style: "cancel" },
            {
                text: "Elimina",
                style: "destructive",
                onPress: async () => {
                    await api.delete({ endpoint: `/api/tasks/${id}` });
                    setTasks(tasks.filter((t) => t.id !== id));
                },
            },
        ]);
    };

    const handleLogout = async () => {
        await logout();
        router.replace("/auth/login");
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>I miei task</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text style={styles.logout}>Esci</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Titolo task"
                        placeholderTextColor="#a0a0a0"
                        value={newTitle}
                        onChangeText={setNewTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Descrizione (opzionale)"
                        placeholderTextColor="#a0a0a0"
                        value={newDescription}
                        onChangeText={setNewDescription}
                    />
                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            !newTitle.trim() && styles.addButtonDisabeld,
                        ]}
                        onPress={createTask}
                        disabled={!newTitle.trim()}
                    >
                        <Text style={styles.addButtonText}>Aggiungi task</Text>
                    </TouchableOpacity>
                </View>
                <Animated.View>
                    <FlatList
                        data={tasks}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item, index }) => (
                            <Animated.View entering={FadeIn.delay(index * 100)}>
                                <TaskItem
                                    item={item}
                                    toggleTask={toggleTask}
                                    deleteTask={deleteTask}
                                />
                            </Animated.View>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                Nessun task. Aggiungine uno!
                            </Text>
                        }
                    />
                </Animated.View>
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        padding: 24,
        paddingTop: 60,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#ededed",
    },
    logout: {
        color: "#2DD4BF",
        fontSize: 16,
    },
    input: {
        backgroundColor: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#2e2e2e",
        borderRadius: 8,
        padding: 12,
        color: "#ededed",
        fontSize: 16,
    },
    addButton: {
        backgroundColor: "#2DD4BF",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    addButtonText: {
        color: "#0a0a0a",
        fontWeight: "bold",
        fontSize: 16,
    },
    emptyText: {
        color: "#a0a0a0",
        textAlign: "center",
        marginTop: 48,
        fontSize: 16,
    },
    inputContainer: {
        marginBottom: 24,
        gap: 8,
    },
    addButtonDisabeld: {
        opacity: 0.4,
    },
});
