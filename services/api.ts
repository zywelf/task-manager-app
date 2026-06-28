import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.128:3000"; // Android emulator
//  const BASE_URL = "http://localhost:3000";   // Web

export const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const api = {
    post: async (endpoint: string, body: object, auth = false) => {
        const headers = auth
            ? await getAuthHeaders()
            : { "Content-type": "application/json" };

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        return response.json();
    },

    get: async (endpoint: string) => {
        const headers = await getAuthHeaders();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "GET",
            headers,
        });

        return response.json();
    },
    put: async (endpoint: string, body: object) => {
        const headers = await getAuthHeaders();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(body),
        });

        return response.json();
    },
    delete: async (endpoint: string) => {
        const headers = await getAuthHeaders();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers,
        });

        return response.json();
    },
};
