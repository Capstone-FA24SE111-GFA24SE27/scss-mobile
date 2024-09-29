import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function NotificationDetail({ route }) {
    const { notificationData } = route.params;  // Ensure this matches what was passed from the Notification component

    const navigation = useNavigation();

    // Convert createdDate to a human-readable format
    const formattedDate = new Date(notificationData?.createdDate).toLocaleString();

    return (
        <View style={styles.container}>
            {/* Back button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back-outline" size={28} color="#ffffff" />
                <Text style={styles.backText}>Back to Notifications</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Notification Detail</Text>

            {/* First section: Sender, Title, Date */}
            <View style={styles.sectionContainer}>
                <View style={styles.row}>
                    <Ionicons name="person-outline" size={22} color="#F39300" />
                    <Text style={styles.label}>Sender by:</Text>
                </View>
                <Text style={styles.value}>{notificationData?.sender}</Text>

                <View style={styles.row}>
                    <Ionicons name="information-circle-outline" size={22} color="#F39300" />
                    <Text style={styles.label}>Title:</Text>
                </View>
                <Text style={styles.value}>{notificationData?.title}</Text>

                <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={22} color="#F39300" />
                    <Text style={styles.label}>Date:</Text>
                </View>
                <Text style={styles.value}>{formattedDate}</Text>
            </View>

            {/* Second section: Message */}
            <View style={styles.messageContainer}>
                <View style={styles.row}>
                    <Ionicons name="mail-outline" size={22} color="#F39300" />
                    <Text style={styles.label}>Message:</Text>
                </View>
                <Text style={styles.message}>{notificationData?.message}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#edf1f7',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#F39300',
        borderRadius: 10,
    },
    backText: {
        fontSize: 16,
        color: '#ffffff',
        marginLeft: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#F39300',
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionContainer: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 20, // Space between the two sections
    },
    messageContainer: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 10,
    },
    value: {
        fontSize: 16,
        color: '#555',
        marginTop: 5,
        marginLeft: 35,
    },
    message: {
        fontSize: 16,
        color: '#555',
        marginTop: 10,
        lineHeight: 22,  // Slightly increased line height for better readability
        marginLeft: 35,
    },
});



































































