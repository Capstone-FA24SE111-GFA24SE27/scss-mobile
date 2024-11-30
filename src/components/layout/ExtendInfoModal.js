import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions, ScrollView, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";

export default function ExtendInfoModal({
  openExtendInfo,
  setOpenExtendInfo,
  extendInfo,
  setExtendInfo,
}) {
  const { width, height } = Dimensions.get("screen");

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
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }}
      >
        <View
          style={{
            width: "100%",
            height: "98%",
            backgroundColor: "#f5f7fd",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Extend Information
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#ededed",
                padding: 4,
                borderRadius: 20,
              }}
              onPress={() => (setOpenExtendInfo(false), setExtendInfo(null))}
            >
              <Ionicons name="close" size={28} color="#333" />
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
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Specialized Skills
                </Text>
                <Markdown>{extendInfo?.specializedSkills}</Markdown>
                <View
                  style={{
                    height: 2,
                    backgroundColor: "gray",
                    marginVertical: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Other Skills
                </Text>
                <Markdown>{extendInfo?.otherSkills}</Markdown>
                <View
                  style={{
                    height: 2,
                    backgroundColor: "gray",
                    marginVertical: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Working History
                </Text>
                <Markdown>{extendInfo?.workHistory}</Markdown>
                <View
                  style={{
                    height: 2,
                    backgroundColor: "gray",
                    marginVertical: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Achievements
                </Text>
                <Markdown>{extendInfo?.achievements}</Markdown>
                <View
                  style={{
                    height: 2,
                    backgroundColor: "gray",
                    marginVertical: 8,
                  }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#333",
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
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        {qualification.degree} in {qualification.fieldOfStudy}
                      </Text>
                      <Text style={{ fontSize: 14, color: "gray" }}>
                        {qualification.institution} -{" "}
                        {qualification.yearOfGraduation}
                      </Text>
                      <Image
                        source={{ uri: qualification.imageUrl }}
                        style={{
                          width: "100%",
                          height: height * 0.3,
                          resizeMode: "cover",
                          marginTop: 8,
                          borderRadius: 8,
                        }}
                      />
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
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#333",
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
                          fontSize: 16,
                          fontWeight: "600",
                          color: "#333",
                        }}
                      >
                        {certification.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: "gray" }}>
                        {certification.organization}
                      </Text>
                      <Image
                        source={{ uri: certification.imageUrl }}
                        style={{
                          width: "100%",
                          height: height * 0.3,
                          resizeMode: "cover",
                          marginTop: 8,
                          borderRadius: 8,
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
