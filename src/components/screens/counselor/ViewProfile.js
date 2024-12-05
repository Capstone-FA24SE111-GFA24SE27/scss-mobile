import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Modal,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axiosJWT, { BASE_URL } from "../../../config/Config";
import { AuthContext } from "../../context/AuthContext";
import ImageViewer from "react-native-image-zoom-viewer";
import Markdown from "react-native-markdown-display";

export default function ViewProfile() {
  const navigation = useNavigation();
  const { width, height } = Dimensions.get("screen");
  const { userData } = useContext(AuthContext);
  const [extendInfo, setExtendInfo] = useState(null);
  const [openImage, setOpenImage] = useState(false);
  const [images, setImages] = useState([]);
  const scrollViewRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const extendRes = await axiosJWT.get(
        `${BASE_URL}/counselors/${userData?.id}`
      );
      const extendData = extendRes?.data?.content || [];
      setExtendInfo(extendData);
    } catch (err) {
      console.log("Can't fetch counselor information", err);
    }
  };

  const openImageModal = (imageUrl) => {
    setImages([{ url: imageUrl }]);
    setOpenImage(true);
  };

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingTop: height * 0.035,
            paddingBottom: 10,
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-start" }}>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Ionicons name="return-up-back" size={36} />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: 24 }}>
              Career Profile
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }} />
        </View>
        {extendInfo && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 20,
              backgroundColor: "#f5f7fd",
              borderRadius: 16,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#F39300",
              }}
            >
              Specialized Skills
            </Text>
            <Markdown style={{ body: { fontSize: 16 } }}>
              {extendInfo?.specializedSkills}
            </Markdown>
            <View
              style={{
                height: 2,
                backgroundColor: "gray",
                marginVertical: 8,
              }}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#F39300",
              }}
            >
              Other Skills
            </Text>
            <Markdown style={{ body: { fontSize: 16 } }}>
              {extendInfo?.otherSkills}
            </Markdown>
            <View
              style={{
                height: 2,
                backgroundColor: "gray",
                marginVertical: 8,
              }}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#F39300",
              }}
            >
              Working History
            </Text>
            <Markdown style={{ body: { fontSize: 16 } }}>
              {extendInfo?.workHistory}
            </Markdown>
            <View
              style={{
                height: 2,
                backgroundColor: "gray",
                marginVertical: 8,
              }}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#F39300",
              }}
            >
              Achievements
            </Text>
            <Markdown style={{ body: { fontSize: 16 } }}>
              {extendInfo?.achievements}
            </Markdown>
            <View
              style={{
                height: 2,
                backgroundColor: "gray",
                marginVertical: 8,
              }}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#F39300",
                marginBottom: 8,
              }}
            >
              Qualifications
            </Text>
            <View>
              {extendInfo?.qualifications?.map((qualification) => (
                <View key={qualification.id} style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    {qualification.degree} in {qualification.fieldOfStudy}
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "gray", marginBottom: 8 }}
                  >
                    {qualification.institution} -{" "}
                    {qualification.yearOfGraduation}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => openImageModal(qualification.imageUrl)}
                  >
                    <Image
                      source={{ uri: qualification.imageUrl }}
                      style={{
                        width: "100%",
                        minHeight: height * 0.3,
                        height: "auto",
                        resizeMode: "contain",
                        marginVertical: 8,
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: "lightgrey",
                      }}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View
              style={{
                height: 2,
                backgroundColor: "gray",
                marginVertical: 16,
              }}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#F39300",
                marginBottom: 8,
              }}
            >
              Certifications
            </Text>
            <View>
              {extendInfo?.certifications?.map((certification) => (
                <View key={certification.id} style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    {certification.name}
                  </Text>
                  <Text
                    style={{ fontSize: 16, color: "gray", marginBottom: 8 }}
                  >
                    {certification.organization}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => openImageModal(certification.imageUrl)}
                  >
                    <Image
                      source={{ uri: certification.imageUrl }}
                      style={{
                        width: "100%",
                        minHeight: height * 0.3,
                        height: "auto",
                        resizeMode: "contain",
                        marginVertical: 8,
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderColor: "lightgrey",
                      }}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        )}
      </View>
      <Modal
        visible={openImage}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setOpenImage(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
          <ImageViewer
            imageUrls={images}
            onSwipeDown={() => {
              setOpenImage(false);
              setImages([]);
            }}
            enableImageZoom
            enableSwipeDown
            backgroundColor="rgba(0, 0, 0, 0.4)"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setOpenImage(false);
              setImages([]);
            }}
            style={{
              position: "absolute",
              top: height * 0.045,
              right: width * 0.045,
              alignSelf: "center",
              backgroundColor: "white",
              borderRadius: 40,
              padding: 4,
            }}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}
