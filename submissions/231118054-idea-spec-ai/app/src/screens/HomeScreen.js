import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.center}>
                <Text style={styles.title}>Nokta HITL App</Text>
                <Text style={styles.subtitle}>Select Your Identity</Text>

                <TouchableOpacity
                    style={styles.btnRole}
                    onPress={() => navigation.navigate('Chat')}
                >
                    <Text style={styles.btnRoleText}>User (Start Spec Generation)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btnRole, styles.btnMentor]}
                    onPress={() => navigation.navigate('MentorDashboard')}
                >
                    <Text style={styles.btnRoleText}>Expert (Mentor Dashboard)</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 40 },
    btnRole: {
        backgroundColor: '#1a73e8',
        paddingVertical: 15,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center'
    },
    btnMentor: {
        backgroundColor: '#34a853'
    },
    btnRoleText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});
