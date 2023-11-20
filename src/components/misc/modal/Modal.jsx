import styles from "./modal.module.css";

export default function Modal({ customStyles = {}, changeState, children }) {

  return (
    <>
      <div style={customStyles} className={styles["modal-container"]}>
      {children}
      </div>
      <div onClick={changeState} className={styles["modal-backdrop"]}></div>
    </>
  );
}
