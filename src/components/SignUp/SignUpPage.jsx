import FormUtil from "../../utils/formUtil.js";
import styles from "./signUp.module.css";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  const formUtil = new FormUtil();

  const { auth, setLoading } = useContext(GlobalCtx);

  function changeHandler(e) {
    e.preventDefault();
    const { name, value } = e.currentTarget;
    setFormData((state) => ({ ...state, [name]: value }));
  }
  async function submitHandler(e) {
    e.preventDefault();
    setLoading(true);
    let { email, password, firstName, lastName } = formData;
    try {
      if (formUtil.formValidator(formData, 6, "repeatPassword")) {
        await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(auth.currentUser, {
          displayName: `${firstName} ${lastName}`,
        });
        navigate("/");
        setLoading(false);
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
            value={formData.repeatPassword}
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
