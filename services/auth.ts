import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export const register = async (
    name: string,
    email: string,
    password: string,
) => {
    const data = await api.post("/api/auth/register", {
        name,
        email,
        password,
    });
    return data;
};

export const login = async (email: string, password: string) => {
    const data = await api.post("/api/auth/login", { email, password });

    if (data.token) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
};

export const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
};

export const getToken = async () => {
    return await AsyncStorage.getItem("token");
};
