import ChatBox from "./ChatBox";
import EmptyScreen from "./EmptyScreen";
import { MessageData, UserList } from "./LandingSection";
export interface ChatSectionProps {
  isLoading: boolean;
  webSocket: WebSocket | null;
  selectedUser: UserList;
  messageData: MessageData[];
  handleMessageData: (messageSend: MessageData) => void;
}

const ChatSection = ({
  isLoading,
  webSocket,
  selectedUser,
  messageData,
  handleMessageData,
}: ChatSectionProps) => {
  if (selectedUser.userId === "") return <EmptyScreen />;
  else
    return (
      <ChatBox
        isLoading={isLoading}
        webSocket={webSocket}
        selectedUser={selectedUser}
        messageData={messageData}
        handleMessageData={handleMessageData}
      />
    );
};

export default ChatSection;
