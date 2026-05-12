import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    ScrollView, SafeAreaView, Alert
} from 'react-native';
import { StreamVideo, StreamVideoClient, StreamCall, CallContent } from '@stream-io/video-react-native-sdk';
import {
    fetchToken, mascotChat, createEscalation, getPendingEscalations,
    resolveEscalation, getTranscript
} from '../services/api';

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || 'YOUR_APP_KEY';

export default function ChatScreen() {
    const [messages, setMessages] = useState([{ role: 'system', content: 'You are Mascot. Be helpful.' }]);
    const [displayMessages, setDisplayMessages] = useState([
        { id: 1, sender: 'mascot', text: 'Hello! I am Nokta Mascot. Tell me your idea!' }
    ]);
    const [input, setInput] = useState('');
    const [isEscalating, setIsEscalating] = useState(false);
    const [escalationId, setEscalationId] = useState(null);

    // Stream states
    const [call, setCall] = useState(null);
    const [videoClient, setVideoClient] = useState(null);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');

        setDisplayMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMsg }]);
        const currentContext = [...messages, { role: 'user', content: userMsg }];
        setMessages(currentContext);

        if (call) {
            // Mentor chat while in call - handled via Video in MVP
            return;
        }

        try {
            const result = await mascotChat(currentContext);
            setMessages(prev => [...prev, { role: 'assistant', content: result.reply }]);
            setDisplayMessages(prev => [...prev, { id: Date.now() + 1, sender: 'mascot', text: result.reply }]);

            if (result.escalation_needed) {
                Alert.alert(
                    "Expert Needed",
                    "Mascot thinks a human expert is required. Escalating?",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Escalate", onPress: () => requestMentor(userMsg) }
                    ]
                );
            }
        } catch (err) {
            console.error(err);
            setDisplayMessages(prev => [...prev, { id: Date.now() + 1, sender: 'error', text: 'AI Error Connecting.' }]);
        }
    };

    const requestMentor = async (topicMsg) => {
        setIsEscalating(true);
        try {
            const e = await createEscalation('user-demo', topicMsg);
            setEscalationId(e.id);
            pollEscalation(e.id);
        } catch (error) {
            console.log("Escalation error", error);
            setIsEscalating(false);
        }
    };

    const pollEscalation = (id) => {
        const interval = setInterval(async () => {
            const qs = await getPendingEscalations();
            const waiting = qs.find(q => q.id === id);
            if (!waiting) {
                clearInterval(interval);
                joinStreamCall(id);
            }
        }, 5000);
    };

    const joinStreamCall = async (callId) => {
        const userId = 'user-demo';
        const token = await fetchToken(userId);

        const client = new StreamVideoClient({ apiKey: STREAM_API_KEY, user: { id: userId }, token });
        setVideoClient(client);

        const newCall = client.call('default', callId);
        await newCall.join({ create: true });
        setCall(newCall);
        setIsEscalating(false);
    };

    const leaveCall = async () => {
        if (call) {
            await call.leave();
            setCall(null);
            if (escalationId) {
                await resolveEscalation(escalationId);
            }
            try {
                const tr = await getTranscript('default', escalationId);
                setDisplayMessages(prev => [
                    ...prev,
                    { id: Date.now(), sender: 'system', text: `[Mentor Added Context]: ${tr.text}` }
                ]);
            } catch (e) {
                console.log("No transcript fetchable", e);
            }
        }
    };

    if (call && videoClient) {
        return (
            <SafeAreaView style={styles.flex}>
                <StreamVideo client={videoClient}>
                    <StreamCall call={call}>
                        <View style={styles.videoWrapper}>
                            <Text style={styles.systemHeader}>Human Expert Connected. AI paused.</Text>
                            <CallContent onHangupCallHandler={leaveCall} />
                        </View>
                    </StreamCall>
                </StreamVideo>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.flex}>
            <ScrollView style={styles.chatArea} contentContainerStyle={styles.chatContent}>
                {displayMessages.map(m => (
                    <View key={m.id} style={m.sender === 'user' ? styles.bubbleUser : styles.bubbleMascot}>
                        <Text style={m.sender === 'user' ? styles.textWhite : styles.textDark}>{m.text}</Text>
                    </View>
                ))}
                {isEscalating && (
                    <View style={styles.bubbleSystem}>
                        <Text style={styles.textDark}>⏳ Waiting for an Expert Mentor to join...</Text>
                    </View>
                )}
            </ScrollView>
            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="Refine your idea..."
                />
                <TouchableOpacity style={styles.btnSend} onPress={handleSend}>
                    <Text style={styles.textWhite}>Send</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: '#fff' },
    chatArea: { flex: 1 },
    chatContent: { padding: 10, paddingBottom: 30 },
    bubbleUser: { alignSelf: 'flex-end', backgroundColor: '#1a73e8', padding: 12, borderRadius: 18, marginVertical: 4, maxWidth: '80%' },
    bubbleMascot: { alignSelf: 'flex-start', backgroundColor: '#e5e5ea', padding: 12, borderRadius: 18, marginVertical: 4, maxWidth: '80%' },
    bubbleSystem: { alignSelf: 'center', backgroundColor: '#fff3cd', padding: 8, borderRadius: 10, marginVertical: 10 },
    textWhite: { color: '#fff' },
    textDark: { color: '#000' },
    inputArea: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
    input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, marginRight: 10, height: 40 },
    btnSend: { backgroundColor: '#1a73e8', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
    videoWrapper: { flex: 1 },
    systemHeader: { textAlign: 'center', backgroundColor: '#fbbc04', padding: 10, fontWeight: 'bold' }
});
