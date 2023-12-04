import { GlobalCtx } from "../../../contexts/GlobalCtx.js";
import useForm from "../../../hooks/useForm.js";
import FormUtil from "../../../utils/formUtil.js";
import styles from "./loginModal.module.css";
import { useContext } from "react";

export default function LoginModal({ setDeleteConfirmation }) {
  const formUtil = new FormUtil();
  const formKeys = formUtil.formKeys({ formKeys: ["email", "password"] });
  const initialValues = formUtil.formKeys({ formKeys, empty: true });
  const { formData, onChange, onSubmit } = useForm(
    initialValues,
    submitHandler
  );
  const { fireService } = useContext(GlobalCtx);

  async function submitHandler({ formData }) {
    let { email, password } = formData;
    try {
      formUtil.formValidator(formData);
      await fireService.reAuthenticate(password, email);
      setDeleteConfirmation(true);
    } catch (err) {
      console.log("Login err :", err);
      setDeleteConfirmation(false);
    }
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
          <input className={styles["submit-btn"]} type="submit" value="Login" />
        </div>
      </form>
    </>
  );
}
