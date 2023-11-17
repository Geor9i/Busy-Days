import FormUtil from "../../utils/formUtil.js";
import styles from "./login.module.css";
import { useContext, useState } from "react";
import { useNavigate  } from "react-router-dom";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";

const formUtil = new FormUtil();
const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { auth, setLoading } = useContext(GlobalCtx);
  function changeHandler(e) {
    e.preventDefault();
    const { name, value } = e.currentTarget;
    setFormData((state) => ({ ...state, [name]: value }));
  }
  function submitHandler(e) {
    e.preventDefault();
    setLoading(true);
    let { email, password } = formData;
    try {
      if (formUtil.formValidator(formData)) {
        signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;
            navigate("/");
            setLoading(false);
          })
          .catch((error) => {
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

export default LoginPage;
