import { View, Dimensions, ScrollView } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
const { width, height } = Dimensions.get("window");

const HomeSkeleton = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ marginHorizontal: 30, marginBottom: 8 }}
    >
      <LinearGradient
        colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
        style={{
          width: width * 0.85,
          height: width * 0.35,
          borderRadius: 10,
          marginVertical: 16,
        }}
      />
      <View style={{ marginBottom: 12 }}>
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            width: width * 0.85,
            height: width * 0.075,
            borderRadius: 4,
          }}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      >
        {[...Array(3)].map((_, index) => (
          <LinearGradient
            key={index}
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.6,
              height: width * 0.35,
              borderRadius: 10,
              marginRight: 12,
            }}
          />
        ))}
      </ScrollView>
      <View style={{ marginBottom: 12 }}>
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            width: width * 0.85,
            height: width * 0.075,
            borderRadius: 4,
          }}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      >
        {[...Array(4)].map((_, index) => (
          <LinearGradient
            key={index}
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.25,
              height: width * 0.125,
              borderRadius: 10,
              marginRight: 8,
            }}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      >
        {[...Array(3)].map((_, index) => (
          <LinearGradient
            key={index}
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.6,
              height: width * 0.35,
              borderRadius: 10,
              marginRight: 12,
            }}
          />
        ))}
      </ScrollView>
      <View style={{ marginBottom: 12 }}>
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            width: width * 0.85,
            height: width * 0.075,
            borderRadius: 4,
          }}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[...Array(3)].map((_, index) => (
          <LinearGradient
            key={index}
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: width * 0.6,
              height: width * 0.35,
              borderRadius: 10,
              marginRight: 12,
            }}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );
};

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
              style={{
                width: width * 0.4,
                height: width * 0.05,
                borderRadius: 4,
              }}
            />
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: width * 0.14,
                height: width * 0.05,
                paddingHorizontal: 12,
                paddingVertical: 2,
                borderRadius: 20,
              }}
            />
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

const StudentSkeleton = () => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#e0e0e0",
        borderRadius: 20,
        marginVertical: 8,
      }}
    >
      <View
        style={{
          backgroundColor: "#f5f5f5",
          padding: 12,
          marginLeft: 4,
          marginRight: 2,
          marginTop: 4,
          marginBottom: 4,
          borderTopLeftRadius: 18,
          borderBottomLeftRadius: 18,
        }}
      >
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            width: 70,
            height: 70,
            borderRadius: 40,
            borderColor: "#e0e0e0",
            borderWidth: 2,
          }}
        />
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          borderTopRightRadius: 18,
          borderBottomRightRadius: 18,
          padding: 12,
          marginTop: 4,
          marginBottom: 4,
          marginRight: 4,
        }}
      >
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{ width: width * 0.5, height: 24, borderRadius: 4 }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            marginBottom: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "50%",
            }}
          >
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: 16,
                height: 18,
                borderRadius: 4,
              }}
            />
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: width * 0.15,
                height: 18,
                borderRadius: 4,
                marginLeft: 4,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              width: "50%",
            }}
          >
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: 16,
                height: 18,
                borderRadius: 4,
              }}
            />
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: width * 0.15,
                height: 18,
                borderRadius: 4,
                marginLeft: 4,
              }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "50%",
            }}
          >
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: 16,
                height: 18,
                borderRadius: 4,
              }}
            />
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: width * 0.15,
                height: 18,
                borderRadius: 4,
                marginLeft: 4,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              width: "50%",
            }}
          >
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: 16,
                height: 18,
                borderRadius: 4,
              }}
            />
            <LinearGradient
              colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
              style={{
                width: width * 0.15,
                height: 18,
                borderRadius: 4,
                marginLeft: 4,
              }}
            />
          </View>
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

const QASkeleton = () => {
  return (
    <View
      style={{
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: "white",
        marginVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#e3e3e3",
      }}
    >
      <View style={{ marginBottom: 16 }}>
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            height: 24,
            marginLeft: 4,
            width: "50%",
            marginBottom: 8,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 10,
          }}
        />
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            height: 24,
            borderRadius: 4,
            marginLeft: 4,
            width: "80%",
          }}
        />
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            height: 96,
            borderRadius: 4,
            marginTop: 8,
            marginLeft: 4,
            width: "95%",
          }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 4,
          }}
        >
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: 108,
              height: 24,
              borderRadius: 20,
            }}
          />
          <LinearGradient
            colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
            style={{
              width: 108,
              height: 24,
              borderRadius: 20,
              marginLeft: 4,
            }}
          />
        </View>
        <LinearGradient
          colors={["#e0e0e0", "#f5f5f5", "#e0e0e0"]}
          style={{
            width: 24,
            height: 24,
            borderRadius: 20,
          }}
        />
      </View>
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

export {
  HomeSkeleton,
  CounselorSkeleton,
  StudentSkeleton,
  ScheduleSkeleton,
  QASkeleton,
  RequestSkeleton,
};
