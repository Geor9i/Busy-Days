import { useState } from "react";
import styles from "./addSubstitutesModal.module.css";

const AddSubstitutesModal = ({ positions, displayModal, handler, index }) => {
  const [substitutes, setSubstitutes] = useState(positions);

  const getFormData = (e) => {
    e.preventDefault();
    const data = Object.keys(substitutes)
      .map((role) => (substitutes[role] ? role : false))
      .filter((el) => el);
    handler({ data, index });
  };

  const onChangeHandler = (e) => {
    const element = e.target;
    setSubstitutes((state) => ({ ...state, [element.name]: element.checked }));
  };

  return (
    <>
      <form onSubmit={getFormData} className={styles["modal-container"]}>
        <div className={styles["list-container"]}>
          {positions && Object.keys(positions).length > 0 ? (
            <ul>
              {Object.keys(positions).map((pos) => (
                <li key={pos}>
                  <div className={styles["list-item-container"]}>
                    <p>{pos}</p>
                    <input
                      type="checkbox"
                      checked={substitutes[pos]}
                      onChange={onChangeHandler}
                      name={pos}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles["list-center"]}>
              <p> There are no higher positions available!</p>
            </div>
          )}
        </div>
        {positions && Object.keys(positions).length > 0 ? (
          <button className={styles["confirm-btn"]}>Confirm</button>
        ) : (
          <button
            className={styles["confirm-btn"]}
            onClick={(e) => displayModal(e)}
          >
            Exit
          </button>
        )}
      </form>
      <div
        className={styles["backdrop"]}
        onClick={(e) => displayModal(e)}
      ></div>
    </>
  );
};
export default AddSubstitutesModal;
