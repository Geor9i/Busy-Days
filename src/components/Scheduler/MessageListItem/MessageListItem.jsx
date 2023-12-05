import styles from "./messageListitem.module.css";

export default function MessageListItem() {
  return (
    <>
     

      <div className={styles["list-item-container"]}>
        <div className={styles["message-td"]}>
          <p>Thursday</p>
        </div>
        <div className={styles["message-td"]}>
          <p>Sean</p>
        </div>
        <div className={styles["message-td"]}>
          <p>Can't work more than 12 hours!</p>
        </div>
      </div>
    </>
  );
}
