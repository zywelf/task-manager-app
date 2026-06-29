import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

interface RegisterInfo {
    name: string;
    email: string;
    password: string;
}

type LoginInfo = Pick<RegisterInfo, "email" | "password">;

export const register = async ({ name, email, password }: RegisterInfo) => {
    const data = await api.post({
        endpoint: "/api/auth/register",
        body: { name, email, password },
    });
    return data;
};

export const login = async ({ email, password }: LoginInfo) => {
    const data = await api.post({
        endpoint: "/api/auth/login",
        body: { email, password },
    });

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
