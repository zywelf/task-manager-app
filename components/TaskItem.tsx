import { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import ReanimatedSwipeable, {
    SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { Check, Undo2, Trash2 } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";

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
    const { colors } = useTheme();
    const styles = getStyles(colors);

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
                    {item.completed ? (
                        <Undo2 size={22} color={colors.background} />
                    ) : (
                        <Check size={22} color={colors.background} />
                    )}
                </View>
            )}
            renderRightActions={() => (
                <View style={styles.deleteAction}>
                    <Trash2 size={22} color="#fff" />
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

const getStyles = (colors: { background: string; card: string; border: string; text: string; textMuted: string; teal: string; red: string }) =>
    StyleSheet.create({
        taskItem: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: colors.card,
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
            borderColor: colors.teal,
            marginRight: 12,
        },
        checkboxDone: {
            backgroundColor: colors.teal,
        },
        taskTitle: {
            color: colors.text,
            fontSize: 16,
            flex: 1,
        },
        taskTitleDone: {
            textDecorationLine: "line-through",
            color: colors.textMuted,
        },
        taskDescription: {
            color: colors.textMuted,
            fontSize: 13,
            marginTop: 2,
        },
        completeAction: {
            backgroundColor: colors.teal,
            justifyContent: "center",
            alignItems: "center",
            width: 100,
            borderRadius: 8,
            marginBottom: 8,
        },
        deleteAction: {
            backgroundColor: colors.red,
            justifyContent: "center",
            alignItems: "center",
            width: 100,
            borderRadius: 8,
            marginBottom: 8,
        },
    });