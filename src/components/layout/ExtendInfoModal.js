import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import ImageViewer from "react-native-image-zoom-viewer";

export default function ExtendInfoModal({
  openExtendInfo,
  setOpenExtendInfo,
  extendInfo,
  setExtendInfo,
}) {
  const { width, height } = Dimensions.get("screen");
  const [openImage, setOpenImage] = useState(false);
  const [images, setImages] = useState([]);

  const openImageModal = (imageUrl) => {
    setImages([{ url: imageUrl }]);
    setOpenImage(true);
  };

  return (
    <Modal
      transparent={true}
      visible={openExtendInfo}
      animationType="slide"
      onRequestClose={() => setOpenExtendInfo(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.05)",
        }}
      >
        <View
          style={{
            width: "100%",
            height: "90%",
            backgroundColor: "#f5f7fd",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "#F39300",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }}
          >
            <View
              style={{
                flexDirection: "column",
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {extendInfo?.profile?.fullName}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "white",
                  opacity: 0.8,
                }}
              >
                Career Information
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                backgroundColor: "white",
                padding: 4,
                borderRadius: 20,
              }}
              onPress={() => (setOpenExtendInfo(false), setExtendInfo(null))}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
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
    </Modal>
  );
}
