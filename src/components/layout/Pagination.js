import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

const Pagination = ({ currentPage, setCurrentPage, length, totalPages }) => {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        marginHorizontal: 20,
        marginVertical: 10,
      }}
    >
      <TouchableOpacity
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: "white",
          marginHorizontal: 4,
          borderWidth: 1.5,
          borderColor: currentPage <= 1 ? "#ccc" : "#F39300",
          opacity: currentPage <= 1 ? 0.5 : 1,
        }}
        onPress={() => setCurrentPage(1)}
        disabled={currentPage <= 1}
      >
        <Text style={{ color: "#333", fontSize: 18, fontWeight: "600" }}>
          {"<<"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: "white",
          marginHorizontal: 4,
          borderWidth: 1.5,
          borderColor: currentPage === 1 ? "#ccc" : "#F39300",
          opacity: currentPage === 1 ? 0.5 : 1,
        }}
        onPress={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <Text style={{ color: "#333", fontSize: 18, fontWeight: "600" }}>
          {"<"}
        </Text>
      </TouchableOpacity>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 10,
          marginHorizontal: 4,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          borderWidth: 1.5,
          borderColor: "#F39300",
        }}
      >
        <Text style={{ fontSize: 16, color: "#333", fontWeight: "600" }}>
          {length > 0 ? currentPage : 0} / {totalPages}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: "white",
          marginHorizontal: 4,
          borderWidth: 1.5,
          borderColor:
            totalPages === 0 || currentPage >= totalPages ? "#ccc" : "#F39300",
          opacity: totalPages === 0 || currentPage >= totalPages ? 0.5 : 1,
        }}
        onPress={() => setCurrentPage(currentPage + 1)}
        disabled={totalPages === 0 || currentPage >= totalPages}
      >
        <Text style={{ color: "#333", fontSize: 18, fontWeight: "600" }}>
          {">"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 10,
          backgroundColor: "white",
          marginHorizontal: 4,
          borderWidth: 1.5,
          borderColor:
            totalPages === 0 || currentPage >= totalPages ? "#ccc" : "#F39300",
          opacity: totalPages === 0 || currentPage >= totalPages ? 0.5 : 1,
        }}
        onPress={() => setCurrentPage(totalPages)}
        disabled={totalPages === 0 || currentPage >= totalPages}
      >
        <Text style={{ color: "#333", fontSize: 18, fontWeight: "600" }}>
          {">>"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Pagination;
