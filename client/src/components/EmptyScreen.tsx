import logo from "../assets/messanger.svg";

const EmptyScreen = () => {
  return (
    <div className="h-100 d-flex justify-content-center align-items-center">
      <div className="d-flex align-items-center flex-column">
        <img src={logo} width={64} />
        <h3>Your messages</h3>
        <span>Send private messages to a friend or group.</span>
      </div>
    </div>
  );
};

export default EmptyScreen;
