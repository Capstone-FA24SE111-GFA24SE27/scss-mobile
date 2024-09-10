import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // For icons

const ResetPassword = ({ navigation }) => {
    const [email, setEmail] = useState("");

    const handlePasswordReset = () => {
        // Logic for resetting password, usually through an API
        console.log("Reset password link sent to:", email);
        // Navigate back to Login after sending reset link
        navigation.navigate("Login");
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back-circle-outline" size={32} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Reset Password</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={24} color="#ccc" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            {/* Send Reset Link Button */}
            <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset}>
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f8f8",
        paddingHorizontal: 20,
    },
    backButton: {
        position: "absolute",
        top: 40, // adjust as needed for your layout
        left: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginBottom: 12,
        width: "100%",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    icon: {
        marginRight: 8,
    },
    resetButton: {
        backgroundColor: "#F39300",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    resetButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default ResetPassword;
