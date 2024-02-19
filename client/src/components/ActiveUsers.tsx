import { ConfigProvider, Segmented } from "antd";
import { UserData, useUserContext } from "../context/userContext";
import ActiveUserList from "./ActiveUserList";
import { UserList } from "./LandingSection";
import { useState } from "react";

export interface ActiveUsersProps {
  allUsers: UserList[];
  activeUsers: UserList[];
  selectedUser: UserList;
  handleClick: (user: UserList) => void;
}

const ActiveUsers = ({
  allUsers,
  activeUsers,
  selectedUser,
  handleClick,
}: ActiveUsersProps) => {
  const { userDetails } = useUserContext() as {
    userDetails: UserData;
  };
  const [isAllUser, setIsAllUser] = useState<boolean>(false);

  return (
    <div
      className="bg-white h-100"
      style={{ borderRight: "1px solid #d7d7d7" }}
    >
      <div className="d-flex flex-column gap-2 p-2">
        <h4 className="m-0">{userDetails?.name}</h4>
        <span style={{ fontSize: "16px", fontWeight: 600 }}>Messages</span>
        <ConfigProvider
          theme={{
            components: {
              Segmented: {
                itemSelectedBg: "#0d6efd",
                itemSelectedColor: "#ffffff",
              },
            },
            token: {
              fontSize: 16,
              fontWeightStrong: 600,
            },
          }}
        >
          <Segmented
            options={["Active", "All Users"]}
            block
            onChange={(value) => {
              handleClick({ userId: "", userEmail: "", userName: "" });
              if (value == "Active") setIsAllUser(false);
              else setIsAllUser(true);
            }}
          />
        </ConfigProvider>
      </div>
      <ActiveUserList
        allUsers={isAllUser}
        activeUsers={isAllUser ? allUsers : activeUsers}
        selectedUser={selectedUser}
        handleClick={handleClick}
      />
    </div>
  );
};

export default ActiveUsers;
