import { ReactNode } from "react";
import type { MenuProps } from "antd";
import { Dropdown } from "antd";
import { UserData, useUserContext } from "../context/userContext";

interface UserDetailsProps {
  children: ReactNode;
  UserAvatar: () => ReactNode;
}

const UserDetails = ({ UserAvatar, children }: UserDetailsProps) => {
  const { userDetails, signOutUser } = useUserContext() as {
    userDetails: UserData;
    signOutUser: () => Promise<boolean>;
  };

  const DetailsSection = () => {
    return (
      <div className="d-flex gap-3 p-2 flex-column">
        <div className="d-flex gap-2">
          <UserAvatar />
          <div className="d-flex flex-column">
            <span className="fw-bold">{userDetails?.name}</span>
            <small>{userDetails?.email}</small>
          </div>
        </div>
        <button
          className="p-2 bg-danger text-white rounded"
          onClick={() => {
            signOutUser();
          }}
        >
          Sign Out
        </button>
      </div>
    );
  };

  const items: MenuProps["items"] = [
    {
      label: <DetailsSection />,
      key: "0",
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <a onClick={(e) => e.preventDefault()}>{children}</a>
    </Dropdown>
  );
};

export default UserDetails;
