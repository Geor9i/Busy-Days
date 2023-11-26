import { useState } from "react";

import styles from "./confirmModal.module.css";

export default function ConfirmModalDeployer({
  content,
  style,
  onHoverStyle,
  handler,
}) {
  content = content ? content : { title: "", confirm: "", cancel: "" };
  const { title, confirm, cancel } = content;

  onHoverStyle = onHoverStyle
    ? onHoverStyle
    : {
        confirm: {},
        cancel: {},
      };
  const [hoverStyle, setHoverStyle] = useState(onHoverStyle);
  const [displayModal, setDisplayModal] = useState(false);
  const [modalData, setModalData] = useState(null)

  style = style ? style : {};
  handler = handler ? handler : () => {};

  const onHoverHandler = (e) => {
    const button = e.currentTarget.id.split("-")[0];
    if (Object.keys(hoverStyle).length > 0) {
      setHoverStyle((state) => ({
        ...state,
        [button]: { ...onHoverStyle[button] },
      }));
    }
  };

  function toggleConfirm () {
    setDisplayModal(state => ! state)
  }

  const onMouseOutHandler = (e) => {
    const button = e.currentTarget.id.split("-")[0];
    if (Object.keys(hoverStyle).length > 0) {
      setHoverStyle((state) => ({
        ...state,
        [button]: {},
      }));
    }
  };

  function ConfirmModal() {


        if (modalData !== null && displayModal) {
            setDisplayModal(false)
            handler(modalData)
        } else if (displayModal) {
            return (
                <>
                  <div style={style} className={styles["confirm-modal"]}>
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
                        onClick={(e) => select(e)}
                      >
                        {confirm}
                      </button>
                      <button
                        style={hoverStyle.cancel}
                        className={styles["cancel-btn"]}
                        id="cancel-btn"
                        onMouseOver={onHoverHandler}
                        onMouseOut={onMouseOutHandler}
                        onClick={(e) => select(e)}
                      >
                        {cancel}
                      </button>
                    </div>
                  </div>
                  <div
                    onClick={toggleConfirm}
                    className={styles["confirm-modal-backdrop"]}
                  ></div>
                </>
              );
        }
  };

  function select(e) {
    const id = e.target.id
    console.log(id);
  }

  return {ConfirmModal, toggleConfirm}
}
