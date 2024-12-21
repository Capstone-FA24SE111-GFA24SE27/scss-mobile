import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GatherInfo = ({
  showModal,
  formValues,
  handleAddProfile,
  handleSkip,
  handleInputChange,
}) => {
  const { width, height } = Dimensions.get("window");
  const scrollViewRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (scrollViewRef.current && currentPage < 5) {
      scrollViewRef.current.scrollTo({
        x: (currentPage + 1) * width * 0.95,
        animated: true,
      });
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (scrollViewRef.current && currentPage > 0) {
      scrollViewRef.current.scrollTo({
        x: (currentPage - 1) * width * 0.95,
        animated: true,
      });
      setCurrentPage(currentPage - 1);
    }
  };

  const renderAttribute = (label, key) => {
    const value = formValues[key] || "";
    return (
      <View style={{ marginVertical: 10 }}>
        <Text
          style={{
            color: "#333",
            fontWeight: "bold",
            fontSize: 16,
            marginBottom: 4,
          }}
        >
          {label}:
        </Text>
        <TextInput
          value={value}
          onChangeText={(value) => handleInputChange(key, value)}
          style={{
            fontSize: 18,
            opacity: 0.8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: "#ededed",
            borderRadius: 10,
            borderColor: "gray",
            borderWidth: 1,
          }}
        />
      </View>
    );
  };

  return (
    <Modal visible={showModal} transparent={true} animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
        }}
      >
        <View
          style={{
            width: width * 0.95,
            backgroundColor: "white",
            borderRadius: 10,
            marginTop: 20,
          }}
        >
          <ScrollView
            horizontal
            pagingEnabled
            ref={scrollViewRef}
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            style={{ width: width * 0.95 }}
          >
            <View
              style={{
                width: width * 0.95,
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginBottom: 16,
                }}
              >
                {renderAttribute("Introduction", "introduction")}
              </View>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 10,
                    color: "#F39300",
                  }}
                >
                  Physical and Mental Health Information
                </Text>
                {renderAttribute(
                  "Current Health Status",
                  "currentHealthStatus"
                )}
                {renderAttribute("Psychological Status", "psychologicalStatus")}
                {renderAttribute("Stress Factors", "stressFactors")}
              </View>
            </View>
            <View
              style={{
                width: width * 0.95,
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 10,
                    color: "#F39300",
                  }}
                >
                  Study Information
                </Text>
                {renderAttribute(
                  "Academic Difficulties",
                  "academicDifficulties"
                )}
                {renderAttribute("Study Plan", "studyPlan")}
              </View>
            </View>
            <View
              style={{
                width: width * 0.95,
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 10,
                    color: "#F39300",
                  }}
                >
                  Career Information
                </Text>
                {renderAttribute("Career Goals", "careerGoals")}
                {renderAttribute("Part-time Experience", "partTimeExperience")}
                {renderAttribute("Internship Program", "internshipProgram")}
              </View>
            </View>
            <View
              style={{
                width: width * 0.95,
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 10,
                    color: "#F39300",
                  }}
                >
                  Activities and Life Information
                </Text>
                {renderAttribute(
                  "Extracurricular Activities",
                  "extracurricularActivities"
                )}
                {renderAttribute("Personal Interests", "personalInterests")}
                {renderAttribute("Social Relationships", "socialRelationships")}
              </View>
            </View>
            <View
              style={{
                width: width * 0.95,
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 10,
                    color: "#F39300",
                  }}
                >
                  Financial Support Information
                </Text>
                {renderAttribute("Financial Situation", "financialSituation")}
                {renderAttribute("Financial Support", "financialSupport")}
              </View>
            </View>
            <View
              style={{
                width: width * 0.95,
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 8,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  paddingVertical: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 18,
                    marginBottom: 10,
                    color: "#F39300",
                  }}
                >
                  Counseling Request
                </Text>
                {renderAttribute(
                  "Desired Counseling Fields",
                  "desiredCounselingFields"
                )}
              </View>
            </View>
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            {currentPage > 0 ? (
              <TouchableOpacity
                onPress={handlePrev}
                style={{
                  backgroundColor: "#F39300",
                  padding: 4,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="chevron-back" size={30} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                disabled
                style={{
                  backgroundColor: "#e3e3e3",
                  padding: 4,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="chevron-back" size={30} color="gray" />
              </TouchableOpacity>
            )}
            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 10,
                marginHorizontal: 4,
                width: "auto",
                height: width * 0.1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "white",
                borderWidth: 1.5,
                borderColor: "#F39300",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                {currentPage + 1} / 6
              </Text>
            </View>
            {currentPage < 5 ? (
              <TouchableOpacity
                onPress={handleNext}
                style={{
                  backgroundColor: "#F39300",
                  padding: 4,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="chevron-forward" size={30} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                disabled
                style={{
                  backgroundColor: "#e3e3e3",
                  padding: 4,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="chevron-forward" size={30} color="gray" />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            <Text style={{ fontSize: 16, color: "gray" }}>
              * Providing these information can assist counselors in better
              understanding and supporting you during the counseling process.
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
            }}
          >
            <TouchableOpacity
              onPress={handleSkip}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: "white",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "gray",
              }}
            >
              <Text
                style={{
                  color: "gray",
                  fontSize: 18,
                  fontWeight: "600",
                  opacity: 0.8,
                }}
              >
                Skip for now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={
                !Object.values(formValues).some((value) => value !== "")
              }
              onPress={handleAddProfile}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 6,
                marginLeft: 8,
                backgroundColor: !Object.values(formValues).some(
                  (value) => value !== ""
                )
                  ? "#e3e3e3"
                  : "#F39300",
                borderRadius: 20,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: !Object.values(formValues).some(
                  (value) => value !== ""
                )
                  ? "#e3e3e3"
                  : "#F39300",
              }}
            >
              <Text
                style={{
                  color: !Object.values(formValues).some(
                    (value) => value !== ""
                  )
                    ? "gray"
                    : "white",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GatherInfo;
