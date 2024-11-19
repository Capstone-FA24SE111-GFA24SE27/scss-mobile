import React, { createContext, useEffect, useContext, useState } from "react";
import axiosJWT, { BASE_URL } from "../../config/Config";
import { Dimensions, Modal, View } from "react-native";
import { AuthContext } from "./AuthContext";
import GatherInfo from "../screens/student/GatherInfo";
import Toast from "react-native-toast-message";

export const CounselingProfileContext = createContext();

export const CounselingProfileProvider = ({ children }) => {
  const { userData, session } = useContext(AuthContext);
  const [counselingProfile, setCounselingProfile] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [showModal, setShowModal] = useState(false);
  const { width, height } = Dimensions.get("screen");

  const fetchStudentDoc = async () => {
    try {
      const docRes = await axiosJWT.get(`${BASE_URL}/students/document/info`);
      const docData = docRes?.data?.content?.counselingProfile;
      console.log(docData + "1");
      if (docData === null) {
        setShowModal(true);
      }
      setCounselingProfile(docData);
      setFormValues(docData || {});
    } catch (err) {
      console.log("Can't fetch counseling profile", err);
    }
  };

  useEffect(() => {
    if (userData && userData?.role === "STUDENT" && session) {
      fetchStudentDoc();
    }
  }, [userData]);

  const handleAddProfile = async () => {
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
      await axiosJWT.post(`${BASE_URL}/students/document/info`, profileData);
      console.log("Information updated successfully!");
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Information updated successfully!",
        onPress: () => {
          Toast.hide();
        }
      })
      setShowModal(false);
      fetchStudentDoc();
    } catch (err) {
      console.log("Can't send counseling profile", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Can't send counseling profile",
        onPress: () => {
          Toast.hide();
        },
      });
    }
  };

  const handleSkip = () => {
    setShowModal(false);
  };

  const handleInputChange = (key, value) => {
    setFormValues({ ...formValues, [key]: value });
  };

  return (
    <CounselingProfileContext.Provider
      value={{
        counselingProfile,
        formValues,
        showModal,
        handleAddProfile,
        handleSkip,
        handleInputChange,
      }}
    >
      {children}
      {showModal && (
        <GatherInfo
          formValues={formValues}
          handleAddProfile={handleAddProfile}
          handleSkip={handleSkip}
          handleInputChange={handleInputChange}
        />
      )}
    </CounselingProfileContext.Provider>
  );
};
