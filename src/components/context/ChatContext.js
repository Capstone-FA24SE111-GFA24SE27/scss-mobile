import React, {
  createContext,
  useEffect,
  useRef,
  useContext,
  useState,
} from "react";
import axiosJWT, { BASE_URL } from "../../config/Config";
import { AuthContext } from "./AuthContext";
import { SocketContext } from "./SocketContext";
import Toast from "react-native-toast-message";
import { navigationRef } from "./NavigationContext";
export const ChatContext = createContext();

// export const navigationRef = createNavigationContainerRef();
// export function navigate = (name) => {
//   if (navigationRef.isReady()) {
//     navigationRef.navigate(name);
//   }
// };

export const ChatProvider = ({ children }) => {
  const { userData } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const scrollViewRef2 = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [filters, setFilters] = useState({
    // status: "",
    // isTaken: "",
    // isClosed: "",
    // type: "",
    // sortDirection: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [openChat, setOpenChat] = useState(false);

  const fetchData = async (filters = {}) => {
    try {
      if (userData?.role === "STUDENT") {
        const questionsRes = await axiosJWT.get(
          `${BASE_URL}/question-cards/student/filter`,
          {
            params: {
              keyword: debouncedKeyword,
              ...filters,
              page: currentPage,
            },
          }
        );
        setQuestions(questionsRes?.data?.content || []);
      }
      if (
        userData?.role === "ACADEMIC_COUNSELOR" ||
        userData?.role === "NON_ACADEMIC_COUNSELOR"
      ) {
        const questionsRes = await axiosJWT.get(
          `${BASE_URL}/question-cards/counselor/filter`,
          {
            params: {
              keyword: debouncedKeyword,
              ...filters,
              page: currentPage,
            },
          }
        );
        setQuestions(questionsRes?.data?.content || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData]);

  const fetchQuestionCard = async (questionId) => {
    try {
      if (userData?.role === "STUDENT") {
        const questionRes = await axiosJWT.get(
          `${BASE_URL}/question-cards/student/${questionId}`
        );
        setSelectedQuestion(questionRes?.data?.content || []);
      }
      if (
        userData?.role === "ACADEMIC_COUNSELOR" ||
        userData?.role === "NON_ACADEMIC_COUNSELOR"
      ) {
        const questionRes = await axiosJWT.get(
          `${BASE_URL}/question-cards/counselor/${questionId}`
        );
        setSelectedQuestion(questionRes?.data?.content || []);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleReadMessage = async (chatSessionId) => {
    try {
      await axiosJWT.put(
        `${BASE_URL}/question-cards/read/${chatSessionId}/messages`
      );
      fetchData(filters);
    } catch (err) {
      console.log("Can't read message");
    }
  };

  useEffect(() => {
    const chatSessionIds = questions?.data?.map(
      (question) => question?.chatSession?.id
    );
    if (socket || selectedQuestion?.chatSession?.id) {
      chatSessionIds?.forEach((chatSessionId) => {
        socket.on(`/user/${chatSessionId}/chat`, (newMessage) => {
          questions?.data?.map((question) => {
            if (question?.chatSession?.id === chatSessionId) {
              return {
                ...question,
                chatSession: {
                  ...question.chatSession,
                  messages: [...question.chatSession.messages, newMessage],
                },
              };
            }
            return question;
          });
          fetchData(filters);
          if (selectedQuestion?.chatSession?.id === chatSessionId) {
            setSelectedQuestion((prevQuestion) => ({
              ...prevQuestion,
              chatSession: {
                ...prevQuestion.chatSession,
                messages: [...prevQuestion.chatSession.messages, newMessage],
              },
            }));
          }
          if (
            scrollViewRef2.current &&
            selectedQuestion?.chatSession?.id === chatSessionId
          ) {
            setTimeout(() => {
              scrollViewRef2.current.scrollToEnd({ animated: false });
            }, 100);
          }
          if (
            userData?.role === "STUDENT" &&
            newMessage.sender.role !== "STUDENT"
          ) {
            const foundedQuestion = questions?.data?.find(
              (question) => question?.chatSession?.id === chatSessionId
            );
            Toast.show({
              type: "success",
              text1: newMessage.sender.profile.fullName,
              text2: newMessage.content,
              onPress: () => {
                Toast.hide();
                navigationRef.current?.navigate("QA");
                fetchQuestionCard(foundedQuestion?.id);
                setTimeout(() => {
                  handleReadMessage(foundedQuestion?.chatSession?.id);
                  setOpenChat(true);
                }, 100);
                if (
                  scrollViewRef2.current &&
                  selectedQuestion?.chatSession?.id === chatSessionId
                ) {
                  setTimeout(() => {
                    scrollViewRef2.current.scrollToEnd({ animated: false });
                  }, 100);
                }
              },
            });
            if (openChat && foundedQuestion?.chatSession?.id === chatSessionId && selectedQuestion?.chatSession?.id === chatSessionId) {
              fetchQuestionCard(foundedQuestion?.id);
              handleReadMessage(foundedQuestion?.chatSession?.id);
              Toast.hide()
            }
          }
          if (
            (userData?.role === "ACADEMIC_COUNSELOR" ||
              userData?.role === "NON_ACADEMIC_COUNSELOR") &&
            newMessage.sender.role === "STUDENT"
          ) {
            const foundedQuestion = questions?.data?.find(
              (question) => question?.chatSession?.id === chatSessionId
            );
            Toast.show({
              type: "success",
              text1: newMessage.sender.profile.fullName,
              text2: newMessage.content,
              onPress: () => {
                Toast.hide();
                navigationRef.current?.navigate("QA", {
                  screen: "Taken Questions",
                });
                fetchQuestionCard(foundedQuestion?.id);
                setTimeout(() => {
                  handleReadMessage(foundedQuestion?.chatSession?.id);
                  setOpenChat(true);
                }, 100);
                if (
                  scrollViewRef2.current &&
                  selectedQuestion?.chatSession?.id === chatSessionId
                ) {
                  setTimeout(() => {
                    scrollViewRef2.current.scrollToEnd({ animated: false });
                  }, 100);
                }
              },
            });
            if (openChat && foundedQuestion?.chatSession?.id === chatSessionId && selectedQuestion?.chatSession?.id === chatSessionId) {
              fetchQuestionCard(foundedQuestion?.id);
              handleReadMessage(foundedQuestion?.chatSession?.id);
              Toast.hide()
            }
          }
        });
      });
    }

    return () => {
      chatSessionIds?.forEach((chatSessionId) => {
        socket.off(`/user/${chatSessionId}/chat`);
      });
    };
  }, [userData, questions, selectedQuestion, socket]);

  return (
    <ChatContext.Provider
      value={{
        fetchData,
        questions,
        setQuestions,
        selectedQuestion,
        setSelectedQuestion,
        fetchQuestionCard,
        scrollViewRef2,
        filters,
        setFilters,
        keyword,
        setKeyword,
        debouncedKeyword,
        setDebouncedKeyword,
        currentPage,
        setCurrentPage,
        openChat,
        setOpenChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
