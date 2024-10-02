import React, { useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const Report = () => {
    const navigation = useNavigation();
    const scaleValue = useRef(new Animated.Value(1)).current;

    // Animation handlers
    const handlePressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,  // Shrink button on press
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,  // Restore to original size on release
            useNativeDriver: true,
        }).start();
    };

    const reportData = {
        consultationGoal: {
            specificGoal: 'Improve communication skills',
            reason: 'Student is facing difficulties in team projects',
        },
        consultationContent: {
            summaryOfDiscussion: 'Discussed strategies for effective communication',
            mainIssues: 'Lack of confidence, language barriers',
            studentEmotions: 'Anxious, willing to improve',
            studentReactions: 'Responsive, asked insightful questions',
        },
        consultationConclusion: {
            counselorConclusion: 'Recommended joining a communication workshop',
            followUpNeeded: true,
            followUpNotes: 'Schedule a follow-up in one month',
        },
        intervention: {
            type: 'Workshop Enrollment',
            description:
                'Student should join a 2-week communication workshop to enhance skills',
        },
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {/* Custom Header with Gradient */}
            <LinearGradient
                colors={['#F39300', '#FF5E00']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    {/* Animated Pressable Button with Scale Effect */}
                    <Animated.View style={[styles.backButton, { transform: [{ scale: scaleValue }] }]}>
                        <Pressable
                            onPress={() => navigation.goBack()}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </Pressable>
                    </Animated.View>

                    <Text style={styles.headerTitle}>Consultation Report</Text>
                </View>
            </LinearGradient>

            {/* Main Content with Scroll Bar */}
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={true}  // Show vertical scroll bar
            >
                <Text style={styles.label}>Consultation Goal</Text>
                <Text style={styles.value}>Specific Goal: {reportData.consultationGoal.specificGoal}</Text>
                <Text style={styles.value}>Reason: {reportData.consultationGoal.reason}</Text>

                <Text style={styles.label}>Consultation Content</Text>
                <Text style={styles.value}>Summary of Discussion: {reportData.consultationContent.summaryOfDiscussion}</Text>
                <Text style={styles.value}>Main Issues: {reportData.consultationContent.mainIssues}</Text>
                <Text style={styles.value}>Student Emotions: {reportData.consultationContent.studentEmotions}</Text>
                <Text style={styles.value}>Student Reactions: {reportData.consultationContent.studentReactions}</Text>

                <Text style={styles.label}>Consultation Conclusion</Text>
                <Text style={styles.value}>Counselor Conclusion: {reportData.consultationConclusion.counselorConclusion}</Text>
                <Text style={styles.value}>Follow-up Needed: {reportData.consultationConclusion.followUpNeeded ? 'Yes' : 'No'}</Text>
                {reportData.consultationConclusion.followUpNeeded && (
                    <Text style={styles.value}>Follow-up Notes: {reportData.consultationConclusion.followUpNotes}</Text>
                )}

                <Text style={styles.label}>Intervention</Text>
                <Text style={styles.value}>Type: {reportData.intervention.type}</Text>
                <Text style={styles.value}>Description: {reportData.intervention.description}</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 40,  // Reduced top padding
        paddingBottom: 15,  // Reduced bottom padding
        paddingHorizontal: 16,
        borderBottomLeftRadius: 30,  // Add subtle border radius for modern look
        borderBottomRightRadius: 30,
        backgroundColor: '#F39300',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',  // Vertically align back button and title
        width: '100%',
        justifyContent: 'center',  // Center the title container
    },
    backButton: {
        position: 'absolute',
        left: 16,  // Align the back button to the left
        padding: 10,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,  // Reduced title font size
        fontWeight: 'bold',
        textAlign: 'center',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#333',
    },
    value: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
});

export default Report;
