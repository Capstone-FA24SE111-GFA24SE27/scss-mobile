import React from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Profile({ route, navigation }) {
    const { counselor } = route.params;

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back-circle-outline" size={32} color="#333" />
            </TouchableOpacity>
            <View style={styles.profileCard}>
                <Image source={counselor.image} style={styles.image} />
                <Text style={styles.name}>{counselor.name}</Text>
                <Text style={styles.role}>Counselor</Text>
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Experience:</Text>
                    <Text style={styles.info}>{counselor.experience} years</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Skills:</Text>
                    <Text style={styles.info}>{counselor.skills}</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    backButton: {
        position: "absolute",
        top: 40, // adjust as needed for your layout
        left: 20,
    },
    profileCard: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6,
        alignItems: "center",
        marginVertical: 20,
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: "#F39300",
        marginBottom: 20,
    },
    name: {
        fontSize: 26,
        fontWeight: "700",
        color: "#333",
        textAlign: "center",
    },
    role: {
        fontSize: 18,
        color: "#F39300",
        marginBottom: 20,
        fontWeight: "500",
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginVertical: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    info: {
        fontSize: 16,
        fontWeight: "400",
        color: "#666",
    },
});
