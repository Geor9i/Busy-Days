import FormUtil from "../../utils/formUtil.js";
import styles from "./login.module.css";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import useForm from "../../hooks/useForm.js";

const LoginPage = () => {
  const navigate = useNavigate();
  const formUtil = new FormUtil();
  const formKeys = formUtil.formKeys({ formKeys: ["email", "password"] });
  const initialValues = formUtil.formKeys({ formKeys, empty: true });
  const { formData, onChange, onSubmit } = useForm(
    initialValues,
    submitHandler
  );
  const { fireService, setMainLoader } = useContext(GlobalCtx);

  function submitHandler({ formData }) {
    setMainLoader(true);
    let { email, password } = formData;
    try {
      formUtil.formValidator(formData);
    } catch (err) {
      console.log("Login err :", err);
    }
    fireService
      .login(email, password)
      .then(() => navigate("/"))
      .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
      })
      .finally(() => setMainLoader(false));
  }

  return (
    <>
      <form onSubmit={onSubmit} className={styles["form"]} method="POST">
        <div className={styles["input-div"]}>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            name="email"
            value={formData[formKeys.email]}
            onChange={onChange}
          />
        </div>
        <div className={styles["input-div"]}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            value={formData[formKeys.password]}
            onChange={onChange}
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
