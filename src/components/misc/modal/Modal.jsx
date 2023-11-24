import { useState } from "react";
import styles from "./modal.module.css";

export default function Modal({
  customStyles = {},
  changeState,
  children,
  confirmModal = {},
}) {
  confirmModal.content = confirmModal.content
    ? confirmModal.content
    : { title: "", confirm: "", cancel: "" };
  const { title, confirm, cancel } = confirmModal.content;

  confirmModal.onHoverStyle = confirmModal.onHoverStyle
    ? confirmModal.onHoverStyle
    : {
        confirm: {},
        cancel: {},
      };

  confirmModal.style = confirmModal.style ? confirmModal.style : {}; 

  const [hoverStyle, setHoverStyle] = useState(confirmModal.onHoverStyle);

  const onHoverHandler = (e) => {
    const button = e.currentTarget.id.split("-")[0];
    if (Object.keys(hoverStyle).length > 0) {
      setHoverStyle((state) => ({
        ...state,
        [button]: { ...confirmHoverStyle[button] },
      }));
    }
  };

  const onMouseOutHandler = (e) => {
    const button = e.currentTarget.id.split("-")[0];
    if (Object.keys(hoverStyle).length > 0) {
      setHoverStyle((state) => ({
        ...state,
        [button]: {},
      }));
    }
  };

  return (
    <>
      <div style={confirmModal.style} className={styles["confirm-modal"]}>
        <div className={styles["header"]}>
          <h2 className={styles["header-title"]}>{title}</h2>
        </div>
        <div className={styles["buttons-container"]}>
          <button
            style={hoverStyle.confirm}
            className={styles["confirm-btn"]}
            id="confirm-btn"
            onMouseOver={onHoverHandler}
            onMouseOut={onMouseOutHandler}
          >{confirm}</button>
          <button
            style={hoverStyle.cancel}
            className={styles["cancel-btn"]}
            id="cancel-btn"
            onMouseOver={onHoverHandler}
            onMouseOut={onMouseOutHandler}
          >{cancel}</button>
        </div>
      </div>
      <div style={customStyles} className={styles["modal-container"]}>
        {children}
      </div>
      <div onClick={changeState} className={styles["modal-backdrop"]}></div>
    </>
  );
}
