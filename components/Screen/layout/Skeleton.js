import { View, Dimensions } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
const { width, height } = Dimensions.get("window");

const CounselorSkeleton = () => {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 12,
        marginVertical: 10,
        elevation: 1,
        borderWidth: 0.75,
        borderColor: "#e3e3e3",
      }}
    >
      <View style={{ flexDirection: "row", marginHorizontal: 8 }}>
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            width: width * 0.14,
            height: width * 0.14,
            marginRight: 8,
            borderRadius: 40,
          }}
        />
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{ width: width * 0.4, height: 20, borderRadius: 4 }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#e0e0e0",
                paddingHorizontal: 12,
                paddingVertical: 2,
                borderRadius: 20,
              }}
            >
              <LinearGradient
                colors={["#f5f5f5", "#e0e0e0", "#f5f5f5"]}
                style={{ width: 24, height: 24, borderRadius: 12 }}
              />
            </View>
          </View>
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.5,
              height: 18,
              borderRadius: 4,
              marginVertical: 6,
            }}
          />
        </View>
      </View>
      <View
        style={{
          backgroundColor: "#f0f0f0",
          borderRadius: 10,
          paddingVertical: 8,
          marginTop: 8,
          marginHorizontal: 8,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: width * 0.3,
                height: 20,
                borderRadius: 4,
                marginLeft: 8,
              }}
            />
          </View>
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.3,
              height: 16,
              borderRadius: 4,
              marginTop: 8,
            }}
          />
        </View>
        <View
          style={{
            borderLeftWidth: 0.75,
            borderColor: "#ccc",
            height: "90%",
            marginVertical: 4,
          }}
        />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: width * 0.3,
                height: 20,
                borderRadius: 4,
                marginLeft: 8,
              }}
            />
          </View>
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.3,
              height: 16,
              borderRadius: 4,
              marginTop: 8,
            }}
          />
        </View>
      </View>
      <LinearGradient
        colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
        style={{
          backgroundColor: "#F39300",
          borderRadius: 10,
          height: 30,
          paddingVertical: 8,
          marginTop: 12,
          marginHorizontal: 8,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      />
    </View>
  );
};

const RequestSkeleton = () => {
  return (
    <View
      style={{
        padding: 16,
        marginBottom: 16,
        backgroundColor: "white",
        borderRadius: 20,
        elevation: 1,
        position: "relative",
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
      }}
    >
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            width: width * 0.14,
            height: width * 0.14,
            borderRadius: 40,
          }}
        />
        <View style={{ marginLeft: 12 }}>
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.5,
              height: 20,
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.2,
              height: 20,
              borderRadius: 20,
              marginTop: 4,
            }}
          />
        </View>
        <View style={{ position: "absolute", top: 0, right: -4 }}>
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{ width: 24, height: 24, borderRadius: 12 }}
          />
        </View>
      </View>

      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{ width: width * 0.3, height: 20, borderRadius: 4 }}
          />
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{ width: width * 0.4, height: 20, borderRadius: 4 }}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{ width: width * 0.3, height: 20, borderRadius: 4 }}
          />
        </View>
      </View>
    </View>
  );
};

const ScheduleSkeleton = () => {
  return (
    <View
      style={{
        padding: 16,
        marginBottom: 16,
        backgroundColor: "white",
        borderRadius: 20,
        elevation: 1,
        position: "relative",
        borderWidth: 1.5,
        borderColor: "#e0e0e0",
      }}
    >
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            width: width * 0.14,
            height: width * 0.14,
            borderRadius: 40,
          }}
        />
        <View style={{ marginLeft: 12 }}>
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.1,
              height: 20,
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.2,
              height: 20,
              borderRadius: 20,
              marginTop: 4,
            }}
          />
        </View>
        <View style={{ position: "absolute", bottom: 0, right: 0 }}>
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.1,
              height: width * 0.05,
              borderRadius: 12,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export { CounselorSkeleton, RequestSkeleton, ScheduleSkeleton };
