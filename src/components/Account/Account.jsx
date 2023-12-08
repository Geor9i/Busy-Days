import { useContext, useEffect, useState } from "react";
import styles from "./account.module.css";
import { GlobalCtx } from "../../contexts/GlobalCtx.js";
import useForm from "../../hooks/useForm.js";
import { useNavigate } from "react-router-dom";
import LoginModal from "./modals/LoginModal.jsx";
import Modal from "../misc/modal/Modal.jsx";
import {
  BUSINESS_KEY,
  CLIENTS_KEY,
  MASTER_KEY,
  ROSTER_KEY,
  GUEST_KEY,
  EVENTS_KEY,
} from "../../../config/constants.js";

export default function Account() {
  const { fireService, setMainLoader, userData } = useContext(GlobalCtx);
  const navigate = useNavigate();
  const user = fireService.auth.currentUser;
  const email = user.email;
  const [firstName, lastName] = user.displayName
    .split(" ")
    .map((el) => el.trim());

  const [loginModal, setLoginModal] = useState(false);

  const [confirmLoginForDelete, setConfirmLoginForDelete] = useState(false);

  const formKeys = {
    EMAIL: "email",
    FIRST_NAME: "firstName",
    LAST_NAME: "lastName",
    CURRENT_PASSWORD: "currentPassword",
    NEW_PASSWORD: "password",
    REPEAT_PASSWORD: "repeatPassword",
  };

  const initialValues = {
    [formKeys.EMAIL]: email,
    [formKeys.FIRST_NAME]: firstName,
    [formKeys.LAST_NAME]: lastName,
    [formKeys.CURRENT_PASSWORD]: "",
    [formKeys.NEW_PASSWORD]: "",
    [formKeys.REPEAT_PASSWORD]: "",
  };

  function setDeleteConfirmation(hasConfirm) {
    if (hasConfirm) {
      setConfirmLoginForDelete(true);
    } else {
      setConfirmLoginForDelete(false);
      toggleLoginModal();
    }
  }

  async function submitHandler({ formData }) {
    formUtil.formValidator(formData, 6, "repeatPassword");
    try {
      const authenticatedUser = await fireService.reAuthenticate(
        formData.currentPassword
      );
      if (authenticatedUser) {
        await fireService.updateEmail(formData[formKeys.EMAIL].trim());
        await fireService.updateProfile({
          displayName: `${formData[formKeys.FIRST_NAME].trim()} ${formData[
            formKeys.LAST_NAME
          ].trim()}`,
        });
        await fireService.updatePassword(formData[formKeys.NEW_PASSWORD]);
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function deleteAccount() {
    try {
      const publicId = userData?.[BUSINESS_KEY]?.publicId;
      await fireService.deleteDoc(BUSINESS_KEY);
      await fireService.deleteDoc(ROSTER_KEY);
      await fireService.deleteDoc(EVENTS_KEY);
      if (publicId) {
        await fireService.deletePublicField(publicId);
      }
      await fireService.deleteAccount();
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    if (confirmLoginForDelete) {
      setMainLoader(true);
      toggleLoginModal();

      deleteAccount()
        .then(() => navigate("/"))
        .catch((err) => console.log(err))
        .finally(() => setMainLoader(false));
    } else {
      // console.log("Account information is not correct!");
    }
  }, [confirmLoginForDelete]);

  async function toggleLoginModal() {
    setLoginModal((state) => !state);
  }

  const modalStyles = {
    width: "30rem",
    height: "18rem",
    border: "1px solid black",
    borderRadius: "13px",
  };

  const { formData, onChange, onSubmit } = useForm(
    initialValues,
    submitHandler
  );

  return (
    <>
      {loginModal && (
        <Modal changeState={toggleLoginModal} customStyles={modalStyles}>
          <LoginModal setDeleteConfirmation={setDeleteConfirmation} />
        </Modal>
      )}
      <section className={styles["page-container"]}>
        <h2>
          {" "}
          Update your details seamlessly to ensure everything reflects your
          latest information accurately.
        </h2>
        <div className={styles["account-container"]}>
          <form onSubmit={onSubmit} className={styles["form"]}>
            <div className={styles["input-container"]}>
              <label htmlFor={formKeys.EMAIL}>Email</label>
              <input
                type="text"
                onChange={onChange}
                value={formData[formKeys.EMAIL]}
                name={formKeys.EMAIL}
              />
            </div>
            <div className={styles["input-container"]}>
              <label htmlFor={formKeys.FIRST_NAME}>First Name</label>
              <input
                type="text"
                onChange={onChange}
                value={formData[formKeys.FIRST_NAME]}
                name={formKeys.FIRST_NAME}
              />
            </div>
            <div className={styles["input-container"]}>
              <label htmlFor={formKeys.LAST_NAME}>Last Name</label>
              <input
                type="text"
                onChange={onChange}
                value={formData[formKeys.LAST_NAME]}
                name={formKeys.LAST_NAME}
              />
            </div>
            <div className={styles["input-container"]}>
              <label htmlFor={formKeys.CURRENT_PASSWORD}>
                Current Password
              </label>
              <input
                type="password"
                onChange={onChange}
                value={formData[formKeys.CURRENT_PASSWORD]}
                name={formKeys.CURRENT_PASSWORD}
              />
            </div>
            <div className={styles["input-container"]}>
              <label htmlFor={formKeys.NEW_PASSWORD}>New Password</label>
              <input
                type="password"
                onChange={onChange}
                value={formData[formKeys.NEW_PASSWORD]}
                name={formKeys.NEW_PASSWORD}
              />
            </div>
            <div className={styles["input-container"]}>
              <label htmlFor={formKeys.REPEAT_PASSWORD}>
                Repeat New Password
              </label>
              <input
                type="password"
                onChange={onChange}
                value={formData[formKeys.REPEAT_PASSWORD]}
                name={formKeys.REPEAT_PASSWORD}
              />
            </div>
            <button className={styles["submit-btn"]}>Update Details</button>
          </form>
        </div>

        <div className={styles["delete-account-container"]}>
          <p>
            "Hey, if you're ready to part ways with your account, just hit the
            button below to bid it farewell. We'll handle the rest! 🚀"
          </p>
          <button
            onClick={toggleLoginModal}
            className={styles["delete-account-btn"]}
          >
            Delete Account
          </button>
        </div>
      </section>
    </>
  );
}
