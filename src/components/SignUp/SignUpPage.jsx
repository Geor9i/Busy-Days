import FormUtil from "../../utils/formUtil.js";
import styles from "./signUp.module.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { app } from "../../App.jsx";

const formUtil = new FormUtil();

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  function changeHandler(e) {
    e.preventDefault();
    const { name, value } = e.currentTarget;
    setFormData((state) => ({ ...state, [name]: value }));
  }
  async function submitHandler(e) {
    e.preventDefault();
    let { email, password, firstName, lastName } = formData;
    try {
      if (formUtil.formValidator(formData, 6, "repeatPassword")) {
        const auth = getAuth(app);
          await createUserWithEmailAndPassword(auth, email, password);
          const profile = await updateProfile(auth.currentUser, {
            displayName: `${firstName} ${lastName}`,
          });
          console.log(profile);
          navigate("/");
      }
    } catch (err) {
      alert(err);
    }
  }

  return (
    <>
      <form onSubmit={submitHandler} className={styles["form"]} method="POST">
        <div className={styles["input-div"]}>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={changeHandler}
          />
        </div>
        <div className={styles["input-div"]}>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={changeHandler}
          />
        </div>
        <div className={styles["input-div"]}>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={changeHandler}
          />
        </div>
        <div className={styles["input-div"]}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={changeHandler}
          />
        </div>
        <div className={styles["input-div"]}>
          <label htmlFor="repeatPassword">Repeat Password</label>
          <input
            type="password"
            name="repeatPassword"
            value={formData.reapeatPassword}
            onChange={changeHandler}
          />
        </div>
        <div className={styles["input-div"]}>
          <input className={styles["submit"]} type="submit" value="Login" />
        </div>
      </form>
    </>
  );
};

export default SignUpPage;
