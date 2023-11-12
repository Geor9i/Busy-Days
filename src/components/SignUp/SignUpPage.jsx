import { FormUtil } from "../../../utils/formUtil.js";
import styles from "./signUp.module.css";
import { useState } from "react";
import { useNavigate  } from "react-router-dom";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const formUtil = new FormUtil();

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repeatPassword: "",
  });

  function changeHandler(e) {
    e.preventDefault();
    const { name, value } = e.currentTarget;
    setFormData((state) => ({ ...state, [name]: value }));
    console.log(value);
  }
  function submitHandler(e) {
    e.preventDefault();
    let { email, password } = formData;
    try {
      if (formUtil.formValidator(formData, 6, 'repeatPassword')) {
        const auth = getAuth();
       createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            navigate("/");
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
          });
      }
    } catch (err) {
      alert(err);
    }
  }

  return (
    <>
      <form onSubmit={submitHandler} className={styles["form"]} method="POST">
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
            onChange={changeHandler}/>
        </div>
        <div className={styles["input-div"]}>
          <label htmlFor="repeatPassword">Repeat Password</label>
          <input
            type="password"
            name="repeatPassword"
            value={formData.reapeatPassword}
            onChange={changeHandler}/>
        </div>
        <div className={styles["input-div"]}>
          <input className={styles["submit"]} type="submit" value="Login" />
        </div>
      </form>
    </>
  );
};

export default SignUpPage;
