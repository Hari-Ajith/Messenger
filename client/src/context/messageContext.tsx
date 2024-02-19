import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { UserData, useUserContext } from "./userContext";

export type UserList = {
  userEmail: string;
  userName: string;
  userId: string;
};

export type MessageData = {
  message: string;
  senderId: string;
  senderName: string;
  isOurs: boolean;
};

const MessageContext = createContext({});

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const { userDetails } = useUserContext() as {
    userDetails: UserData;
  };

  const [activeUsers, setActiveUsers] = useState<UserList[]>([]);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserList>({
    userId: "",
    userEmail: "",
    userName: "",
  });
  const [messageData, setMessageData] = useState<MessageData[]>([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
    ws.addEventListener("message", handleMessage);
    setWebSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const handleClick = (user: UserList) => {
    console.log("Clicked", user);
    setSelectedUser(user);
  };

  const handleMessageData = (messagereceived: MessageData) => {
    setMessageData([...messageData, messagereceived]);
  };

  function handleMessage(event: MessageEvent) {
    try {
      const receivedEvent: string = event.data;
      const eventType = JSON.parse(receivedEvent);
      console.log(eventType);
      const { messageType, messageBody } = eventType;
      if (messageType === "Online") {
        const uniqueUserList: UserList[] = messageBody?.filter(
          (user: UserList, index: number, self: UserList[]) =>
            index === self.findIndex((u) => u.userId === user.userId) &&
            userDetails?.id !== user.userId
        );
        setActiveUsers(uniqueUserList);
        console.log("Unique User List", uniqueUserList);
      } else if (messageType === "Text Message") {
        const { message, sender } = messageBody;
        const messageReceived = {
          message: message,
          senderId: sender.senderId,
          senderName: sender.senderName,
          isOurs: false,
        };
        console.log("Received Message", messageReceived, selectedUser);
        setMessageData([...messageData, messageReceived]);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  console.log("messageData", messageData);

  return (
    <MessageContext.Provider
      value={{
        activeUsers,
        webSocket,
        handleClick,
        selectedUser,
        messageData,
        handleMessageData,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => useContext(MessageContext);
