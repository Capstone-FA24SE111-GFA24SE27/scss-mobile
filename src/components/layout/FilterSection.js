import React, { useRef, useEffect } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const FilterToggle = ({ isExpanded, toggleExpanded }) => {
  const iconRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(iconRotation, {
      toValue: isExpanded ? 180 : 0,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleExpanded}
      style={{
        backgroundColor: isExpanded ? "#F39300" : "#e3e3e3",
        borderRadius: 40,
        padding: 8,
      }}
    >
      <Animated.View
        style={{
          transform: [
            {
              rotate: iconRotation.interpolate({
                inputRange: [0, 180],
                outputRange: ["0deg", "90deg"],
              }),
            },
          ],
        }}
      >
        <Ionicons
          name="filter"
          size={26}
          style={{ color: isExpanded ? "white" : "black" }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const FilterAccordion = ({ isExpanded, children }) => {
  const layoutHeight = useRef({ text: 0 });
  const accordionHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(accordionHeight, {
      toValue: isExpanded ? layoutHeight.current.text : 0,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  return (
    <Animated.View
      style={{
        height: accordionHeight,
        marginTop: 8,
        overflow: "hidden",
        backgroundColor: "#ededed",
        borderRadius: 20,
      }}
    >
      <View
        style={{
          position: "absolute",
          width: "100%",
          paddingVertical: 4,
        }}
        onLayout={(e) =>
          (layoutHeight.current.text = e.nativeEvent.layout.height)
        }
      >
        {children}
      </View>
    </Animated.View>
  );
};

// const FilterSection = () => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   const toggleExpanded = () => {
//     setIsExpanded((prev) => !prev);
//   };

//   return (
//     <View>
//       <FilterToggle isExpanded={isExpanded} toggleExpanded={toggleExpanded} />
//       <FilterAccordion isExpanded={isExpanded}>
//         <View>
//           <Text>Filter content goes here!</Text>
//         </View>
//       </FilterAccordion>
//     </View>
//   );
// };

// export default FilterSection;
