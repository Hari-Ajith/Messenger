import { Col, Row } from "antd";
import ActiveUsers from "./ActiveUsers";
import ChatSection from "./ChatSection";
import { useEffect, useState } from "react";
import { UserData, useUserContext } from "../context/userContext";
import axios from "axios";
import Sidebar from "./Sidebar";

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
  type: string;
  recipient: string;
  createdAt: string;
};

const LandingSection = () => {
  const { userDetails, open, onClose } = useUserContext() as {
    userDetails: UserData;
    open: boolean;
    onClose: () => void;
    showDrawer: () => void;
  };
  const [activeUsers, setActiveUsers] = useState<UserList[]>([]);
  const [allUsers, setAllUsers] = useState<UserList[]>([]);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserList>({
    userId: "",
    userEmail: "",
    userName: "",
  });
  const [messageData, setMessageData] = useState<MessageData[]>([]);
  const [singleMessageData, setSingleMessageData] = useState<MessageData>({
    message: "",
    senderId: "",
    senderName: "",
    isOurs: false,
    type: "",
    recipient: "",
    createdAt: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    getAllUsersMessaged();
  }, []);

  useEffect(() => {
    if (userDetails?.isLoggedin) {
      connectToWebSocket();
    }

    return () => {
      if (webSocket) {
        webSocket.removeEventListener("message", handleMessage);
        webSocket.removeEventListener("close", handleWebSocketClose);
      }
    };
  }, [userDetails]);

  useEffect(() => {
    const { message, recipient, type } = singleMessageData;
    if (type === "From User") {
      const currentmessageData = {
        message: message,
        recipient: recipient,
      };
      webSocket?.send(JSON.stringify(currentmessageData));
    }
    if (type !== "") setMessageData([...messageData, singleMessageData]);
  }, [singleMessageData]);

  useEffect(() => {
    setSingleMessageData({
      message: "",
      senderId: "",
      senderName: "",
      isOurs: false,
      type: "",
      recipient: "",
      createdAt: "",
    });
  }, [messageData]);

  function connectToWebSocket() {
    const ws = new WebSocket("ws://localhost:5000");
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", handleWebSocketClose);
    setWebSocket(ws);
  }

  function handleWebSocketClose() {
    if (userDetails?.isLoggedin) {
      connectToWebSocket();
    }
  }

  const handleClick = (user: UserList) => {
    setSelectedUser(user);
    setIsLoading(true);
    if (user.userId != "") getMessages(user.userId);
  };

  async function getMessages(userId: string) {
    onClose();
    try {
      const responseData = await axios.get(`/getMessages/${userId}`, {
        withCredentials: true,
      });
      const messageData = responseData?.data
        ?.map((text: any) => {
          const currentUser = userDetails?.id;
          const formCurrentUser = text.sender === currentUser;
          return {
            message: text.message || "",
            senderId: text.sender || "",
            recipient: text.recipient || "",
            isOurs: formCurrentUser || false,
            type: "",
            senderName: "",
            createdAt: text.createdAt || "",
          };
        })
        .filter(
          (message: any) =>
            message.message &&
            message.senderId &&
            message.recipient &&
            message.createdAt
        )
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      setMessageData(messageData);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    } catch (error) {
      console.log("Message Error", error);
      setMessageData([]);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  }

  async function getAllUsersMessaged() {
    const responseData = await axios.get(`/getMessages`, {
      withCredentials: true,
    });
    const allUserData = responseData?.data?.map(
      (data: { _id: string; email: string; username: string }) => {
        return {
          userId: data._id,
          userEmail: data.email,
          userName: data.username,
        };
      }
    );
    console.log("allUserData", allUserData);
    setAllUsers(allUserData);
  }

  const handleMessageData = (messageReceived: MessageData) => {
    setSingleMessageData(messageReceived);
  };

  function handleMessage(event: MessageEvent) {
    try {
      const receivedEvent: string = event.data;
      const eventType = JSON.parse(receivedEvent);
      const { messageType, messageBody } = eventType;
      if (messageType === "Online") {
        const uniqueUserList: UserList[] = messageBody?.filter(
          (user: UserList, index: number, self: UserList[]) =>
            index === self.findIndex((u) => u.userId === user.userId) &&
            userDetails?.id !== user.userId
        );
        setActiveUsers(uniqueUserList);
      } else if (messageType === "Text Message") {
        const { message, sender } = messageBody;
        const messageReceived = {
          message: message,
          senderId: sender.senderId,
          senderName: sender.senderName,
          isOurs: false,
          type: "From Server",
          recipient: userDetails?.id || "",
          createdAt: "",
        };
        setSingleMessageData(messageReceived);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  return (
    <Row style={{ height: "100dvh" }}>
      <Col xs={0} sm={0} md={0} lg={6} xl={6} xxl={6}>
        <ActiveUsers
          allUsers={allUsers}
          activeUsers={activeUsers}
          selectedUser={selectedUser}
          handleClick={handleClick}
        />
      </Col>
      <Col xs={24} sm={24} md={24} lg={18} xl={18} xxl={18}>
        <ChatSection
          isLoading={isLoading}
          webSocket={webSocket}
          selectedUser={selectedUser}
          messageData={messageData}
          handleMessageData={handleMessageData}
        />
      </Col>
      <Sidebar onClose={onClose} open={open}>
        <ActiveUsers
          allUsers={allUsers}
          activeUsers={activeUsers}
          selectedUser={selectedUser}
          handleClick={handleClick}
        />
      </Sidebar>
    </Row>
  );
};
export default LandingSection;
