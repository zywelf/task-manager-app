import { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ReanimatedSwipeable, {
    SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { Check, Undo2, Trash2 } from "lucide-react-native";

type Task = {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
};

type TaskItemProps = {
    item: Task;
    toggleTask: (task: Task) => void;
    deleteTask: (id: number) => void;
};

export default function TaskItem({
    item,
    toggleTask,
    deleteTask,
}: TaskItemProps) {
    const swipeableRef = useRef<SwipeableMethods>(null);

    return (
        <ReanimatedSwipeable
            ref={swipeableRef}
            onSwipeableOpen={(direction) => {
                if (direction === "right") toggleTask(item);
                if (direction === "left") deleteTask(item.id);
                swipeableRef.current?.close();
            }}
            renderLeftActions={() => (
                <View style={styles.completeAction}>
                    <Text style={styles.completeActionText}>
                        {item.completed ? (
                            <Undo2 size={22} color="#0a0a0a" />
                        ) : (
                            <Check size={22} color="#0a0a0a" />
                        )}
                    </Text>
                </View>
            )}
            renderRightActions={() => (
                <View style={styles.deleteAction}>
                    <Text style={styles.deleteActionText}>
                        <Trash2 size={22} color="#fff" />
                    </Text>
                </View>
            )}
        >
            <View style={styles.taskItem}>
                <TouchableOpacity
                    style={styles.taskLeft}
                    onPress={() => toggleTask(item)}
                >
                    <View
                        style={[
                            styles.checkbox,
                            item.completed && styles.checkboxDone,
                        ]}
                    />
                    <View style={{ flex: 1 }}>
                        <Text
                            style={[
                                styles.taskTitle,
                                item.completed && styles.taskTitleDone,
                            ]}
                        >
                            {item.title}
                        </Text>
                        {item.description && (
                            <Text style={[styles.taskDescription, item.completed && styles.taskTitleDone]}>
                                {item.description}
                            </Text>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </ReanimatedSwipeable>
    );
}

const styles = StyleSheet.create({
    taskItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1a1a1a",
        borderRadius: 8,
        padding: 16,
        marginBottom: 8,
    },
    taskLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#2DD4BF",
        marginRight: 12,
    },
    checkboxDone: {
        backgroundColor: "#2DD4BF",
    },
    taskTitle: {
        color: "#ededed",
        fontSize: 16,
        flex: 1,
    },
    taskTitleDone: {
        textDecorationLine: "line-through",
        color: "#a0a0a0",
    },
    taskDescription: {
        color: "#a0a0a0",
        fontSize: 13,
        marginTop: 2,
    },
    completeAction: {
        backgroundColor: "#2DD4BF",
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        borderRadius: 8,
        marginBottom: 8,
    },
    completeActionText: {
        color: "#0a0a0a",
        fontWeight: "bold",
        fontSize: 24,
    },
    deleteAction: {
        backgroundColor: "#dc2626",
        justifyContent: "center",
        alignItems: "center",
        width: 100,
        borderRadius: 8,
        marginBottom: 8,
    },
    deleteActionText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 24,
    },
});
