import {
  View,
  Text,
  ScrollView,
  Image,
  Switch,
  Dimensions,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import Toast from "react-native-toast-message";

export default function Profile({ route }) {
  const navigation = useNavigation();
  const prevScreen = route?.params?.prevScreen;
  const { width, height } = Dimensions.get("screen");
  const [isEnabled, setIsEnabled] = useState(false);
  const [open, setIsOpen] = useState(false);
  const { userData, profile, fetchProfile, logout } = useContext(AuthContext);
  const scrollViewRef = useRef(null);
  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }, [])
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const handleLogout = () => {
    setIsOpen(true);
    // Alert.alert(
    //   'Logout Confirmation',
    //   'Are you sure you want to logout?',
    //   [
    //     {
    //       text: 'No',
    //       onPress: () => console.log('Logout cancelled'),
    //       style: 'cancel',
    //     },
    //     {
    //       text: 'Yes',
    //       onPress: () => logout(),
    //     },
    //   ],
    //   { cancelable: true }
    // );
  };

  const confirmLogout = () => {
    setIsOpen(false);
    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Logout successfully",
      onPress: () => {
        Toast.hide();
      },
    });
    logout();
  };

  const cancelLogout = () => {
    setIsOpen(false);
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
            <TouchableOpacity
              onPress={() => navigation.navigate(prevScreen || "Personal")}
            >
              <Ionicons name="return-up-back" size={36} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 2, alignItems: "center" }}>
            <Text style={{ fontWeight: "bold", fontSize: width * 0.06 }}>
              Profile
            </Text>
          </View>
          <View style={{ flex: 1 }} />
        </View>
        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              elevation: 5,
              marginBottom: 12,
              marginHorizontal: 20,
              paddingVertical: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <View style={{ width: "40%" }}>
                <View style={{ position: "relative" }}>
                  <Image
                    source={{
                      uri: profile?.avatarLink,
                    }}
                    style={{
                      width: width * 0.28,
                      height: width * 0.28,
                      borderRadius: 100,
                      borderColor: "#F39300",
                      borderWidth: 2,
                    }}
                  />
                  <View
                    style={{
                      padding: 5,
                      backgroundColor: "#F39300",
                      borderRadius: 30,
                      position: "absolute",
                      right: 20,
                      bottom: 0,
                    }}
                  >
                    <Ionicons
                      name={profile?.gender == "MALE" ? "male" : "female"}
                      size={24}
                      style={{ color: "white" }}
                    />
                  </View>
                </View>
              </View>
              <View style={{ width: "60%" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#333",
                    marginBottom: 2,
                  }}
                >
                  {profile?.fullName}
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    color: "gray",
                    marginBottom: 2,
                  }}
                >
                  {userData?.email}
                </Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
              {profile && (
                <View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <View style={{ width: "50%" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Student Code:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "gray",
                          maxWidth: "90%",
                        }}
                      >
                        {profile.studentCode}
                      </Text>
                    </View>
                    <View style={{ width: "50%" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Department:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "gray",
                          maxWidth: "90%",
                        }}
                      >
                        {profile.department?.name} ({profile.department?.code})
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                      marginTop: 16,
                    }}
                  >
                    <View style={{ width: "50%" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Major:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "gray",
                          maxWidth: "90%",
                        }}
                      >
                        {profile.major?.name} ({profile.major?.code})
                      </Text>
                    </View>
                    <View style={{ width: "50%" }}>
                      {/* <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Specialization:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "gray",
                          maxWidth: "90%",
                        }}
                      >
                        {profile.specialization?.name}
                      </Text> */}
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                      marginTop: 16,
                    }}
                  >
                    <View style={{ width: "50%" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Phone Number:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "gray",
                          maxWidth: "90%",
                        }}
                      >
                        {profile.phoneNumber}
                      </Text>
                    </View>
                    <View style={{ width: "50%" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        Date of birth:
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "gray",
                          maxWidth: "90%",
                        }}
                      >
                        {formatDate(profile.dateOfBirth)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      marginTop: 16,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        // position: "absolute",
                        // bottom: 0,
                        // right: 0,
                        flex: 1,
                        backgroundColor: "#F39300",
                        borderRadius: 10,
                        paddingVertical: 8,
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                      onPress={() => navigation.navigate("ViewProfile")}
                    >
                      <Text
                        style={{
                          fontWeight: "500",
                          color: "white",
                          fontSize: 18,
                          marginRight: 8,
                        }}
                      >
                        Counseling Profile
                      </Text>
                      <Ionicons
                        name="expand"
                        size={24}
                        style={{ color: "white" }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                opacity: 0.45,
                padding: 12,
              }}
            >
              System
            </Text>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                elevation: 1,
                borderWidth: 2,
                borderColor: "#e3e3e3",
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  width: "100%",
                  borderRadius: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="information-circle"
                    size={30}
                    style={{ color: "#F39300", marginRight: 20 }}
                  />
                  <Text
                    style={{
                      color: "#333",
                      fontWeight: "600",
                      fontSize: 18,
                    }}
                  >
                    Policies and terms
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={30}
                  style={{ color: "#e3e3e3" }}
                />
              </View>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "lightgrey",
                  marginVertical: 4,
                  width: "90%",
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  width: "100%",
                  borderRadius: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="help-circle"
                    size={30}
                    style={{ color: "#F39300", marginRight: 20 }}
                  />
                  <Text
                    style={{
                      color: "#333",
                      fontWeight: "600",
                      fontSize: 18,
                    }}
                  >
                    Help
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={30}
                  style={{ color: "#e3e3e3" }}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                opacity: 0.45,
                padding: 12,
              }}
            >
              Preferences
            </Text>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 20,
                elevation: 1,
                borderWidth: 2,
                borderColor: "#e3e3e3",
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              {/* <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  width: "100%",
                  borderRadius: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="notifications-circle"
                    size={30}
                    style={{ color: "#F39300", marginRight: 16 }}
                  />
                  <Text
                    style={{
                      color: "#333",
                      fontWeight: "600",
                      fontSize: 18,
                    }}
                  >
                    Push notifications
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: "#e3e3e3", true: "#F39300" }}
                  thumbColor={isEnabled ? "white" : "#f5f7fd"}
                  onValueChange={toggleSwitch}
                  value={isEnabled}
                />
              </View> */}
              <TouchableOpacity
                onPress={() => navigation.navigate("ChangePassword")}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  width: "100%",
                  borderRadius: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="lock-closed"
                    size={width * 0.06}
                    style={{ color: "#F39300", marginRight: 20 }}
                  />
                  <Text
                    style={{
                      color: "#333",
                      fontWeight: "600",
                      fontSize: 18,
                    }}
                  >
                    Change password
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={30}
                  style={{ color: "#e3e3e3" }}
                />
              </TouchableOpacity>
              <View
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "lightgrey",
                  marginVertical: 4,
                  width: "90%",
                }}
              />
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  width: "100%",
                  borderRadius: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="log-out-outline"
                    size={30}
                    style={{ color: "#F39300", marginRight: 16 }}
                  />
                  <Text
                    style={{
                      color: "#F39300",
                      fontWeight: "600",
                      fontSize: 18,
                    }}
                  >
                    Logout
                  </Text>
                </View>
              </TouchableOpacity>
              <Modal
                transparent={true}
                visible={open}
                animationType="fade"
                onRequestClose={cancelLogout}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <View
                    style={{
                      width: Dimensions.get("screen").width * 0.8,
                      padding: 20,
                      backgroundColor: "white",
                      borderRadius: 10,
                      elevation: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "bold",
                        marginBottom: 10,
                        textAlign: "center",
                      }}
                    >
                      Logout Confirmation
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        marginBottom: 30,
                        textAlign: "center",
                      }}
                    >
                      Are you sure you want to logout?
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: "#ededed",
                          padding: 10,
                          borderRadius: 10,
                          marginRight: 10,
                          justifyContent: "center",
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: "gray",
                        }}
                        onPress={cancelLogout}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            color: "#333",
                            fontWeight: "600",
                          }}
                        >
                          No
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: "#F39300",
                          padding: 10,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        onPress={confirmLogout}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            color: "white",
                            fontWeight: "600",
                          }}
                        >
                          Yes
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
