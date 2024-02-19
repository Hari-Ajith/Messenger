import { FormEvent, useState } from "react";
import { User, useUserContext } from "../context/userContext";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const { createUser, errorMessage } = useUserContext() as {
    createUser: (user: User) => Promise<any>;
    errorMessage: string;
  };

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleFormData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await createUser(formData);
    if (response) {
      setFormData({
        username: "",
        email: "",
        password: "",
      });
      navigate("/");
    }
  };

  return (
    <div className="d-flex justify-content-center h-100">
      <form
        className="d-flex flex-column align-self-center gap-3 rounded border p-5"
        onSubmit={handleSubmit}
      >
        <span className="text-center">Create your Account</span>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            required
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleFormData}
          />
        </div>
        <div className="form-group">
          <label htmlFor="emil">Email</label>
          <input
            required
            id="email"
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleFormData}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            required
            id="password"
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleFormData}
          />
        </div>
        {errorMessage && <span className="text-danger">{errorMessage}</span>}
        <button className="bg-success p-2 rounded text-white">Sign Up</button>
        <div className="d-flex justify-content-between">
          <span>Already registered</span>
          <Link to={"/login"}>Login</Link>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
