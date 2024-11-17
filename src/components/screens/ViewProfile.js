import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";
import axiosJWT, { BASE_URL } from "../../config/Config";
import Toast from "react-native-toast-message";

export default function ViewProfile() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { fetchProfile } = useContext(AuthContext);
  const [counselingProfile, setCounselingProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formValues, setFormValues] = useState({});
  const scrollViewRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [editMode])
  );

  useEffect(() => {
    fetchStudentDoc();
  }, []);

  const fetchStudentDoc = async () => {
    try {
      const docRes = await axiosJWT.get(`${BASE_URL}/students/document/info`);
      const docData = docRes?.data?.content?.counselingProfile;
      setCounselingProfile(docData);
      setFormValues(docData || {});
    } catch (err) {
      console.log("Can't fetch counseling profile");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const profileData = {
        ...formValues,
        introduction: formValues.introduction || "",
        currentHealthStatus: formValues.currentHealthStatus || "",
        psychologicalStatus: formValues.psychologicalStatus || "",
        stressFactors: formValues.stressFactors || "",
        academicDifficulties: formValues.academicDifficulties || "",
        studyPlan: formValues.studyPlan || "",
        careerGoals: formValues.careerGoals || "",
        partTimeExperience: formValues.partTimeExperience || "",
        internshipProgram: formValues.internshipProgram || "",
        extracurricularActivities: formValues.extracurricularActivities || "",
        personalInterests: formValues.personalInterests || "",
        socialRelationships: formValues.socialRelationships || "",
        financialSituation: formValues.financialSituation || "",
        financialSupport: formValues.financialSupport || "",
        desiredCounselingFields: formValues.desiredCounselingFields || "",
      };

      let docRes;
      if (counselingProfile === null) {
        docRes = await axiosJWT.post(
          `${BASE_URL}/students/document/info`,
          profileData
        );
      } else {
        docRes = await axiosJWT.put(
          `${BASE_URL}/students/document/info`,
          profileData
        );
      }

      if (docRes.status === 200) {
        setCounselingProfile(docRes.data);
        setEditMode(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2:
            "Updated information successfully!",
        });
      }
    } catch (err) {
      console.log("Can't update counseling profile", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't update these information",
      });
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
        {editMode ? (
          <TextInput
            value={value}
            onChangeText={(text) =>
              setFormValues({ ...formValues, [key]: text })
            }
            placeholder="Input here"
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
        ) : (
          <Text style={{ fontSize: 16, color: "#333" }}>{value || "N/A"}</Text>
        )}
      </View>
    );
  };

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 30,
            paddingTop: height * 0.035,
            paddingBottom: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <TouchableOpacity
              onPress={() => (
                navigation.navigate("Profile"), setEditMode(false)
              )}
            >
              <Ionicons name="return-up-back" size={36} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 24 }}>
              Counseling Profile
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }} />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 30 }}
          ref={scrollViewRef}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              marginBottom: 20,
              elevation: 3,
            }}
          >
            {renderAttribute("Introduction", "introduction")}
          </View>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              marginBottom: 20,
              elevation: 3,
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
            {renderAttribute("Current Health Status", "currentHealthStatus")}
            {renderAttribute("Psychological Status", "psychologicalStatus")}
            {renderAttribute("Stress Factors", "stressFactors")}
          </View>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              marginBottom: 20,
              elevation: 3,
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
            {renderAttribute("Academic Difficulties", "academicDifficulties")}
            {renderAttribute("Study Plan", "studyPlan")}
          </View>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              marginBottom: 20,
              elevation: 3,
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
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              marginBottom: 20,
              elevation: 3,
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
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              marginBottom: 20,
              elevation: 3,
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
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 12,
              marginBottom: 20,
              elevation: 3,
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
        </ScrollView>
        <View
          style={{
            width: "100%",
            borderBottomWidth: 1,
            borderColor: "lightgrey",
          }}
        />
        <View
          style={{
            paddingHorizontal: 30,
            paddingVertical: 16,
            backgroundColor: "#f5f7fd",
          }}
        >
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontSize: 16, color: "gray" }}>
              * Providing these information can assist counselors in better
              understanding and supporting you during the counseling process.
            </Text>
          </View>
          {editMode ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => (setEditMode(false), setFormValues({}))}
                style={{
                  width: "49%",
                  marginRight: 8,
                  padding: 8,
                  backgroundColor: "white",
                  borderRadius: 20,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "gray",
                }}
              >
                <Text
                  style={{ color: "#333", fontSize: 18, fontWeight: "bold" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateProfile}
                style={{
                  width: "49%",
                  padding: 8,
                  backgroundColor: !Object.values(formValues).some(
                    (value) => value !== ""
                  )
                    ? "#e3e3e3"
                    : "#F39300",
                  borderRadius: 20,
                  flexDirection: "row",
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
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setEditMode(true)}
              style={{
                padding: 8,
                backgroundColor: "#F39300",
                borderRadius: 20,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1.5,
                borderColor: "#F39300",
              }}
            >
              <Text
                style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
              >
                Update Information
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}
