import styles from "./modal.module.css";

export default function Modal({
  customStyles = {},
  changeState,
  children,
  id
}) {


  return (
    <>
         
      <div style={customStyles} id={id ? id : null} className={styles["modal-container"]}>
        {children}
      </div>
      <div onClick={changeState} className={styles["modal-backdrop"]}></div>
    </>
  );
}
