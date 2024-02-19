import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, useUserContext } from "../context/userContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { loginUser, errorMessage } = useUserContext() as {
    loginUser: (user: User) => Promise<boolean>;
    errorMessage: string;
  };
  const navigate = useNavigate();

  const handleFormData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await loginUser(formData);
    if (response) {
      setFormData({
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
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            required
            type="email"
            className="form-control"
            id="email"
            name="email"
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
        <button className="bg-success p-2 rounded text-white">Login</button>
        <div className="d-flex justify-content-between">
          <span>New here?</span>
          <Link to={"/signup"}>Create Account</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
