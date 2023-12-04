import { useContext } from "react";
import styles from "./account.module.css";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import useForm from "../../hooks/useForm.js";

export default function Account() {
  const { fireService } = useContext(GlobalCtx);
  const user = fireService.auth.currentUser;
  const email = user.email
  const [firstName, lastName] = user.displayName.split(' ').map(el => el.trim());

  const formKeys = {
    EMAIL: 'email',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    CURRENT_PASSWORD: 'currentPassword',
    NEW_PASSWORD: 'newPassword',
    REPEAT_PASSWORD: 'repeatPassword',
  } 

  const initialValues = {
    [formKeys.EMAIL]: email,
    [formKeys.FIRST_NAME]: firstName,
    [formKeys.LAST_NAME]: lastName,
    [formKeys.CURRENT_PASSWORD]: '',
    [formKeys.NEW_PASSWORD]: '',
    [formKeys.REPEAT_PASSWORD]: '',

  }

  function submitHandler () {

  }

  const {formData, onChange, onSubmit} = useForm(initialValues, submitHandler)


  return (
    <>
      <div className={styles["account-container"]}>
        <form onSubmit={submitHandler} className={styles["form"]}>
          <div className={styles["input-container"]}>
            <label htmlFor={formKeys.EMAIL}>Email</label>
            <input type="text" onChange={onChange} value={formData[formKeys.EMAIL]} name={formKeys.EMAIL} />
          </div>
          <div className={styles["input-container"]}>
            <label htmlFor={formKeys.FIRST_NAME}>First Name</label>
            <input type="text" onChange={onChange} value={formData[formKeys.FIRST_NAME]} name={formKeys.FIRST_NAME} />
          </div>
          <div className={styles["input-container"]}>
            <label htmlFor={formKeys.LAST_NAME}>Last Name</label>
            <input type="text" onChange={onChange} value={formData[formKeys.LAST_NAME]} name={formKeys.LAST_NAME} />
          </div>
          <div className={styles["input-container"]}>
            <label htmlFor={formKeys.CURRENT_PASSWORD}>Current Password</label>
            <input type="password" onChange={onChange} value={formData[formKeys.CURRENT_PASSWORD]} name={formKeys.CURRENT_PASSWORD}/>
          </div>
          <div className={styles["input-container"]}>
            <label htmlFor={formKeys.NEW_PASSWORD}>New Password</label>
            <input type="password" onChange={onChange} value={formData[formKeys.NEW_PASSWORD]} name={formKeys.NEW_PASSWORD} />
          </div>
          <div className={styles["input-container"]}>
            <label htmlFor={formKeys.REPEAT_PASSWORD}>Repeat New Password</label>
            <input type="password" onChange={onChange} value={formData[formKeys.REPEAT_PASSWORD]} name={formKeys.REPEAT_PASSWORD} />
          </div>
          <button className={styles['submit-btn']} >Update Details</button>
        </form>
      </div>
    </>
  );
}
