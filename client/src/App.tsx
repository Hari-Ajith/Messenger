import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import axios from "axios";
import LandingSection from "./components/LandingSection";
import { UserData, useUserContext } from "./context/userContext";
import menuIcon from "./assets/menu.svg";
import logo from "./assets/messanger.svg";
import close from "./assets/close.svg";

function App() {
  axios.defaults.baseURL = "http://localhost:5000";
  axios.defaults.withCredentials = true;

  const { userDetails, showDrawer, open, onClose } = useUserContext() as {
    userDetails: UserData;
    showDrawer: () => void;
    open: boolean;
    onClose: () => void; 
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {};

  return (
    <div className="d-flex">
      {userDetails?.isLoggedin && <Header />}
      <main style={{ height: "100dvh" }} className="flex-fill">
        <header className="p-2 bg-white fixed-top text-dark d-flex d-lg-none justify-content-between">
          <img src={logo} width={32} />
          {open ? (
            <img src={close} width={32} onClick={onClose} />
          ) : (
            <img src={menuIcon} width={32} onClick={showDrawer} />
          )}
        </header>
        <Routes>
          <Route
            path="/"
            element={userDetails?.isLoggedin ? <LandingSection /> : <Login />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
