import axios from "axios";
import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

const UserContext = createContext({});

export type User = {
  username?: string;
  email: string;
  password: string;
};

export type UserData =
  | {
      id: string;
      name: string;
      email: string;
      isLoggedin?: boolean;
    }
  | undefined;

class UserDetails {
  id: string;
  name: string;
  email: string;
  isLoggedin: boolean;

  constructor(id: string, name: string, email: string, isLoggedin: boolean) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.isLoggedin = isLoggedin;
  }
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userDetails, setUserDetails] = useState(
    new UserDetails("", "", "", false)
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    verifyUser();
  }, []);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const verifyUser = async (): Promise<void> => {
    try {
      const response = await axios.get("/users/verifyUser", {
        withCredentials: true,
      });
      const responseData = response.data;
      console.log(responseData);
      const { userId, userName, userEmail } = responseData;
      setUserDetails(new UserDetails(userId, userName, userEmail, true));
      setErrorMessage("");
    } catch (error) {
      console.log("Verify User Failed", error);
    }
  };

  const loginUser = async (user: User): Promise<boolean> => {
    try {
      const response = await axios.post("/users/login", user);
      const responseData = response.data.user;
      console.log(responseData);
      const { userId, userName, userEmail } = responseData;
      setUserDetails(new UserDetails(userId, userName, userEmail, true));
      setErrorMessage("");
      return true;
    } catch (error: any) {
      console.log("Login Failed", error);
      if (error?.response) {
        setErrorMessage(error.response.data.message);
      }
      return false;
    }
  };

  const signOutUser = async (): Promise<boolean> => {
    try {
      const response = await axios.post("/users/signout", {});
      const responseData = response;
      console.log(responseData);
      setUserDetails(new UserDetails("", "", "", false));
      return true;
    } catch (error: any) {
      console.log("Login Failed", error);
      return false;
    }
  };

  const createUser = async (user: User): Promise<boolean> => {
    try {
      const response = await axios.post("/users/createNew", user);
      console.log("User created successfully:", response.data);
      const responseData = response.data.user;
      const { userId, userName, userEmail } = responseData;
      setUserDetails(new UserDetails(userId, userName, userEmail, true));
      return true;
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error?.response) {
        setErrorMessage(error.response.data.message);
      }
      return false;
    }
  };

  console.log(userDetails);
  return (
    <UserContext.Provider
      value={{
        errorMessage,
        userDetails,
        createUser,
        loginUser,
        signOutUser,
        onClose,
        showDrawer,
        open
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
