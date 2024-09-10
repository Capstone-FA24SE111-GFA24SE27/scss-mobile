import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Agenda, Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";

export default function Schedule() {
  const navigation = useNavigation();
  const [items] = useState({
    "2024-09-07": [{ time: "7:00 - 8:45", name: "Meeting with Team A", counselor: "Mr. John", isWorkshop: false }],
    "2024-09-08": [{ time: "8:00 - 10:00", name: "Project Discussion", counselor: "Mr. John", isWorkshop: true }],
    "2024-09-09": [{ time: "12:00 - 14:00", name: "Project Implementation", counselor: "Mr. John", isWorkshop: false }],
    "2024-09-10": [{ time: "14:00 - 16:00", name: "Review 1", counselor: "Mr. John", isWorkshop: true }],
    "2024-09-11": [{ time: "10:00 - 12:00", name: "Meeting with Team B", counselor: "Mr. Mathew", isWorkshop: false }],
    "2024-09-12": [{ time: "12:30 - 14:00", name: "Review 2", counselor: "Mr. Mathew", isWorkshop: true }],
    "2024-09-13": [{ time: "16:00 - 17:30", name: "Testing", counselor: "Mrs. Jean", isWorkshop: false }, { time: "18:00 - 20:00", name: "Defend", counselor: "Mr. Saul", isWorkshop: true }],
  });

  // Load items on the day
  // const loadItems = (day) => {
  //   console.log(day);
  // };

  return (
    <>
      <View style={{ backgroundColor: "#f5f7fd", flex: 1 }}>
        <View style={{ flex: 1, marginTop: 30 }}>
          {/* <Calendar
            style={{
              marginHorizontal: 12,
              padding: 10,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#F39300",
            }}
            enableSwipeMonths
            arrowsHitSlop={4}
            renderArrow={(direction) => {
              return direction === "left" ? (
                <Ionicons name="caret-back-circle-outline" size={30} color="#F39300" />
              ) : (
                <Ionicons name="caret-forward-circle-outline" size={30} color="#F39300"/>
              );
            }}
            theme={{
              monthTextColor: "#F39300",
              textMonthFontSize: 24,
              textMonthFontWeight: "bold",
              // arrowColor: "#F39300",
              calendarBackground: "#ffe4ec",
              dayTextColor: "black",
              textInactiveColor: "#adadad",
              todayTextColor: "#F39300",
              textSectionTitleColor: "#F39300",
              textDayHeaderFontSize: 14,
              textDayFontSize: 14,
              textDayFontWeight: "semibold",
              textDisabledColor: "#adadad",
            }}
            markingType="period"
            markedDates={{
              // Default markingType
              // '2024-09-15': {selected: true, marked: true, selectedColor: '#F39300'},

              // *Multi-dot
              // '2024-09-16': {selected: true, dots: [{key: 'running', color: 'red', selectedDotColor: 'yellow'}, {key: 'lifting', color: 'blue', selectedDotColor: 'green'}] , selectedColor: "#F39300", selectedTextColor: "white"},

              // *Period
              "2024-09-22": {
                startingDay: true,
                color: "#F39300",
                textColor: "white",
              },
              "2024-09-23": { color: "#FA9F54FF", textColor: "white" },
              "2024-09-24": { color: "#FF9C4BFF", textColor: "white" },
              "2024-09-25": {
                endingDay: true,
                color: "#F39300",
                textColor: "white",
              },
            }}
          /> */}
          <Agenda
            items={items}
            selected={Date.now()}
            renderItem={(item) => {
              return (
                <TouchableOpacity
                  style={{
                    backgroundColor: "white",
                    borderRadius: 10,
                    padding: 16,
                    marginRight: 16,
                    marginTop: 12,
                    borderWidth: 1,
                    borderColor: "lightgrey",
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 22, fontWeight: "600" }}>
                      {item.time}
                    </Text>
                    {item.isWorkshop && (
                      <View
                        style={{
                          backgroundColor: "#F39300",
                          borderRadius: 12,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          marginLeft: 10,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "white"
                          }}
                        >
                          Workshop
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 18, marginVertical: 4 }}>
                    {item.name}{"\n"}With {item.counselor}
                  </Text>
                </TouchableOpacity>
              );
            }}
            renderEmptyData={() => {
              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  <Text
                    style={{ fontSize: 24, fontWeight: "600", opacity: 0.6 }}
                  >
                    No Schedule
                  </Text>
                </View>
              );
            }}
            rowHasChanged={(r1, r2) => {
              return r1.name !== r2.name;
            }}
            pastScrollRange={2}
            futureScrollRange={4}
            theme={{
              calendarBackground: "#E9BF7FFF",
              agendaDayTextColor: "black",
              agendaDayNumColor: "black",
              agendaTodayColor: "#F39300",
              agendaKnobColor: "#F39300",
              monthTextColor: "#F39300",
              selectedDayBackgroundColor: "#F39300",
              selectedDayTextColor: "white",
            }}
            renderKnob={() => (
              <Ionicons
                name="chevron-down-circle-outline"
                size={20}
                color="#F39300"
              />
            )}
            renderArrow={(direction) => {
              return direction === "left" ? (
                <Ionicons
                  name="caret-back-circle-outline"
                  size={30}
                  color="#F39300"
                />
              ) : (
                <Ionicons
                  name="caret-forward-circle-outline"
                  size={30}
                  color="#F39300"
                />
              );
            }}
          />
        </View>
      </View>
    </>
  );
}
