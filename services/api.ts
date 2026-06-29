import AsyncStorage from "@react-native-async-storage/async-storage";

interface RequestOption {
    endpoint: string;
    body?: object;
    auth?: boolean;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL; // Android emulator
//  const BASE_URL = "http://localhost:3000";   // Web

export const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const api = {
    post: async ({ endpoint, body, auth = false }: RequestOption) => {
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

    get: async ({ endpoint }: RequestOption) => {
        const headers = await getAuthHeaders();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "GET",
            headers,
        });

        return response.json();
    },
    put: async ({ endpoint, body }: RequestOption) => {
        const headers = await getAuthHeaders();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(body),
        });

        return response.json();
    },
    delete: async ({ endpoint }: RequestOption) => {
        const headers = await getAuthHeaders();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: "DELETE",
            headers,
        });

        return response.json();
    },
};
