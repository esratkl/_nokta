import React, { useState, useEffect } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView
} from 'react-native';
import { StreamVideo, StreamVideoClient, StreamCall, CallContent } from '@stream-io/video-react-native-sdk';
import {
    fetchToken, getPendingEscalations, acceptEscalation
} from '../services/api';

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || 'YOUR_APP_KEY';

export default function MentorDashboard() {
    const [queue, setQueue] = useState([]);
    const [call, setCall] = useState(null);
    const [videoClient, setVideoClient] = useState(null);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchQueue = async () => {
        try {
            const data = await getPendingEscalations();
            setQueue(data);
        } catch (e) {
            console.log("Queue error", e.message);
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptEscalation(id, 'mentor-1');
            const token = await fetchToken('mentor-1');
            const client = new StreamVideoClient({ apiKey: STREAM_API_KEY, user: { id: 'mentor-1' }, token });
            setVideoClient(client);

            const newCall = client.call('default', id);
            await newCall.join({ create: true });

            // In a real scenario, microphone and camera start automatically via Stream SDK config
            setCall(newCall);
        } catch (e) {
            console.log(e);
        }
    };

    if (call && videoClient) {
        return (
            <SafeAreaView style={styles.flex}>
                <StreamVideo client={videoClient}>
                    <StreamCall call={call}>
                        <View style={styles.videoWrapper}>
                            <Text style={styles.systemHeader}>You are live! Assist the Nokta User.</Text>
                            <CallContent onHangupCallHandler={() => setCall(null)} />
                        </View>
                    </StreamCall>
                </StreamVideo>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.flex}>
            <ScrollView style={styles.padding}>
                <Text style={styles.title}>Pending Escalations</Text>
                {queue.length === 0 && <Text style={styles.empty}>No requests in the queue.</Text>}

                {queue.map(q => (
                    <View key={q.id} style={styles.card}>
                        <Text style={styles.topic}>Topic: {q.topic}</Text>
                        <Text style={styles.status}>Status: {q.status}</Text>
                        <TouchableOpacity style={styles.btnAccept} onPress={() => handleAccept(q.id)}>
                            <Text style={styles.textWhite}>Accept & Join</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#f0f0f0' },
    padding: { padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    empty: { color: '#666', fontStyle: 'italic' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    topic: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
    status: { fontSize: 14, color: '#888', marginBottom: 15 },
    btnAccept: { backgroundColor: '#34a853', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    textWhite: { color: '#fff', fontWeight: 'bold' },
    videoWrapper: { flex: 1, backgroundColor: '#000' },
    systemHeader: { textAlign: 'center', backgroundColor: '#34a853', color: '#fff', padding: 10, fontWeight: 'bold', paddingVertical: 15 }
});
