import axios from 'axios';
import { Platform } from 'react-native';

// Dynamically handle localhost for Android Emulator vs iOS Simulator vs Web
const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_TOKEN_SERVER_URL) {
        return process.env.EXPO_PUBLIC_TOKEN_SERVER_URL;
    }
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000'; // Android emulator default gateway to host
    }
    return 'http://localhost:3000';
};

export const API_URL = getBaseUrl();

export const mascotChat = async (messages) => {
    const { data } = await axios.post(`${API_URL}/mascot/chat`, { messages });
    return data;
};

export const fetchToken = async (userId) => {
    const { data } = await axios.post(`${API_URL}/token`, { userId });
    return data.token;
};

export const createEscalation = async (userId, topic) => {
    const { data } = await axios.post(`${API_URL}/escalations`, { userId, topic });
    return data;
};

export const getPendingEscalations = async () => {
    const { data } = await axios.get(`${API_URL}/escalations`);
    return data;
};

export const acceptEscalation = async (id, mentorId) => {
    const { data } = await axios.post(`${API_URL}/escalations/${id}/accept`, { mentorId });
    return data;
};

export const resolveEscalation = async (id) => {
    const { data } = await axios.post(`${API_URL}/escalations/${id}/resolve`);
    return data;
};

export const getTranscript = async (callType, callId) => {
    const { data } = await axios.get(`${API_URL}/calls/${callType}/${callId}/transcript`);
    return data;
};
