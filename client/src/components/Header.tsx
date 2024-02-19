import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { UserData, useUserContext } from "../context/userContext";
import UserDetails from "./UserDetails";
import logo from "../assets/messanger.svg";
import { Link } from "react-router-dom";

export function getStartingLetters(sentence: string): string {
  const words = sentence.split(" ");
  const firstWord = words[0] ? words[0][0] : "";
  const secondWord = words[1] ? words[1][0] : "";
  return [firstWord, secondWord].join("").toUpperCase();
}

export function getRandomColor(): string {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);
  const hexColor = `#${red.toString(16).padStart(2, "0")}${green
    .toString(16)
    .padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

  return hexColor;
}

const Header = () => {
  const { userDetails } = useUserContext() as {
    userDetails: UserData;
  };

  const UserAvatar = () => {
    return (
      <Avatar
        style={{
          backgroundColor: getRandomColor(),
          verticalAlign: "middle",
        }}
        size={44}
      >
        {getStartingLetters(userDetails?.name || "")}
      </Avatar>
    );
  };

  return (
    <header
      className="bg-white p-2 d-none d-lg-block"
      style={{ borderRight: "1px solid #d7d7d7" }}
    >
      <div className="text-white d-flex flex-column justify-content-between h-100">
        <Link to={"/"}>
          <img src={logo} width={44} />
        </Link>
        {userDetails?.isLoggedin ? (
          <UserDetails UserAvatar={UserAvatar}>
            <div className="d-flex align-items-center gap-2 userDetails">
              <UserAvatar />
            </div>
          </UserDetails>
        ) : (
          <Avatar size={44} icon={<UserOutlined />} />
        )}
      </div>
    </header>
  );
};

export default Header;
