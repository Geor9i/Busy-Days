import FormUtil from "../../utils/formUtil.js";
import styles from "./signUp.module.css";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import useForm from "../../hooks/useForm.js";

const SignUpPage = () => {
  const navigate = useNavigate();
  const formUtil = new FormUtil();

  const formKeys = formUtil.formKeys({
    formKeys: ["firstName", "lastName", "email", "password", "repeatPassword"],
  });
  const initialValues = formUtil.formKeys({ formKeys, empty: true });
  const { fireService, setLoading } = useContext(GlobalCtx);
  const { formData, onChange, onSubmit } = useForm(
    initialValues,
    submitHandler
  );

  async function submitHandler({ formData }) {
    setLoading(true);
    let { email, password, firstName, lastName } = formData;
    try {
      formUtil.formValidator(formData, 6, "repeatPassword");
    } catch (err) {
      console.log("Sign up err :", err);
    }
    fireService
      .register(email, password)
      .then(() =>
        fireService.updateProfile({ displayName: `${firstName} ${lastName}` })
      )
      .then(() => navigate("/"))
      .catch((err) => console.log("SignUp Error: ", err))
      .finally(setLoading(false));
  }

  return (
    <>
      <form onSubmit={onSubmit} className={styles["form"]} method="POST">
        <div className={styles["input-div"]}>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData[formKeys.firstName]}
            onChange={onChange}
          />
        </div>
        <div className={styles["input-div"]}>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData[formKeys.lastName]}
            onChange={onChange}
          />
        </div>
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
          <label htmlFor="repeatPassword">Repeat Password</label>
          <input
            type="password"
            name="repeatPassword"
            value={formData[formKeys.repeatPassword]}
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

export default SignUpPage;
