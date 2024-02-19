import { Avatar } from "antd";
import { getRandomColor, getStartingLetters } from "./Header";
import { UserList } from "./LandingSection";

interface ActiveUsersProps {
  allUsers: boolean;
  activeUsers: UserList[];
  selectedUser: UserList;
  handleClick: (user: UserList) => void;
}

const ActiveUserList = ({
  activeUsers,
  selectedUser,
  handleClick,
}: ActiveUsersProps) => {
  return (
    <div className="d-flex flex-column gap-2 p-2 pt-0">
      {activeUsers?.map((user) => {
        return (
          <div
            className="d-flex gap-2 p-2"
            key={user.userId}
            onClick={() => handleClick(user)}
            style={{
              backgroundColor:
                user.userId === selectedUser?.userId ? "#e6e6e6" : "",
            }}
          >
            <Avatar
              style={{
                backgroundColor: getRandomColor(),
                verticalAlign: "middle",
              }}
              size={44}
            >
              {getStartingLetters(user.userName)}
            </Avatar>
            <div className="d-flex flex-column justify-content-center">
              <span style={{ fontSize: "16px", fontWeight: 600 }}>
                {user?.userName}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActiveUserList;
