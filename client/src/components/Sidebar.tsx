import { Drawer } from "antd";
import { UserData, useUserContext } from "../context/userContext";

interface SibeBarProps {
  onClose: () => void;
  open: boolean;
  children: JSX.Element;
}

const Sidebar = ({ onClose, open, children }: SibeBarProps) => {
  const { userDetails, signOutUser } = useUserContext() as {
    userDetails: UserData;
    signOutUser: () => Promise<boolean>;
  };

  return (
    <Drawer
      open={open}
      key={"left"}
      placement={"left"}
      closable={false}
      onClose={onClose}
      footer={
        <>
          {userDetails?.isLoggedin && (
            <button
              className="p-2 bg-danger text-white rounded"
              onClick={() => {
                signOutUser();
              }}
            >
              Sign Out
            </button>
          )}
        </>
      }
    >
      <div className="mt-4">{children}</div>
    </Drawer>
  );
};

export default Sidebar;
