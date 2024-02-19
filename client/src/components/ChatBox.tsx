import { useEffect, useRef, useState } from "react";
import "../index.css";
import { UserData, useUserContext } from "../context/userContext";
import { ChatSectionProps } from "./ChatSection";
import { MessageData } from "./LandingSection";

const ChatBox = ({
  isLoading,
  selectedUser,
  messageData,
  handleMessageData,
}: ChatSectionProps) => {
  const { userDetails } = useUserContext() as {
    userDetails: UserData;
  };

  const [userMessage, setUserMessage] = useState<string>("");
  const scrollDiv = useRef(null);

  useEffect(() => {
    // Scroll to the element when the component mounts
    if (scrollDiv.current) {
      (scrollDiv.current as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }, [messageData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(event.target.value);
  };

  const handleMessageSend = async () => {
    const messageSend = {
      message: userMessage,
      senderId: userDetails?.id || "",
      senderName: userDetails?.name || "",
      isOurs: true,
      type: "From User",
      recipient: selectedUser.userId,
      createdAt: "",
    };
    if (userMessage !== "") handleMessageData(messageSend);
    setUserMessage("");
  };

  return (
    <div className="d-flex flex-column h-100 p-3">
      <div className="flex-fill">
        {isLoading ? (
          <div
            style={{ height: "85dvh", overflow: "auto" }}
            className="d-flex justify-content-center align-items-center"
          >
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <div style={{ height: "85dvh", overflow: "auto" }}>
            {messageData?.map((message: MessageData, index: number) => {
              return (
                <div
                  className={
                    message.isOurs
                      ? "d-flex justify-content-end my-2"
                      : "d-flex justify-content-start my-2"
                  }
                  key={index}
                >
                  <div
                    className={
                      message.isOurs
                        ? "p-2 bg-light"
                        : "p-2 bg-primary text-white"
                    }
                    style={{
                      maxWidth: "75%",
                      borderRadius: "16px",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    {message.message}
                  </div>
                </div>
              );
            })}
            <div ref={scrollDiv} />
          </div>
        )}
      </div>
      <div
        className="w-100 messageBox d-flex align-items-center p-2"
        style={{ border: "1px solid #d7d7d7", borderRadius: "15px" }}
      >
        <input
          placeholder="Message..."
          value={userMessage}
          onChange={handleChange}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleMessageSend();
            }
          }}
        />
        {userMessage?.length >= 1 && (
          <span
            className="text-primary fw-bold"
            style={{ cursor: "pointer" }}
            onClick={handleMessageSend}
          >
            Send
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
